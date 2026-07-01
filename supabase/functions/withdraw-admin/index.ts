import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { z } from "https://esm.sh/zod@3.23.8";
import {
  createWalletClient, http, parseEther, parseUnits,
  encodeFunctionData, createPublicClient,
} from "https://esm.sh/viem@2.21.19";
import { privateKeyToAccount } from "https://esm.sh/viem@2.21.19/accounts";
import { bsc, mainnet, fantom } from "https://esm.sh/viem@2.21.19/chains";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const BodySchema = z.object({
  request_id: z.string().uuid(),
  action: z.enum(["approve", "reject", "mark_completed", "mark_failed"]),
  notes: z.string().max(500).optional(),
  tx_hash: z.string().max(128).optional(),
  failure_reason: z.string().max(500).optional(),
});

const CHAIN_MAP: Record<string, { chain: any; rpc: string }> = {
  "BNB Chain": { chain: bsc, rpc: "https://bsc-dataseed.binance.org" },
  Ethereum: { chain: mainnet, rpc: "https://eth.llamarpc.com" },
  Fantom: { chain: fantom, rpc: "https://rpc.ftm.tools" },
};

// Native-token withdrawals only for now. ERC20 requires a token→contract registry.
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
    const { data: { user } } = await anon.auth.getUser();
    if (!user) return json({ error: "Not authenticated" }, 401);

    // Admin check
    const { data: isAdmin } = await supabase.rpc("has_role", {
      _user_id: user.id, _role: "admin",
    });
    if (!isAdmin) return json({ error: "Admin only" }, 403);

    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten().fieldErrors }, 400);
    const { request_id, action, notes, tx_hash, failure_reason } = parsed.data;

    const { data: wr } = await supabase
      .from("withdrawal_requests").select("*").eq("id", request_id).maybeSingle();
    if (!wr) return json({ error: "Request not found" }, 404);

    const now = new Date().toISOString();

    if (action === "reject") {
      if (!["pending_review", "pending_confirmation"].includes(wr.status)) {
        return json({ error: `Cannot reject from status ${wr.status}` }, 400);
      }
      // Refund user
      await supabase.rpc("update_balance", {
        p_user_id: wr.user_id,
        p_token_symbol: wr.token_symbol,
        p_amount: Number(wr.amount),
      });
      await supabase.from("withdrawal_requests").update({
        status: "rejected", reviewed_by: user.id, reviewed_at: now,
        admin_notes: notes ?? null,
      }).eq("id", request_id);
      return json({ ok: true, status: "rejected" });
    }

    if (action === "mark_failed") {
      if (wr.status === "completed") return json({ error: "Already completed" }, 400);
      await supabase.rpc("update_balance", {
        p_user_id: wr.user_id,
        p_token_symbol: wr.token_symbol,
        p_amount: Number(wr.amount),
      });
      await supabase.from("withdrawal_requests").update({
        status: "failed", reviewed_by: user.id, reviewed_at: now,
        failure_reason: failure_reason ?? "Manual mark",
        admin_notes: notes ?? null,
      }).eq("id", request_id);
      return json({ ok: true, status: "failed" });
    }

    if (action === "mark_completed") {
      await supabase.from("withdrawal_requests").update({
        status: "completed", completed_at: now,
        tx_hash: tx_hash ?? wr.tx_hash,
        admin_notes: notes ?? wr.admin_notes,
        reviewed_by: user.id, reviewed_at: now,
      }).eq("id", request_id);
      return json({ ok: true, status: "completed" });
    }

    // action === "approve"
    if (wr.status !== "pending_review") {
      return json({ error: `Cannot approve from status ${wr.status}` }, 400);
    }

    await supabase.from("withdrawal_requests").update({
      status: "approved", reviewed_by: user.id, reviewed_at: now,
      admin_notes: notes ?? null,
    }).eq("id", request_id);

    // Auto-broadcast for EVM native tokens
    const evm = CHAIN_MAP[wr.chain];
    const nativeSymbol = wr.chain === "BNB Chain" ? "BNB"
      : wr.chain === "Ethereum" ? "ETH"
      : wr.chain === "Fantom" ? "FTM" : null;

    if (evm && nativeSymbol && wr.token_symbol === nativeSymbol) {
      const pk = Deno.env.get("HOT_WALLET_PRIVATE_KEY");
      if (!pk) {
        return json({
          ok: true, status: "approved",
          note: "Approved. HOT_WALLET_PRIVATE_KEY missing — broadcast skipped.",
        });
      }
      try {
        const account = privateKeyToAccount(
          (pk.startsWith("0x") ? pk : `0x${pk}`) as `0x${string}`,
        );
        const walletClient = createWalletClient({
          account, chain: evm.chain, transport: http(evm.rpc),
        });
        await supabase.from("withdrawal_requests").update({
          status: "broadcasting", broadcast_at: now,
        }).eq("id", request_id);

        const hash = await walletClient.sendTransaction({
          to: wr.to_address as `0x${string}`,
          value: parseEther(String(wr.net_amount)),
        });

        await supabase.from("withdrawal_requests").update({
          tx_hash: hash, status: "broadcasting",
        }).eq("id", request_id);

        return json({ ok: true, status: "broadcasting", tx_hash: hash });
      } catch (err) {
        await supabase.from("withdrawal_requests").update({
          status: "failed",
          failure_reason: `Broadcast failed: ${(err as Error).message}`,
        }).eq("id", request_id);
        // Refund
        await supabase.rpc("update_balance", {
          p_user_id: wr.user_id,
          p_token_symbol: wr.token_symbol,
          p_amount: Number(wr.amount),
        });
        return json({ error: (err as Error).message }, 500);
      }
    }

    return json({
      ok: true, status: "approved",
      note: "Approved. Non-EVM or non-native token — process manually then mark completed.",
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
