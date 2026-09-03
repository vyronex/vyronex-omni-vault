import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const BodySchema = z.object({
  token_symbol: z.string().min(1).max(10),
  chain: z.string().min(1).max(30),
  amount: z.number().positive().finite().max(1_000_000_000),
  to_address: z.string().min(8).max(128),
});

const addressPatterns: Record<string, RegExp> = {
  "BNB Chain": /^0x[a-fA-F0-9]{40}$/,
  Ethereum: /^0x[a-fA-F0-9]{40}$/,
  Fantom: /^0x[a-fA-F0-9]{40}$/,
  Bitcoin: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
  Solana: /^[1-9A-HJ-NP-Za-km-z]{32,44}$/,
  Tron: /^T[1-9A-HJ-NP-Za-km-z]{33}$/,
};

async function sha256(text: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return json({ error: "Not authenticated" }, 401);

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const anon = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: { user }, error: authError } = await anon.auth.getUser();
    if (authError) console.error("withdraw-request auth validation failed", authError.message);
    if (!user) return json({ error: "Not authenticated" }, 401);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Request body must be valid JSON" }, 400);
    }
    const parsed = BodySchema.safeParse(body);
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const token_symbol = parsed.data.token_symbol.trim().toUpperCase();
    const chain = parsed.data.chain.trim();
    const amount = parsed.data.amount;
    const to_address = parsed.data.to_address.trim();

    const pattern = addressPatterns[chain];
    if (pattern && !pattern.test(to_address.trim())) {
      return json({ error: `Invalid ${chain} address format` }, 400);
    }

    // Limits
    const { data: limit, error: limitError } = await supabase
      .from("withdrawal_limits")
      .select("*")
      .eq("token_symbol", token_symbol)
      .eq("chain", chain)
      .maybeSingle();
    if (limitError) return json({ error: `Unable to load withdrawal limits: ${limitError.message}` }, 500);
    if (!limit || !limit.is_enabled) {
      return json({ error: `Withdrawals disabled for ${token_symbol} on ${chain}` }, 400);
    }
    // No minimum withdrawal amount enforced.

    const fee = Number(limit.network_fee);
    const net = amount - fee;
    if (net <= 0) return json({ error: "Amount must exceed network fee" }, 400);

    // Daily limit check
    const dayAgo = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    const { data: recent, error: recentError } = await supabase
      .from("withdrawal_requests")
      .select("amount")
      .eq("user_id", user.id)
      .eq("token_symbol", token_symbol)
      .gte("created_at", dayAgo)
      .not("status", "in", "(cancelled,rejected,failed)");
    if (recentError) return json({ error: `Unable to check withdrawal limits: ${recentError.message}` }, 500);
    const used = (recent ?? []).reduce((s, r) => s + Number(r.amount), 0);
    if (used + amount > Number(limit.daily_limit)) {
      return json({ error: `Daily limit ${limit.daily_limit} ${token_symbol} exceeded` }, 400);
    }

    // Debit balance using the guarded four-argument overload. Passing the
    // optional trade id explicitly avoids selecting the legacy three-argument
    // overload, which does not enforce non-negative balances.
    const { error: debitErr } = await supabase.rpc("update_balance", {
      p_user_id: user.id,
      p_token_symbol: token_symbol,
      p_amount: -Math.abs(amount),
      p_trade_id: null,
    });
    if (debitErr) return json({ error: debitErr.message }, 400);

    // Create withdrawal request
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;
    const { data: wr, error: wrErr } = await supabase
      .from("withdrawal_requests")
      .insert({
        user_id: user.id,
        token_symbol,
        chain,
        amount,
        fee,
        net_amount: net,
        to_address: to_address.trim(),
        status: "pending_confirmation",
        ip_address: ip,
      })
      .select()
      .single();
    if (wrErr || !wr) {
      // Refund
      await supabase.rpc("update_balance", {
        p_user_id: user.id,
        p_token_symbol: token_symbol,
        p_amount: Math.abs(amount),
        p_trade_id: null,
      });
      return json({ error: wrErr?.message ?? "Failed to create request" }, 500);
    }

    // Generate OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const code_hash = await sha256(`${wr.id}:${code}`);
    const expires_at = new Date(Date.now() + 10 * 60 * 1000).toISOString();

    const { error: confirmationError } = await supabase.from("withdrawal_confirmations").insert({
      request_id: wr.id,
      user_id: user.id,
      code_hash,
      expires_at,
    });
    if (confirmationError) {
      await supabase.from("withdrawal_requests").delete().eq("id", wr.id);
      await supabase.rpc("update_balance", {
        p_user_id: user.id,
        p_token_symbol: token_symbol,
        p_amount: Math.abs(amount),
        p_trade_id: null,
      });
      return json({ error: `Failed to create confirmation: ${confirmationError.message}` }, 500);
    }

    // NOTE: No email provider configured — code is returned to client.
    // Add Resend/SendGrid secret to email instead.
    return json({
      request_id: wr.id,
      fee,
      net_amount: net,
      expires_at,
      dev_code: code,
      message: "Confirmation code generated. Enter within 10 minutes.",
    });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
