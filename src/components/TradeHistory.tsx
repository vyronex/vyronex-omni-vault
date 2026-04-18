import { useOrderBook } from "@/hooks/useOrderBook";
import { formatDistanceToNow } from "date-fns";

interface TradeHistoryProps {
  tradingPairId: string;
}

const TradeHistory = ({ tradingPairId }: TradeHistoryProps) => {
  const { orderBook, loading } = useOrderBook(tradingPairId);
  const trades = orderBook?.recentTrades ?? [];

  return (
    <div className="glass-card rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Recent Trades</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--vnx-green))] animate-pulse" />
          Live
        </div>
      </div>

      {loading ? (
        <div className="space-y-1.5">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-7 rounded bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : trades.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground text-sm">No recent trades</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-4 gap-2 pb-2 border-b border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            <div>Price</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Side</div>
            <div className="text-right">Time</div>
          </div>

          <div className="space-y-px max-h-[600px] overflow-y-auto">
            {trades.map((trade: any, idx: number) => {
              // Compare to previous trade price to determine direction
              const prev = trades[idx + 1];
              const isUp = prev ? parseFloat(trade.price) >= parseFloat(prev.price) : true;
              const sideLabel = isUp ? "BUY" : "SELL";
              const sideClass = isUp
                ? "bg-[hsl(var(--vnx-green))]/15 text-[hsl(var(--vnx-green))] border-[hsl(var(--vnx-green))]/30"
                : "bg-destructive/15 text-destructive border-destructive/30";
              const priceClass = isUp ? "text-[hsl(var(--vnx-green))]" : "text-destructive";
              return (
                <div
                  key={trade.id}
                  className="grid grid-cols-4 gap-2 text-xs items-center hover:bg-muted/20 px-2 py-1.5 rounded transition-colors animate-fade-in"
                >
                  <div className={`font-mono font-semibold ${priceClass}`}>
                    {parseFloat(trade.price).toFixed(6)}
                  </div>
                  <div className="text-right font-mono">
                    {parseFloat(trade.quantity).toFixed(4)}
                  </div>
                  <div className="text-right">
                    <span className={`inline-block text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${sideClass}`}>
                      {sideLabel}
                    </span>
                  </div>
                  <div className="text-right text-[10px] text-muted-foreground">
                    {formatDistanceToNow(new Date(trade.created_at), { addSuffix: false })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

export default TradeHistory;
