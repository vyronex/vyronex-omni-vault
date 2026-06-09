import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface SwapQuote {
  inAmount: string;
  outAmount: string;
  estimatedGas?: string | number;
  price?: string | number;
  priceImpact?: string | number;
  dexes?: Array<{ dexCode: string; swapAmount: string }>;
  to?: string;
  data?: string;
  value?: string;
  gasPrice?: string;
}

interface QuoteParams {
  chainId: number;
  inTokenAddress: string;
  outTokenAddress: string;
  amount: string; // human-readable, e.g. "1.5"
  slippage?: number; // percent
  account?: string; // required when build=true
  build?: boolean;
  enabled?: boolean;
}

const FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/swap-quote`;
const ANON = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

export const useSwapQuote = (p: QuoteParams) => {
  const enabled = (p.enabled ?? true) && !!p.amount && Number(p.amount) > 0 && p.inTokenAddress !== p.outTokenAddress;
  return useQuery({
    queryKey: ["swap-quote", p.chainId, p.inTokenAddress, p.outTokenAddress, p.amount, p.slippage, p.build, p.account],
    enabled,
    refetchInterval: 8_000,
    staleTime: 5_000,
    queryFn: async (): Promise<SwapQuote> => {
      const params = new URLSearchParams({
        chainId: String(p.chainId),
        inTokenAddress: p.inTokenAddress,
        outTokenAddress: p.outTokenAddress,
        amount: p.amount,
        slippage: String(p.slippage ?? 1),
        build: p.build ? "1" : "0",
      });
      if (p.account) params.set("account", p.account);
      const res = await fetch(`${FN_URL}?${params.toString()}`, {
        headers: { apikey: ANON, Authorization: `Bearer ${ANON}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error?.toString?.() ?? "Quote failed");
      // OpenOcean wraps payload in `data`
      return (json?.data ?? json) as SwapQuote;
    },
  });
};

export const useInternalSwap = () => {
  return {
    swap: async (input: { from_symbol: string; to_symbol: string; amount: number }) => {
      const { data, error } = await supabase.functions.invoke("internal-swap", { body: input });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data as {
        ok: boolean; from_symbol: string; to_symbol: string;
        amount_in: number; amount_out: number; fee_out: number; rate: number;
        from_usd: number; to_usd: number; fee_bps: number;
      };
    },
  };
};
