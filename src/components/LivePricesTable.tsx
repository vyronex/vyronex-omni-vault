import { TrendingUp, TrendingDown } from "lucide-react";
import { useMarketData } from "@/hooks/useCoinGecko";

const LivePricesTable = () => {
  const { data: coins, isLoading: loading } = useMarketData(50);

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Loading live prices...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="sticky top-0 bg-card border-b border-border">
          <tr className="text-left">
            <th className="p-3 font-semibold">#</th>
            <th className="p-3 font-semibold">Name</th>
            <th className="p-3 font-semibold">Price</th>
            <th className="p-3 font-semibold">24h %</th>
            <th className="p-3 font-semibold hidden md:table-cell">Market Cap</th>
            <th className="p-3 font-semibold hidden lg:table-cell">Volume (24h)</th>
          </tr>
        </thead>
        <tbody>
          {(coins || []).map((coin: any, idx: number) => {
            const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
            return (
              <tr key={coin.id} className="border-b border-border/50 hover:bg-accent/5 transition-colors">
                <td className="p-3 text-muted-foreground">{idx + 1}</td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    <img src={coin.image} alt={coin.symbol} className="w-6 h-6 rounded-full" />
                    <div>
                      <div className="font-semibold">{coin.name}</div>
                      <div className="text-sm text-muted-foreground uppercase">{coin.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="p-3 font-mono">${coin.current_price?.toLocaleString()}</td>
                <td className="p-3">
                  <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {coin.price_change_percentage_24h?.toFixed(2)}%
                  </div>
                </td>
                <td className="p-3 hidden md:table-cell text-muted-foreground">
                  ${((coin.market_cap || 0) / 1e9).toFixed(2)}B
                </td>
                <td className="p-3 hidden lg:table-cell text-muted-foreground">
                  ${((coin.total_volume || 0) / 1e6).toFixed(2)}M
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default LivePricesTable;
