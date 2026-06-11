// Validates a token contract on-chain and returns resolved metadata
// (name, symbol, decimals, totalSupply). Supports EVM (BSC/ETH/Fantom/Polygon/
// Arbitrum/Optimism/Base/Avalanche), Tron (TRC-20), and Solana (SPL token mint).
//
// Body: { chain: string, address: string }
// Returns: { valid: boolean, name?: string, symbol?: string, decimals?: number,
//            totalSupply?: string, chain: string, address: string, source: string, error?: string }
//
// Public RPCs only. No secrets required.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const EVM_RPC: Record<string, string> = {
  "BNB Chain": "https://bsc-dataseed.binance.org",
  Ethereum: "https://eth.llamarpc.com",
  Fantom: "https://rpc.ftm.tools",
  Polygon: "https://polygon-rpc.com",
  Arbitrum: "https://arb1.arbitrum.io/rpc",
  Optimism: "https://mainnet.optimism.io",
  Base: "https://mainnet.base.org",
  Avalanche: "https://api.avax.network/ext/bc/C/rpc",
};

const SEL = {
  name: "0x06fdde03",
  symbol: "0x95d89b41",
  decimals: "0x313ce567",
  totalSupply: "0x18160ddd",
};

const isEvm = (a: string) => /^0x[a-fA-F0-9]{40}$/.test(a);

const hexToBigInt = (h: string): bigint => (!h || h === "0x" ? 0n : BigInt(h));

function decodeString(hex: string): string {
  if (!hex || hex.length < 2) return "";
  const data = hex.slice(2);
  // Try ABI string: offset(32) + length(32) + bytes
  if (data.length >= 128) {
    try {
      const len = Number(BigInt("0x" + data.slice(64, 128)));
      if (len > 0 && len <= 256) {
        const bytesHex = data.slice(128, 128 + len * 2);
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
          bytes[i] = parseInt(bytesHex.slice(i * 2, i * 2 + 2), 16);
        }
        const s = new TextDecoder().decode(bytes).replace(/\0+$/, "");
        if (s) return s;
      }
    } catch (_) { /* fall through */ }
  }
  // Fallback: bytes32 (e.g. MKR)
  try {
    const bytes = new Uint8Array(32);
    for (let i = 0; i < 32; i++) {
      bytes[i] = parseInt(data.slice(i * 2, i * 2 + 2), 16);
    }
    return new TextDecoder().decode(bytes).replace(/\0+$/g, "").trim();
  } catch {
    return "";
  }
}

async function validateEvm(chain: string, address: string) {
  const rpc = EVM_RPC[chain];
  if (!rpc) return { valid: false, error: `Unsupported EVM chain: ${chain}` };

  // First check: is there code at this address?
  const batch = [
    { jsonrpc: "2.0", id: 0, method: "eth_getCode", params: [address, "latest"] },
    { jsonrpc: "2.0", id: 1, method: "eth_call", params: [{ to: address, data: SEL.name }, "latest"] },
    { jsonrpc: "2.0", id: 2, method: "eth_call", params: [{ to: address, data: SEL.symbol }, "latest"] },
    { jsonrpc: "2.0", id: 3, method: "eth_call", params: [{ to: address, data: SEL.decimals }, "latest"] },
    { jsonrpc: "2.0", id: 4, method: "eth_call", params: [{ to: address, data: SEL.totalSupply }, "latest"] },
  ];
  const resp = await fetch(rpc, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(batch),
  });
  if (!resp.ok) return { valid: false, error: `RPC HTTP ${resp.status}` };
  const data = (await resp.json()) as { id: number; result?: string; error?: { message: string } }[];
  const byId = new Map(data.map((r) => [r.id, r]));

  const code = byId.get(0)?.result ?? "0x";
  if (!code || code === "0x" || code === "0x0") {
    return { valid: false, error: "No contract code at this address" };
  }

  const nameRaw = byId.get(1)?.result ?? "";
  const symbolRaw = byId.get(2)?.result ?? "";
  const decimalsRaw = byId.get(3)?.result ?? "";
  const totalRaw = byId.get(4)?.result ?? "";

  const name = decodeString(nameRaw);
  const symbol = decodeString(symbolRaw);
  const decimals = decimalsRaw ? Number(hexToBigInt(decimalsRaw)) : NaN;
  const totalSupply = totalRaw ? hexToBigInt(totalRaw).toString() : undefined;

  if (!symbol || Number.isNaN(decimals) || decimals < 0 || decimals > 36) {
    return {
      valid: false,
      error: "Address has code but does not respond to ERC-20 calls",
    };
  }

  return {
    valid: true,
    name: name || symbol,
    symbol,
    decimals,
    totalSupply,
    source: "rpc",
  };
}

async function validateTron(address: string) {
  if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) {
    return { valid: false, error: "Invalid Tron address format" };
  }
  try {
    const resp = await fetch(
      `https://apilist.tronscanapi.com/api/token_trc20?contract=${address}&showAll=1`,
    );
    const data = await resp.json();
    const t = data?.trc20_tokens?.[0];
    if (!t) return { valid: false, error: "TRC-20 token not found" };
    return {
      valid: true,
      name: t.name,
      symbol: t.symbol,
      decimals: Number(t.decimals ?? 6),
      totalSupply: String(t.total_supply ?? ""),
      source: "tronscan",
    };
  } catch (e) {
    return { valid: false, error: `Tron lookup failed: ${(e as Error).message}` };
  }
}

async function validateSolana(mint: string) {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(mint)) {
    return { valid: false, error: "Invalid Solana mint format" };
  }
  try {
    // Use Jupiter token list as the source of validated SPL mints
    const resp = await fetch(`https://tokens.jup.ag/token/${mint}`);
    if (!resp.ok) return { valid: false, error: "Mint not in Jupiter token list" };
    const t = await resp.json();
    if (!t?.address) return { valid: false, error: "Mint not found" };
    return {
      valid: true,
      name: t.name,
      symbol: t.symbol,
      decimals: Number(t.decimals ?? 9),
      totalSupply: undefined,
      source: "jupiter",
    };
  } catch (e) {
    return { valid: false, error: `Solana lookup failed: ${(e as Error).message}` };
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const { chain, address } = await req.json();
    if (typeof chain !== "string" || typeof address !== "string" || !address) {
      return new Response(JSON.stringify({ valid: false, error: "chain and address required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const addr = address.trim();

    let result: Record<string, unknown>;
    if (chain in EVM_RPC) {
      if (!isEvm(addr)) {
        result = { valid: false, error: "Invalid EVM address format" };
      } else {
        result = await validateEvm(chain, addr);
      }
    } else if (chain === "Tron") {
      result = await validateTron(addr);
    } else if (chain === "Solana") {
      result = await validateSolana(addr);
    } else {
      result = { valid: false, error: `Unsupported chain: ${chain}` };
    }

    return new Response(
      JSON.stringify({ ...result, chain, address: addr }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    return new Response(JSON.stringify({ valid: false, error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
