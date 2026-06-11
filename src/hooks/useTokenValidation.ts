import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface TokenValidation {
  valid: boolean;
  name?: string;
  symbol?: string;
  decimals?: number;
  totalSupply?: string;
  chain: string;
  address: string;
  source?: string;
  error?: string;
}

async function call(chain: string, address: string): Promise<TokenValidation> {
  const { data, error } = await supabase.functions.invoke("validate-token-contract", {
    body: { chain, address },
  });
  if (error) throw error;
  return data as TokenValidation;
}

/** One-shot validation, fires on demand (e.g. button click). */
export const useValidateTokenMutation = () =>
  useMutation({ mutationFn: ({ chain, address }: { chain: string; address: string }) => call(chain, address) });

/** Reactive validation — useful in batches (Markets table). */
export const useTokenValidation = (chain?: string, address?: string) =>
  useQuery({
    queryKey: ["validate-token", chain, address?.toLowerCase()],
    enabled: !!chain && !!address && address.length > 6,
    staleTime: 5 * 60_000,
    queryFn: () => call(chain!, address!),
  });
