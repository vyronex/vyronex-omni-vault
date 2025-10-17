import { useOrderBook } from "@/hooks/useOrderBook";
import { ArrowDown, ArrowUp } from "lucide-react";

interface OrderBookProps {
  tradingPairId: string;
}

const OrderBook = ({ tradingPairId }: OrderBookProps) => {
  const { orderBook, loading } = useOrderBook(tradingPairId);

  if (loading) {
    return (
      <div className="glass-card rounded-lg p-6 shadow-card">
        <h3 className="text-lg font-semibold mb-4">Order Book</h3>
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading order book...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card rounded-lg p-6 shadow-card">
      <h3 className="text-lg font-semibold mb-4">Order Book</h3>

      {/* Market Stats */}
      {orderBook && (
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-muted/20 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Mid Price</p>
            <p className="text-lg font-bold">{orderBook.midPrice.toFixed(6)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Spread</p>
            <p className="text-lg font-bold">{orderBook.spread.toFixed(6)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Best Bid</p>
            <p className="text-lg font-bold text-green-500">{orderBook.bestBid.toFixed(6)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Best Ask</p>
            <p className="text-lg font-bold text-red-500">{orderBook.bestAsk.toFixed(6)}</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="grid grid-cols-3 gap-2 pb-2 border-b border-border/50 text-xs text-muted-foreground mb-2">
        <div>Price</div>
        <div className="text-right">Amount</div>
        <div className="text-right">Total</div>
      </div>

      {/* Asks (Sell Orders) - Red */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-2">
          <ArrowDown className="h-4 w-4 text-red-500" />
          <span className="text-sm font-semibold text-red-500">Asks</span>
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {orderBook?.asks && orderBook.asks.length > 0 ? (
            orderBook.asks.slice(0, 15).reverse().map((ask, idx) => (
              <div
                key={idx}
                className="grid grid-cols-3 gap-2 text-sm hover:bg-red-500/10 px-2 py-1 rounded transition-colors"
              >
                <div className="text-red-500 font-mono">{ask.price.toFixed(6)}</div>
                <div className="text-right font-mono">{ask.quantity.toFixed(4)}</div>
                <div className="text-right font-mono text-muted-foreground">
                  {(ask.price * ask.quantity).toFixed(4)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No sell orders</p>
          )}
        </div>
      </div>

      {/* Spread Indicator */}
      {orderBook && (
        <div className="py-3 text-center border-y border-border/50 my-3">
          <span className="text-2xl font-bold">{orderBook.midPrice.toFixed(6)}</span>
          <p className="text-xs text-muted-foreground mt-1">
            Spread: {orderBook.spread.toFixed(6)} ({((orderBook.spread / orderBook.midPrice) * 100).toFixed(2)}%)
          </p>
        </div>
      )}

      {/* Bids (Buy Orders) - Green */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <ArrowUp className="h-4 w-4 text-green-500" />
          <span className="text-sm font-semibold text-green-500">Bids</span>
        </div>
        <div className="space-y-1 max-h-48 overflow-y-auto">
          {orderBook?.bids && orderBook.bids.length > 0 ? (
            orderBook.bids.slice(0, 15).map((bid, idx) => (
              <div
                key={idx}
                className="grid grid-cols-3 gap-2 text-sm hover:bg-green-500/10 px-2 py-1 rounded transition-colors"
              >
                <div className="text-green-500 font-mono">{bid.price.toFixed(6)}</div>
                <div className="text-right font-mono">{bid.quantity.toFixed(4)}</div>
                <div className="text-right font-mono text-muted-foreground">
                  {(bid.price * bid.quantity).toFixed(4)}
                </div>
              </div>
            ))
          ) : (
            <p className="text-xs text-muted-foreground text-center py-4">No buy orders</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;
