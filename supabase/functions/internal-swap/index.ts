// Atomic custodial swap between two of a user's token balances using live
// CoinGecko USD prices. Debits "from" token and credits "to" token via the
// audit-logged update_balance RPC. A 0.20% spread is applied as the swap fee.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3.23.8";

const SYMBOL_TO_COINGECKO: Record<string, string> = {
  BNB: "binancecoin",
  ETH: "ethereum",
  FTM: "fantom",
  BTC: "bitcoin",
  SOL: "solana",
  TRX: "tron",
  USDT: "tether",
  USDC: "usd-coin",
  MATIC: "matic-network",
  VNX: "vyronex",
};

const FEE_BPS = 20; // 0.20%

const BodySchema = z.object({
  from_symbol: z.string().min(2).max(10),
  to_symbol: z.string().min(2).max(10),
  amount: z.number().positive().finite().max(1_000_000_000),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing auth" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await req.json();
    const parsed = BodySchema.safeParse(json);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const from = parsed.data.from_symbol.toUpperCase();
    const to = parsed.data.to_symbol.toUpperCase();
    const amount = parsed.data.amount;
    if (from === to) {
      return new Response(JSON.stringify({ error: "Cannot swap a token for itself" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const fromId = SYMBOL_TO_COINGECKO[from];
    const toId = SYMBOL_TO_COINGECKO[to];
    if (!fromId || !toId) {
      return new Response(JSON.stringify({ error: "Unsupported token" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Live price
    const cgKey = Deno.env.get("COINGECKO_API_KEY");
    const priceUrl = `https://api.coingecko.com/api/v3/simple/price?ids=${fromId},${toId}&vs_currencies=usd${cgKey ? `&x_cg_demo_api_key=${cgKey}` : ""}`;
    const priceRes = await fetch(priceUrl);
    if (!priceRes.ok) throw new Error("Price feed failed");
    const prices = await priceRes.json();
    const fromUsd = prices?.[fromId]?.usd;
    const toUsd = prices?.[toId]?.usd;
    if (!fromUsd || !toUsd) throw new Error("Missing price data");

    const grossOut = (amount * fromUsd) / toUsd;
    const feeOut = grossOut * (FEE_BPS / 10_000);
    const netOut = grossOut - feeOut;

    const admin = createClient(supabaseUrl, serviceKey);

    // Check balance
    const { data: balRow } = await admin
      .from("balances")
      .select("balance")
      .eq("user_id", user.id)
      .eq("token_symbol", from)
      .maybeSingle();
    const current = Number(balRow?.balance ?? 0);
    if (current < amount) {
      return new Response(JSON.stringify({ error: `Insufficient ${from} balance (have ${current})` }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Debit
    const { error: debitErr } = await admin.rpc("update_balance", {
      p_user_id: user.id,
      p_token_symbol: from,
      p_amount: -amount,
    });
    if (debitErr) throw debitErr;

    // Credit
    const { error: creditErr } = await admin.rpc("update_balance", {
      p_user_id: user.id,
      p_token_symbol: to,
      p_amount: netOut,
    });
    if (creditErr) {
      // best-effort revert
      await admin.rpc("update_balance", {
        p_user_id: user.id,
        p_token_symbol: from,
        p_amount: amount,
      });
      throw creditErr;
    }

    return new Response(JSON.stringify({
      ok: true,
      from_symbol: from,
      to_symbol: to,
      amount_in: amount,
      amount_out: netOut,
      fee_out: feeOut,
      rate: fromUsd / toUsd,
      from_usd: fromUsd,
      to_usd: toUsd,
      fee_bps: FEE_BPS,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
