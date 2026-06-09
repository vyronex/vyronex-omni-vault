// Polls a public RPC for an EVM transaction receipt and returns its
// confirmation status. Used by the client to track live swap status.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3.23.8";

const RPCS: Record<string, string> = {
  "56": "https://bsc-dataseed.binance.org",
  "1": "https://eth.llamarpc.com",
  "137": "https://polygon-rpc.com",
  "250": "https://rpc.ftm.tools",
  "42161": "https://arb1.arbitrum.io/rpc",
};

const Schema = z.object({
  chainId: z.string().regex(/^\d+$/),
  txHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const url = new URL(req.url);
    const parsed = Schema.safeParse(Object.fromEntries(url.searchParams));
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: parsed.error.flatten().fieldErrors }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const rpc = RPCS[parsed.data.chainId];
    if (!rpc) {
      return new Response(JSON.stringify({ error: "Unsupported chain" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const r = await fetch(rpc, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0", id: 1,
        method: "eth_getTransactionReceipt",
        params: [parsed.data.txHash],
      }),
    });
    const j = await r.json();
    const receipt = j?.result;
    let status: "pending" | "confirmed" | "failed" = "pending";
    let blockNumber: number | null = null;
    let gasUsed: string | null = null;
    if (receipt) {
      status = receipt.status === "0x1" ? "confirmed" : "failed";
      blockNumber = receipt.blockNumber ? parseInt(receipt.blockNumber, 16) : null;
      gasUsed = receipt.gasUsed ?? null;
    }
    return new Response(JSON.stringify({ status, blockNumber, gasUsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: (e as Error).message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
