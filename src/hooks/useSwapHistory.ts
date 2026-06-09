import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface SwapRecord {
  id: string;
  mode: "dex" | "custodial";
  chain_id: number | null;
  chain_name: string | null;
  from_symbol: string;
  to_symbol: string;
  amount_in: number;
  amount_out: number;
  rate: number | null;
  fee_amount: number | null;
  fee_symbol: string | null;
  slippage: number | null;
  price_impact: number | null;
  route: string | null;
  tx_hash: string | null;
  signer_address: string | null;
  status: "pending" | "confirmed" | "failed" | "settled";
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export const useSwapHistory = (limit = 20) => {
  const { user } = useAuth();
  const qc = useQueryClient();

  const query = useQuery({
    queryKey: ["swap-history", user?.id, limit],
    enabled: !!user,
    queryFn: async (): Promise<SwapRecord[]> => {
      const { data, error } = await supabase
        .from("swap_history" as never)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) throw error;
      return (data ?? []) as unknown as SwapRecord[];
    },
  });

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel(`swap-history-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "swap_history", filter: `user_id=eq.${user.id}` },
        () => qc.invalidateQueries({ queryKey: ["swap-history", user.id] }),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user, qc]);

  return query;
};

export const insertSwapRecord = async (input: Partial<SwapRecord> & {
  user_id: string;
  mode: "dex" | "custodial";
  from_symbol: string;
  to_symbol: string;
  amount_in: number;
  amount_out: number;
}) => {
  const { data, error } = await supabase
    .from("swap_history" as never)
    .insert(input as never)
    .select()
    .single();
  if (error) throw error;
  return data as unknown as SwapRecord;
};

export const updateSwapRecord = async (id: string, patch: Partial<SwapRecord>) => {
  const { error } = await supabase
    .from("swap_history" as never)
    .update(patch as never)
    .eq("id", id);
  if (error) throw error;
};

/** Polls tx-status edge function until confirmed/failed. */
export const pollTxStatus = async (
  chainId: number,
  txHash: string,
  onUpdate: (s: { status: "pending" | "confirmed" | "failed"; blockNumber: number | null }) => void,
  opts: { intervalMs?: number; timeoutMs?: number } = {},
) => {
  const interval = opts.intervalMs ?? 4000;
  const timeout = opts.timeoutMs ?? 5 * 60_000;
  const started = Date.now();
  while (Date.now() - started < timeout) {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/tx-status?chainId=${chainId}&txHash=${txHash}`,
        { headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        } },
      );
      const j = await res.json();
      onUpdate(j);
      if (j.status === "confirmed" || j.status === "failed") return j;
    } catch { /* keep polling */ }
    await new Promise((r) => setTimeout(r, interval));
  }
  return { status: "pending" as const, blockNumber: null };
};
