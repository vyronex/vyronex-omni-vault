import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

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
