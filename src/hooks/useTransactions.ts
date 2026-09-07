import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect, useState } from "react";
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
  const [flashedIds, setFlashedIds] = useState<Set<string>>(new Set());

  const flashRow = (id: string) => {
    setFlashedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setTimeout(() => {
      setFlashedIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 1800);
  };

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });

  // Realtime: live transactions sync + status change toasts + row flash
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

          const next = (payload.new ?? null) as Transaction | null;
          if (next?.id) flashRow(next.id);

          // Surface status transitions across tabs
          if (payload.eventType === "UPDATE") {
            const prev = payload.old as Transaction | null;
            if (next && prev?.status !== next.status) {
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

  return { transactions, loading: isLoading, flashedIds };
};
