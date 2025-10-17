import { useOrderBook } from "@/hooks/useOrderBook";
import { Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface TradeHistoryProps {
  tradingPairId: string;
}

const TradeHistory = ({ tradingPairId }: TradeHistoryProps) => {
  const { orderBook, loading } = useOrderBook(tradingPairId);

  return (
    <div className="glass-card rounded-lg p-6 shadow-card">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5" />
        <h3 className="text-lg font-semibold">Recent Trades</h3>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-96">
          <p className="text-muted-foreground">Loading trades...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 pb-2 border-b border-border/50 text-xs text-muted-foreground mb-2">
            <div>Price</div>
            <div className="text-right">Amount</div>
            <div className="text-right">Time</div>
          </div>

          <div className="space-y-1 max-h-[600px] overflow-y-auto">
            {orderBook?.recentTrades && orderBook.recentTrades.length > 0 ? (
              orderBook.recentTrades.map((trade: any) => (
                <div
                  key={trade.id}
                  className="grid grid-cols-3 gap-2 text-sm hover:bg-muted/20 px-2 py-1.5 rounded transition-colors"
                >
                  <div className={`font-mono ${trade.price > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {parseFloat(trade.price).toFixed(6)}
                  </div>
                  <div className="text-right font-mono">
                    {parseFloat(trade.quantity).toFixed(4)}
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(trade.created_at), { addSuffix: true })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No recent trades</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default TradeHistory;
