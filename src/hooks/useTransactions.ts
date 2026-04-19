import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect } from "react";
import { toast } from "sonner";

interface Transaction {
  id: string;
  tx_hash: string;
  tx_type: string;
  token_symbol: string;
  amount: number;
  usd_value: number;
  status: string;
  created_at: string;
}

export const useTransactions = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  // Realtime: live transactions sync + status change toasts
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`transactions-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "transactions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["transactions", user.id] });

          // Surface status transitions across tabs
          if (payload.eventType === "UPDATE") {
            const next = payload.new as Transaction;
            const prev = payload.old as Transaction | null;
            if (prev?.status !== next.status) {
              if (next.status === "confirmed") {
                toast.success(
                  `${next.tx_type} confirmed — ${Number(next.amount).toFixed(4)} ${next.token_symbol}`,
                );
              } else if (next.status === "failed") {
                toast.error(
                  `${next.tx_type} failed — ${Number(next.amount).toFixed(4)} ${next.token_symbol}`,
                );
              }
            }
          }
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  return { transactions, loading: isLoading };
};
