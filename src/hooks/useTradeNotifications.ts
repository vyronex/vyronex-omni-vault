import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/**
 * Subscribe to trades involving the current user (buyer or seller)
 * and show a toast when an order is filled.
 */
export const useTradeNotifications = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    const handle = (payload: any) => {
      const trade = payload.new;
      if (!trade) return;
      const isBuyer = trade.buyer_id === user.id;
      const isSeller = trade.seller_id === user.id;
      if (!isBuyer && !isSeller) return;

      const side = isBuyer ? "Buy" : "Sell";
      toast.success(
        `${side} order filled — ${Number(trade.quantity).toFixed(4)} @ ${Number(trade.price).toFixed(6)}`
      );
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["balances"] });
    };

    const channel = supabase
      .channel(`trades-user-${user.id}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "trades", filter: `buyer_id=eq.${user.id}` }, handle)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "trades", filter: `seller_id=eq.${user.id}` }, handle)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);
};
