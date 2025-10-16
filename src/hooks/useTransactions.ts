import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

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

  return { transactions, loading: isLoading };
};
