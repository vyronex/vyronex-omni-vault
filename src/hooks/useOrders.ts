import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

interface PlaceOrderParams {
  trading_pair_id: string;
  side: "buy" | "sell";
  order_type: "limit" | "market";
  price?: number;
  quantity: number;
}

export const useOrders = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          trading_pairs (
            base_token,
            quote_token
          )
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(50);

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const placeOrder = useMutation({
    mutationFn: async (params: PlaceOrderParams) => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error("Not authenticated");
      }

      const { data, error } = await supabase.functions.invoke("place-order", {
        body: params,
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["balances"] });
      toast.success(`Order placed successfully! ${data.trades > 0 ? `Matched ${data.trades} trades.` : ''}`);
    },
    onError: (error: Error) => {
      toast.error(`Failed to place order: ${error.message}`);
    },
  });

  const cancelOrder = useMutation({
    mutationFn: async (orderId: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: "cancelled" })
        .eq("id", orderId)
        .eq("user_id", user?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      toast.success("Order cancelled successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to cancel order: ${error.message}`);
    },
  });

  return {
    orders,
    loading: isLoading,
    placeOrder,
    cancelOrder,
  };
};
