import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface OnChainTokenBalance {
  symbol: string;
  address: string;
  decimals: number;
  balance: number;
}

export interface OnChainBalance {
  chain: string;
  address: string;
  native: { symbol: string; balance: number; decimals: number };
  tokens: OnChainTokenBalance[];
  placeholder?: boolean;
}

interface AddressEntry {
  chain: string;
  address: string;
}

/**
 * Fetches live on-chain balances for the user's per-chain addresses
 * via the chain-balances edge function. Refreshes every 60s.
 */
export const useOnChainBalances = (addresses: AddressEntry[] | undefined) => {
  return useQuery({
    queryKey: [
      "onchain-balances",
      addresses?.map((a) => `${a.chain}:${a.address}`).join("|") ?? "",
    ],
    queryFn: async () => {
      if (!addresses || addresses.length === 0) return [];
      const { data, error } = await supabase.functions.invoke(
        "chain-balances",
        { body: { addresses } },
      );
      if (error) throw error;
      return (data?.balances ?? []) as OnChainBalance[];
    },
    enabled: !!addresses && addresses.length > 0,
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
};
