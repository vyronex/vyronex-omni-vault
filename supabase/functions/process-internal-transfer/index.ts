import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TransferPayload {
  recipient_id: string;
  token_symbol: string;
  amount: number;
  tx_id?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // ── Authenticate caller ─────────────────────────────────────────────
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Unauthorized" }, 401);
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsErr } = await userClient.auth.getClaims(token);
    if (claimsErr || !claimsData?.claims?.sub) {
      return json({ error: "Unauthorized" }, 401);
    }
    const senderId = claimsData.claims.sub as string;

    // ── Parse + validate input ──────────────────────────────────────────
    const body = (await req.json()) as TransferPayload;
    const recipient_id = String(body.recipient_id ?? "").trim();
    const token_symbol = String(body.token_symbol ?? "").trim().toUpperCase();
    const amount = Number(body.amount);
    const tx_id = body.tx_id ? String(body.tx_id) : null;

    if (!recipient_id || !/^[0-9a-f-]{36}$/i.test(recipient_id)) {
      return json({ error: "Invalid recipient_id" }, 400);
    }
    if (!token_symbol || token_symbol.length > 10) {
      return json({ error: "Invalid token_symbol" }, 400);
    }
    if (!Number.isFinite(amount) || amount <= 0 || amount > 1_000_000_000) {
      return json({ error: "Invalid amount" }, 400);
    }
    if (recipient_id === senderId) {
      return json({ error: "Cannot transfer to yourself" }, 400);
    }

    // ── Service-role client for privileged credit + tx update ───────────
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Verify recipient profile exists
    const { data: recipient, error: recipientErr } = await admin
      .from("profiles")
      .select("id")
      .eq("id", recipient_id)
      .maybeSingle();
    if (recipientErr) throw recipientErr;
    if (!recipient) return json({ error: "Recipient not found" }, 404);

    // Credit recipient via update_balance RPC (service role bypasses auth.uid check)
    const { error: creditErr } = await admin.rpc("update_balance", {
      p_user_id: recipient_id,
      p_token_symbol: token_symbol,
      p_amount: Math.abs(amount),
    });
    if (creditErr) throw creditErr;

    // Mark sender's pending transfer record as confirmed (if provided)
    if (tx_id) {
      await admin
        .from("transactions")
        .update({ status: "confirmed", confirmed_at: new Date().toISOString() })
        .eq("id", tx_id)
        .eq("user_id", senderId)
        .eq("tx_type", "transfer");
    }

    // Record a corresponding credit transaction for the recipient
    const { data: recipientWallet } = await admin
      .from("wallets")
      .select("id")
      .eq("user_id", recipient_id)
      .eq("is_primary", true)
      .maybeSingle();

    if (recipientWallet) {
      await admin.from("transactions").insert({
        user_id: recipient_id,
        wallet_id: recipientWallet.id,
        tx_hash: `internal-credit-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
        tx_type: "transfer",
        from_address: senderId,
        to_address: recipient_id,
        token_symbol,
        amount,
        chain: "internal",
        status: "confirmed",
        confirmed_at: new Date().toISOString(),
      });
    }

    return json({ success: true });
  } catch (e) {
    console.error("process-internal-transfer error:", e);
    return json({ error: (e as Error).message ?? "Internal error" }, 500);
  }
});

function json(payload: unknown, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
