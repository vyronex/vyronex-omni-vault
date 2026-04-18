import { useEffect, useRef, useState } from "react";
import { useOrderBook } from "@/hooks/useOrderBook";

interface OrderBookProps {
  tradingPairId: string;
}

interface FlashRow { key: string; ts: number; }

const OrderBook = ({ tradingPairId }: OrderBookProps) => {
  const { orderBook, loading } = useOrderBook(tradingPairId);
  const prevAsksRef = useRef<Record<string, number>>({});
  const prevBidsRef = useRef<Record<string, number>>({});
  const [flashes, setFlashes] = useState<FlashRow[]>([]);

  // Detect changes vs previous snapshot to flash updated rows.
  useEffect(() => {
    if (!orderBook) return;
    const newFlashes: FlashRow[] = [];
    const newAsks: Record<string, number> = {};
    const newBids: Record<string, number> = {};
    orderBook.asks.forEach(a => {
      const k = `ask-${a.price}`;
      newAsks[k] = a.quantity;
      if (prevAsksRef.current[k] !== a.quantity) newFlashes.push({ key: k, ts: Date.now() });
    });
    orderBook.bids.forEach(b => {
      const k = `bid-${b.price}`;
      newBids[k] = b.quantity;
      if (prevBidsRef.current[k] !== b.quantity) newFlashes.push({ key: k, ts: Date.now() });
    });
    prevAsksRef.current = newAsks;
    prevBidsRef.current = newBids;
    if (newFlashes.length > 0) {
      setFlashes(prev => [...prev, ...newFlashes]);
      // Cleanup after 1s
      setTimeout(() => {
        const cutoff = Date.now() - 900;
        setFlashes(prev => prev.filter(f => f.ts > cutoff));
      }, 1000);
    }
  }, [orderBook]);

  if (loading) {
    return (
      <div className="glass-card rounded-lg p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Order Book</h3>
        <div className="space-y-1.5">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="h-6 rounded bg-muted/20 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!orderBook) {
    return (
      <div className="glass-card rounded-lg p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Order Book</h3>
        <p className="text-sm text-muted-foreground text-center py-8">No data</p>
      </div>
    );
  }

  const maxAsk = Math.max(...orderBook.asks.map(a => a.quantity), 0.0001);
  const maxBid = Math.max(...orderBook.bids.map(b => b.quantity), 0.0001);
  const isFlashing = (k: string) => flashes.some(f => f.key === k);

  return (
    <div className="glass-card rounded-lg p-6 shadow-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Order Book</h3>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--vnx-green))] animate-pulse" />
          Live
        </div>
      </div>

      {/* Mini stats */}
      <div className="grid grid-cols-2 gap-3 mb-5 p-3 bg-muted/20 rounded-lg text-xs">
        <div>
          <p className="text-muted-foreground">Best Bid</p>
          <p className="font-bold font-mono text-[hsl(var(--vnx-green))]">{orderBook.bestBid.toFixed(6)}</p>
        </div>
        <div className="text-right">
          <p className="text-muted-foreground">Best Ask</p>
          <p className="font-bold font-mono text-destructive">{orderBook.bestAsk.toFixed(6)}</p>
        </div>
      </div>

      {/* Header */}
      <div className="grid grid-cols-3 gap-2 pb-2 border-b border-border/50 text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
        <div>Price</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Total</div>
      </div>

      {/* Asks */}
      <div className="space-y-px max-h-56 overflow-y-auto mb-3">
        {orderBook.asks.length > 0 ? (
          orderBook.asks.slice(0, 12).reverse().map((ask, idx) => {
            const k = `ask-${ask.price}`;
            const widthPct = Math.min((ask.quantity / maxAsk) * 100, 100);
            return (
              <div
                key={`${k}-${idx}`}
                className={`relative grid grid-cols-3 gap-2 text-xs px-2 py-1 rounded transition-all ${isFlashing(k) ? "bg-destructive/30 animate-fade-in" : "hover:bg-destructive/5"}`}
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-destructive/10 rounded transition-all duration-500"
                  style={{ width: `${widthPct}%` }}
                />
                <div className="relative text-destructive font-mono font-semibold">{ask.price.toFixed(6)}</div>
                <div className="relative text-right font-mono">{ask.quantity.toFixed(4)}</div>
                <div className="relative text-right font-mono text-muted-foreground">
                  {(ask.price * ask.quantity).toFixed(4)}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-muted-foreground text-center py-3">No sell orders</p>
        )}
      </div>

      {/* Mid price */}
      <div className="py-3 my-2 text-center border-y border-border/50">
        <span className="text-xl font-bold font-mono">{orderBook.midPrice.toFixed(6)}</span>
        <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-wider">
          Spread {((orderBook.spread / Math.max(orderBook.midPrice, 1e-9)) * 100).toFixed(3)}%
        </p>
      </div>

      {/* Bids */}
      <div className="space-y-px max-h-56 overflow-y-auto mt-3">
        {orderBook.bids.length > 0 ? (
          orderBook.bids.slice(0, 12).map((bid, idx) => {
            const k = `bid-${bid.price}`;
            const widthPct = Math.min((bid.quantity / maxBid) * 100, 100);
            return (
              <div
                key={`${k}-${idx}`}
                className={`relative grid grid-cols-3 gap-2 text-xs px-2 py-1 rounded transition-all ${isFlashing(k) ? "bg-[hsl(var(--vnx-green))]/30 animate-fade-in" : "hover:bg-[hsl(var(--vnx-green))]/5"}`}
              >
                <div
                  className="absolute right-0 top-0 bottom-0 bg-[hsl(var(--vnx-green))]/10 rounded transition-all duration-500"
                  style={{ width: `${widthPct}%` }}
                />
                <div className="relative text-[hsl(var(--vnx-green))] font-mono font-semibold">{bid.price.toFixed(6)}</div>
                <div className="relative text-right font-mono">{bid.quantity.toFixed(4)}</div>
                <div className="relative text-right font-mono text-muted-foreground">
                  {(bid.price * bid.quantity).toFixed(4)}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-xs text-muted-foreground text-center py-3">No buy orders</p>
        )}
      </div>
    </div>
  );
};

export default OrderBook;
