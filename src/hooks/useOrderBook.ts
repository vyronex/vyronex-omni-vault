import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";

interface OrderLevel {
  price: number;
  quantity: number;
  orders: number;
}

interface OrderBookData {
  bids: OrderLevel[];
  asks: OrderLevel[];
  spread: number;
  midPrice: number;
  bestBid: number;
  bestAsk: number;
  recentTrades: any[];
}

export const useOrderBook = (tradingPairId: string) => {
  const queryClient = useQueryClient();

  const { data: orderBook, isLoading } = useQuery({
    queryKey: ["orderbook", tradingPairId],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("orderbook", {
        body: { trading_pair_id: tradingPairId },
      });

      if (error) throw error;
      return data as OrderBookData;
    },
    refetchInterval: 2000, // Poll every 2 seconds
    enabled: !!tradingPairId,
  });

  // Subscribe to realtime updates
  useEffect(() => {
    if (!tradingPairId) return;

    const channel = supabase
      .channel(`orderbook:${tradingPairId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `trading_pair_id=eq.${tradingPairId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["orderbook", tradingPairId] });
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "trades",
          filter: `trading_pair_id=eq.${tradingPairId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["orderbook", tradingPairId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tradingPairId, queryClient]);

  return { orderBook, loading: isLoading };
};
