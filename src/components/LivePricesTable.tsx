import { TrendingUp, TrendingDown } from "lucide-react";
import { useCoinLayerPrices } from "@/hooks/useCoinLayerPrices";

const LivePricesTable = () => {
  const { data: coins, isLoading } = useCoinLayerPrices();

  if (isLoading) {
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
          </tr>
        </thead>
        <tbody>
          {coins?.map((coin, idx) => {
            const isPositive = coin.change24h >= 0;
            return (
              <tr key={coin.symbol} className="border-b border-border/50 hover:bg-accent/5 transition-colors">
                <td className="p-3 text-muted-foreground">{idx + 1}</td>
                <td className="p-3">
                  <div>
                    <div className="font-semibold">{coin.name}</div>
                    <div className="text-sm text-muted-foreground uppercase">{coin.symbol}</div>
                  </div>
                </td>
                <td className="p-3 font-mono">${coin.price.toFixed(2)}</td>
                <td className="p-3">
                  <div className={`flex items-center gap-1 font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(coin.change24h).toFixed(2)}%
                  </div>
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
