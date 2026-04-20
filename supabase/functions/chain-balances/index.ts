// Multi-chain on-chain balance reader.
// Accepts: { addresses: { chain: string; address: string }[] }
// Returns: { balances: { chain, address, native: { symbol, balance, decimals }, tokens: [...] }[] }
//
// Chains supported: BNB Chain, Ethereum, Fantom (EVM via JSON-RPC),
//                   Solana (Solana JSON-RPC), Tron (TronGrid REST),
//                   Bitcoin (blockstream.info REST).
//
// Read-only. No secrets required. Public RPC endpoints used.
// All requests are routed server-side to avoid CORS / rate-limit / RPC URL leakage.

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// ─── Chain configs ────────────────────────────────────────────────────────────

interface EvmTokenConfig {
  symbol: string;
  address: string;
  decimals: number;
}

interface EvmChainConfig {
  rpc: string;
  nativeSymbol: string;
  tokens: EvmTokenConfig[];
}

const EVM: Record<string, EvmChainConfig> = {
  "BNB Chain": {
    rpc: "https://bsc-dataseed.binance.org",
    nativeSymbol: "BNB",
    tokens: [
      // VNX BEP-20 (from project memory: VNX Token Contract on BSC)
      { symbol: "VNX", address: "0x40c0e9376468b4f257aacd0fa48a04ae07cb44c1", decimals: 18 },
      { symbol: "USDT", address: "0x55d398326f99059ff775485246999027b3197955", decimals: 18 },
      { symbol: "USDC", address: "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", decimals: 18 },
    ],
  },
  Ethereum: {
    rpc: "https://eth.llamarpc.com",
    nativeSymbol: "ETH",
    tokens: [
      { symbol: "USDT", address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", decimals: 6 },
      { symbol: "USDC", address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", decimals: 6 },
    ],
  },
  Fantom: {
    rpc: "https://rpc.ftm.tools",
    nativeSymbol: "FTM",
    tokens: [
      { symbol: "USDC", address: "0x04068DA6C83AFCFA0e13ba15A6696662335D5B75", decimals: 6 },
    ],
  },
};

// ─── EVM helpers ──────────────────────────────────────────────────────────────

const BALANCE_OF_SELECTOR = "0x70a08231"; // balanceOf(address)

const padAddress = (addr: string) =>
  addr.toLowerCase().replace(/^0x/, "").padStart(64, "0");

const hexToBigInt = (hex: string): bigint => {
  if (!hex || hex === "0x") return 0n;
  return BigInt(hex);
};

const formatUnits = (value: bigint, decimals: number): number => {
  if (value === 0n) return 0;
  const negative = value < 0n;
  const v = negative ? -value : value;
  const s = v.toString().padStart(decimals + 1, "0");
  const intPart = s.slice(0, s.length - decimals);
  const fracPart = s.slice(s.length - decimals).replace(/0+$/, "");
  const out = fracPart ? `${intPart}.${fracPart}` : intPart;
  return Number(negative ? `-${out}` : out);
};

const isValidEvmAddress = (a: string) => /^0x[a-fA-F0-9]{40}$/.test(a);

async function fetchEvmBalances(
  chain: string,
  config: EvmChainConfig,
  address: string,
) {
  if (!isValidEvmAddress(address)) {
    return {
      native: { symbol: config.nativeSymbol, balance: 0, decimals: 18 },
      tokens: [],
    };
  }

  // Build a single batch JSON-RPC request
  const batch: unknown[] = [];
  // Native balance
  batch.push({
    jsonrpc: "2.0",
    id: 0,
    method: "eth_getBalance",
    params: [address, "latest"],
  });
  // Token balances
  config.tokens.forEach((t, idx) => {
    batch.push({
      jsonrpc: "2.0",
      id: idx + 1,
      method: "eth_call",
      params: [
        {
          to: t.address,
          data: `${BALANCE_OF_SELECTOR}${padAddress(address)}`,
        },
        "latest",
      ],
    });
  });

  try {
    const resp = await fetch(config.rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(batch),
    });
    if (!resp.ok) throw new Error(`RPC ${chain} HTTP ${resp.status}`);
    const data = (await resp.json()) as { id: number; result?: string }[];
    const byId = new Map(data.map((r) => [r.id, r.result]));

    const nativeRaw = hexToBigInt(byId.get(0) ?? "0x0");
    const tokens = config.tokens.map((t, idx) => ({
      symbol: t.symbol,
      address: t.address,
      decimals: t.decimals,
      balance: formatUnits(hexToBigInt(byId.get(idx + 1) ?? "0x0"), t.decimals),
    }));

    return {
      native: {
        symbol: config.nativeSymbol,
        balance: formatUnits(nativeRaw, 18),
        decimals: 18,
      },
      tokens,
    };
  } catch (e) {
    console.error(`EVM fetch failed for ${chain}:`, (e as Error).message);
    return {
      native: { symbol: config.nativeSymbol, balance: 0, decimals: 18 },
      tokens: config.tokens.map((t) => ({
        symbol: t.symbol,
        address: t.address,
        decimals: t.decimals,
        balance: 0,
      })),
    };
  }
}

// ─── Solana ───────────────────────────────────────────────────────────────────

async function fetchSolanaBalance(address: string) {
  if (!/^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address)) {
    return { native: { symbol: "SOL", balance: 0, decimals: 9 }, tokens: [] };
  }
  try {
    const resp = await fetch("https://api.mainnet-beta.solana.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "getBalance",
        params: [address],
      }),
    });
    const data = await resp.json();
    const lamports = BigInt(data?.result?.value ?? 0);
    return {
      native: {
        symbol: "SOL",
        balance: formatUnits(lamports, 9),
        decimals: 9,
      },
      tokens: [],
    };
  } catch (e) {
    console.error("Solana fetch failed:", (e as Error).message);
    return { native: { symbol: "SOL", balance: 0, decimals: 9 }, tokens: [] };
  }
}

// ─── Tron ─────────────────────────────────────────────────────────────────────

async function fetchTronBalance(address: string) {
  if (!/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(address)) {
    return { native: { symbol: "TRX", balance: 0, decimals: 6 }, tokens: [] };
  }
  try {
    const resp = await fetch(
      `https://api.trongrid.io/v1/accounts/${address}`,
    );
    const data = await resp.json();
    const acct = data?.data?.[0];
    const sun = BigInt(acct?.balance ?? 0);
    // TRC20 USDT
    const trc20 = (acct?.trc20 as Array<Record<string, string>> | undefined) ?? [];
    const usdtAddr = "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t";
    const usdtBal = trc20.find((m) => Object.keys(m)[0] === usdtAddr);
    const usdtRaw = usdtBal ? BigInt(Object.values(usdtBal)[0] ?? 0) : 0n;
    return {
      native: {
        symbol: "TRX",
        balance: formatUnits(sun, 6),
        decimals: 6,
      },
      tokens: [
        {
          symbol: "USDT",
          address: usdtAddr,
          decimals: 6,
          balance: formatUnits(usdtRaw, 6),
        },
      ],
    };
  } catch (e) {
    console.error("Tron fetch failed:", (e as Error).message);
    return { native: { symbol: "TRX", balance: 0, decimals: 6 }, tokens: [] };
  }
}

// ─── Bitcoin ──────────────────────────────────────────────────────────────────

async function fetchBitcoinBalance(address: string) {
  if (!/^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/.test(address)) {
    return { native: { symbol: "BTC", balance: 0, decimals: 8 }, tokens: [] };
  }
  try {
    const resp = await fetch(`https://blockstream.info/api/address/${address}`);
    const data = await resp.json();
    const funded = BigInt(data?.chain_stats?.funded_txo_sum ?? 0);
    const spent = BigInt(data?.chain_stats?.spent_txo_sum ?? 0);
    const sat = funded - spent;
    return {
      native: {
        symbol: "BTC",
        balance: formatUnits(sat < 0n ? 0n : sat, 8),
        decimals: 8,
      },
      tokens: [],
    };
  } catch (e) {
    console.error("Bitcoin fetch failed:", (e as Error).message);
    return { native: { symbol: "BTC", balance: 0, decimals: 8 }, tokens: [] };
  }
}

// ─── Dispatcher ───────────────────────────────────────────────────────────────

async function fetchForChain(chain: string, address: string) {
  if (chain in EVM) {
    return await fetchEvmBalances(chain, EVM[chain], address);
  }
  if (chain === "Solana") return await fetchSolanaBalance(address);
  if (chain === "Tron") return await fetchTronBalance(address);
  if (chain === "Bitcoin") return await fetchBitcoinBalance(address);
  return { native: { symbol: "?", balance: 0, decimals: 0 }, tokens: [] };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

interface AddressEntry {
  chain: string;
  address: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json().catch(() => null);
    const addresses: AddressEntry[] = Array.isArray(body?.addresses)
      ? body.addresses
      : [];

    if (addresses.length === 0) {
      return new Response(
        JSON.stringify({ error: "addresses array required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        },
      );
    }
    if (addresses.length > 12) {
      return new Response(JSON.stringify({ error: "max 12 addresses" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Skip placeholder addresses
    const real = addresses.filter(
      (a) =>
        typeof a.chain === "string" &&
        typeof a.address === "string" &&
        a.address.length > 0 &&
        !a.address.startsWith("pending"),
    );

    const results = await Promise.all(
      real.map(async (a) => ({
        chain: a.chain,
        address: a.address,
        ...(await fetchForChain(a.chain, a.address)),
      })),
    );

    // Add empty results for placeholder addresses so the client knows they were processed
    const placeholders = addresses
      .filter((a) => !real.includes(a))
      .map((a) => ({
        chain: a.chain,
        address: a.address,
        native: { symbol: "?", balance: 0, decimals: 0 },
        tokens: [],
        placeholder: true,
      }));

    return new Response(
      JSON.stringify({ balances: [...results, ...placeholders] }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  } catch (e) {
    console.error("chain-balances error:", e);
    return new Response(
      JSON.stringify({ error: (e as Error).message ?? "Internal error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
