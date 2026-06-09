// Proxies OpenOcean DEX aggregator for live multi-chain swap quotes.
// No API key required for public endpoints.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const CHAIN_MAP: Record<string, string> = {
  "56": "bsc",
  "1": "eth",
  "137": "polygon",
  "250": "fantom",
  "42161": "arbitrum",
};

const QuerySchema = z.object({
  chainId: z.string().regex(/^\d+$/),
  inTokenAddress: z.string().min(2).max(64),
  outTokenAddress: z.string().min(2).max(64),
  amount: z.string().regex(/^\d*\.?\d+$/),
  slippage: z.string().regex(/^\d*\.?\d+$/).default("1"),
  account: z.string().optional(),
  build: z.enum(["0", "1"]).default("0"),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const q = parsed.data;
    const chain = CHAIN_MAP[q.chainId];
    if (!chain) {
      return new Response(JSON.stringify({ error: "Unsupported chain" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const wantBuild = q.build === "1" && q.account;
    const endpoint = wantBuild ? "swap_quote" : "quote";
    const params = new URLSearchParams({
      inTokenAddress: q.inTokenAddress,
      outTokenAddress: q.outTokenAddress,
      amount: q.amount,
      slippage: q.slippage,
      gasPrice: "5",
    });
    if (wantBuild) params.set("account", q.account!);

    const ooUrl = `https://open-api.openocean.finance/v3/${chain}/${endpoint}?${params.toString()}`;
    const r = await fetch(ooUrl, { headers: { accept: "application/json" } });
    const data = await r.json();

    return new Response(JSON.stringify(data), {
      status: r.status,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
