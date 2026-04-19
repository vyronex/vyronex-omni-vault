import { useEffect } from "react";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Props {
  /** Optional trading_pair_id filter; if omitted, shows all pairs */
  tradingPairId?: string;
  /** Compact mode for narrow sidebars */
  compact?: boolean;
}

const statusBadgeClass = (status: string) => {
  switch (status) {
    case "open":
      return "bg-[hsl(var(--vnx-gold))]/15 text-[hsl(var(--vnx-gold))] border-[hsl(var(--vnx-gold))]/30";
    case "partially_filled":
      return "bg-primary/15 text-primary border-primary/30";
    case "filled":
      return "bg-[hsl(var(--vnx-green))]/15 text-[hsl(var(--vnx-green))] border-[hsl(var(--vnx-green))]/30";
    case "cancelled":
      return "bg-muted/40 text-muted-foreground border-border/40";
    default:
      return "bg-muted/40 text-muted-foreground border-border/40";
  }
};

const OpenOrdersPanel = ({ tradingPairId, compact = false }: Props) => {
  const { user } = useAuth();
  const { orders, loading, cancelOrder } = useOrders();
  const queryClient = useQueryClient();

  // Realtime: refresh orders panel on any change to user's orders
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`orders-panel-${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "orders",
          filter: `user_id=eq.${user.id}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["orders"] });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const visible = (orders ?? []).filter((o: any) => {
    if (tradingPairId && o.trading_pair_id !== tradingPairId) return false;
    return o.status === "open" || o.status === "partially_filled";
  });

  if (!user) return null;

  return (
    <div className="card-modern animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3
          className="text-lg font-bold"
          style={{ fontFamily: "'Space Grotesk', system-ui" }}
        >
          Open Orders
        </h3>
        <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-muted/30 text-muted-foreground">
          {visible.length} active
        </span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 rounded-xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No open orders
        </p>
      ) : (
        <div className="space-y-2 max-h-[420px] overflow-y-auto">
          {visible.map((o: any) => {
            const pair = o.trading_pairs
              ? `${o.trading_pairs.base_token}/${o.trading_pairs.quote_token}`
              : "—";
            const remaining = Number(o.remaining_quantity ?? 0);
            const total = Number(o.quantity ?? 0);
            const filledPct =
              total > 0 ? ((total - remaining) / total) * 100 : 0;
            const isBuy = o.side === "buy";

            return (
              <div
                key={o.id}
                className="p-3 rounded-xl border border-border/40 hover:border-primary/40 transition-all"
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                        isBuy
                          ? "bg-[hsl(var(--vnx-green))]/15 text-[hsl(var(--vnx-green))] border-[hsl(var(--vnx-green))]/30"
                          : "bg-[hsl(var(--vnx-red))]/15 text-[hsl(var(--vnx-red))] border-[hsl(var(--vnx-red))]/30"
                      }`}
                    >
                      {isBuy ? "BUY" : "SELL"}
                    </span>
                    <span className="text-xs font-semibold truncate">
                      {pair}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      {o.order_type}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${statusBadgeClass(
                      o.status,
                    )}`}
                  >
                    {o.status === "partially_filled"
                      ? `${filledPct.toFixed(0)}% filled`
                      : o.status}
                  </span>
                </div>

                <div
                  className={`grid ${compact ? "grid-cols-2" : "grid-cols-3"} gap-2 text-xs mb-2`}
                >
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Price
                    </p>
                    <p className="font-mono font-semibold">
                      {Number(o.price).toFixed(6)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Remaining
                    </p>
                    <p className="font-mono font-semibold">
                      {remaining.toFixed(4)}
                    </p>
                  </div>
                  {!compact && (
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                        Total
                      </p>
                      <p className="font-mono font-semibold">
                        {(remaining * Number(o.price)).toFixed(2)}
                      </p>
                    </div>
                  )}
                </div>

                {o.status === "partially_filled" && (
                  <div className="h-1 rounded-full bg-muted/30 overflow-hidden mb-2">
                    <div
                      className="h-full bg-primary transition-all duration-500"
                      style={{ width: `${filledPct}%` }}
                    />
                  </div>
                )}

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={cancelOrder.isPending}
                      className="w-full h-8 text-xs rounded-lg active-press"
                    >
                      Cancel order
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="rounded-2xl">
                    <AlertDialogHeader>
                      <AlertDialogTitle
                        style={{
                          fontFamily: "'Space Grotesk', system-ui",
                        }}
                      >
                        Cancel this order?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        {isBuy ? "BUY" : "SELL"} {remaining.toFixed(4)}{" "}
                        {pair} @ {Number(o.price).toFixed(6)}. Any locked
                        balance will be released.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="rounded-xl">
                        Keep order
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => cancelOrder.mutate(o.id)}
                        className="rounded-xl bg-[hsl(var(--vnx-red))] text-white hover:bg-[hsl(var(--vnx-red))]/90"
                      >
                        Cancel order
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default OpenOrdersPanel;
