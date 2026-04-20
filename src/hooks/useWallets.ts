import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useEffect, useState } from "react";

interface Wallet {
  id: string;
  chain: string;
  address: string;
  is_primary: boolean;
}

interface Balance {
  id: string;
  token_symbol: string;
  balance: number;
  usd_value: number;
}

export const useWallets = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [flashedBalanceIds, setFlashedBalanceIds] = useState<Set<string>>(new Set());

  const flashBalance = (id: string) => {
    setFlashedBalanceIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setTimeout(() => {
      setFlashedBalanceIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 1800);
  };

  const { data: wallets, isLoading: walletsLoading } = useQuery({
    queryKey: ["wallets", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("wallets")
        .select("*")
        .eq("user_id", user?.id)
        .order("is_primary", { ascending: false });

      if (error) throw error;
      return data as Wallet[];
    },
    enabled: !!user,
  });

  const { data: balances, isLoading: balancesLoading } = useQuery({
    queryKey: ["balances", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("balances")
        .select("*")
        .eq("user_id", user?.id);

      if (error) throw error;
      return data as Balance[];
    },
    enabled: !!user,
  });

  // Realtime: balances + wallets sync across tabs
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`wallets-balances-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "balances",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          queryClient.invalidateQueries({ queryKey: ["balances", user.id] });
          const next = (payload.new ?? null) as Balance | null;
          const prev = (payload.old ?? null) as Balance | null;
          if (next?.id) {
            // Only flash if balance value actually changed (or it's a new row)
            if (!prev || Number(prev.balance) !== Number(next.balance)) {
              flashBalance(next.id);
            }
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "wallets",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["wallets", user.id] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const addWallet = useMutation({
    mutationFn: async ({
      chain,
      address,
      is_primary,
    }: {
      chain: string;
      address: string;
      is_primary: boolean;
    }) => {
      const { data, error } = await supabase
        .from("wallets")
        .insert({
          user_id: user?.id,
          chain,
          address,
          is_primary,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["wallets"] });
    },
  });

  return {
    wallets,
    balances,
    loading: walletsLoading || balancesLoading,
    addWallet,
  };
};
