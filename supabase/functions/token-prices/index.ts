// Resolves live prices for a batch of token contracts.
// Tries CoinGecko first, falls back to DexScreener for tokens not found.
//
// Body: { tokens: { chain: string, address: string }[] }
// Returns: { prices: { chain, address, price, change24h, volume24h, marketCap, source }[] }

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const CG_PLATFORM: Record<string, string> = {
  "BNB Chain": "binance-smart-chain",
  Ethereum: "ethereum",
  Polygon: "polygon-pos",
  Fantom: "fantom",
  Avalanche: "avalanche",
  Arbitrum: "arbitrum-one",
  Optimism: "optimistic-ethereum",
  Base: "base",
  Solana: "solana",
  Tron: "tron",
};

const DS_CHAIN: Record<string, string> = {
  "BNB Chain": "bsc",
  Ethereum: "ethereum",
  Polygon: "polygon",
  Fantom: "fantom",
  Avalanche: "avalanche",
  Arbitrum: "arbitrum",
  Optimism: "optimism",
  Base: "base",
  Solana: "solana",
  Tron: "tron",
};

interface TokenRef { chain: string; address: string }
interface PriceRow {
  chain: string;
  address: string;
  price: number;
  change24h: number;
  volume24h: number;
  marketCap: number;
  source: "coingecko" | "dexscreener" | "none";
}

async function fetchCoinGecko(platform: string, addresses: string[]): Promise<Record<string, any>> {
  const key = Deno.env.get("COINGECKO_API_KEY");
  const headers: Record<string, string> = { Accept: "application/json" };
  if (key) headers["x-cg-demo-api-key"] = key;
  const url = `https://api.coingecko.com/api/v3/simple/token_price/${platform}?contract_addresses=${addresses.join(",")}&vs_currencies=usd&include_24hr_change=true&include_24hr_vol=true&include_market_cap=true`;
  const r = await fetch(url, { headers });
  if (!r.ok) return {};
  return await r.json().catch(() => ({}));
}

async function fetchDexScreener(addresses: string[]): Promise<any[]> {
  if (addresses.length === 0) return [];
  // Up to 30 per request
  const chunks: string[][] = [];
  for (let i = 0; i < addresses.length; i += 30) chunks.push(addresses.slice(i, i + 30));
  const all: any[] = [];
  for (const chunk of chunks) {
    try {
      const r = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${chunk.join(",")}`);
      const j = await r.json();
      if (Array.isArray(j?.pairs)) all.push(...j.pairs);
    } catch (_) { /* ignore */ }
  }
  return all;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const body = await req.json();
    const tokens: TokenRef[] = Array.isArray(body?.tokens) ? body.tokens : [];
    if (tokens.length === 0) {
      return new Response(JSON.stringify({ prices: [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (tokens.length > 50) {
      return new Response(JSON.stringify({ error: "max 50 tokens" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Record<string, PriceRow> = {};
    const keyOf = (t: TokenRef) => `${t.chain}::${t.address.toLowerCase()}`;

    // 1) CoinGecko by platform
    const byPlatform = new Map<string, TokenRef[]>();
    for (const t of tokens) {
      const p = CG_PLATFORM[t.chain];
      if (!p) continue;
      (byPlatform.get(p) ?? byPlatform.set(p, []).get(p)!).push(t);
    }
    for (const [platform, items] of byPlatform.entries()) {
      const addrs = items.map((i) => i.address.toLowerCase());
      const data = await fetchCoinGecko(platform, addrs);
      for (const t of items) {
        const r = data?.[t.address.toLowerCase()];
        if (r && typeof r.usd === "number" && r.usd > 0) {
          results[keyOf(t)] = {
            chain: t.chain, address: t.address,
            price: r.usd,
            change24h: r.usd_24h_change ?? 0,
            volume24h: r.usd_24h_vol ?? 0,
            marketCap: r.usd_market_cap ?? 0,
            source: "coingecko",
          };
        }
      }
    }

    // 2) DexScreener fallback for missing tokens
    const missing = tokens.filter((t) => !results[keyOf(t)]);
    if (missing.length > 0) {
      const pairs = await fetchDexScreener(missing.map((m) => m.address));
      for (const t of missing) {
        const expectedChain = DS_CHAIN[t.chain];
        const matched = pairs
          .filter((p) =>
            (!expectedChain || p.chainId === expectedChain) &&
            (p.baseToken?.address?.toLowerCase() === t.address.toLowerCase() ||
              p.quoteToken?.address?.toLowerCase() === t.address.toLowerCase()))
          .sort((a, b) => (b?.liquidity?.usd ?? 0) - (a?.liquidity?.usd ?? 0));
        const top = matched[0];
        if (top) {
          const isBase = top.baseToken?.address?.toLowerCase() === t.address.toLowerCase();
          const price = Number(top.priceUsd ?? 0);
          if (price > 0) {
            results[keyOf(t)] = {
              chain: t.chain, address: t.address,
              price,
              change24h: Number(top.priceChange?.h24 ?? 0),
              volume24h: Number(top.volume?.h24 ?? 0),
              marketCap: Number(top.fdv ?? top.marketCap ?? 0),
              source: "dexscreener",
            };
            continue;
          }
        }
        results[keyOf(t)] = {
          chain: t.chain, address: t.address,
          price: 0, change24h: 0, volume24h: 0, marketCap: 0,
          source: "none",
        };
      }
    }

    return new Response(JSON.stringify({ prices: Object.values(results) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
