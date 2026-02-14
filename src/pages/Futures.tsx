import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDerivatives, useDerivativesExchanges } from "@/hooks/useCoinGecko";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const Futures = () => {
  const { data: derivatives, isLoading } = useDerivatives();
  const { data: exchanges } = useDerivativesExchanges();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Futures & Derivatives</h1>
            <p className="text-muted-foreground">Live derivatives market data from top exchanges</p>
          </div>

          {/* Derivatives Exchanges */}
          {exchanges && exchanges.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" /> Top Derivatives Exchanges
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {exchanges.slice(0, 10).map((ex: any) => (
                  <Card key={ex.id} className="shadow-card hover:shadow-glow transition-smooth">
                    <CardContent className="p-4 text-center">
                      {ex.image && <img src={ex.image} alt={ex.name} className="w-8 h-8 rounded-full mx-auto mb-2" />}
                      <p className="font-semibold text-sm">{ex.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        OI: ${((ex.open_interest_btc || 0) * 69000 / 1e9).toFixed(2)}B
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Vol: {(ex.trade_volume_24h_btc || 0).toLocaleString()} BTC
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Derivatives Tickers Table */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Live Perpetual & Futures Contracts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-border">
                    <tr className="text-left">
                      <th className="p-3 font-semibold text-sm">Market</th>
                      <th className="p-3 font-semibold text-sm">Symbol</th>
                      <th className="p-3 font-semibold text-sm">Price</th>
                      <th className="p-3 font-semibold text-sm">24h %</th>
                      <th className="p-3 font-semibold text-sm hidden md:table-cell">Index Price</th>
                      <th className="p-3 font-semibold text-sm hidden md:table-cell">Basis</th>
                      <th className="p-3 font-semibold text-sm hidden lg:table-cell">Spread</th>
                      <th className="p-3 font-semibold text-sm hidden lg:table-cell">Funding Rate</th>
                      <th className="p-3 font-semibold text-sm hidden xl:table-cell">OI</th>
                      <th className="p-3 font-semibold text-sm hidden xl:table-cell">Volume (24h)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">Loading derivatives data…</td></tr>
                    ) : !derivatives || derivatives.length === 0 ? (
                      <tr><td colSpan={10} className="p-8 text-center text-muted-foreground">No data available</td></tr>
                    ) : (
                      derivatives.slice(0, 50).map((d: any, i: number) => {
                        const pct = d.price_percentage_change_24h;
                        const isPositive = (pct || 0) >= 0;
                        return (
                          <tr key={i} className="border-b border-border/50 hover:bg-accent/5 transition-colors">
                            <td className="p-3 text-sm font-semibold">{d.market || "—"}</td>
                            <td className="p-3 text-sm">{d.symbol || "—"}</td>
                            <td className="p-3 text-sm font-mono">${Number(d.price || 0).toLocaleString()}</td>
                            <td className="p-3">
                              <span className={`flex items-center gap-0.5 text-sm font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
                                {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                                {Math.abs(pct || 0).toFixed(2)}%
                              </span>
                            </td>
                            <td className="p-3 hidden md:table-cell text-sm text-muted-foreground">
                              ${Number(d.index || 0).toLocaleString()}
                            </td>
                            <td className="p-3 hidden md:table-cell text-sm text-muted-foreground">
                              {d.basis != null ? `${Number(d.basis).toFixed(4)}%` : "—"}
                            </td>
                            <td className="p-3 hidden lg:table-cell text-sm text-muted-foreground">
                              {d.spread != null ? `${Number(d.spread).toFixed(4)}%` : "—"}
                            </td>
                            <td className="p-3 hidden lg:table-cell text-sm text-muted-foreground">
                              {d.funding_rate != null ? `${Number(d.funding_rate).toFixed(4)}%` : "—"}
                            </td>
                            <td className="p-3 hidden xl:table-cell text-sm text-muted-foreground">
                              {d.open_interest ? `$${(Number(d.open_interest) / 1e6).toFixed(1)}M` : "—"}
                            </td>
                            <td className="p-3 hidden xl:table-cell text-sm text-muted-foreground">
                              {d.volume_24h ? `$${(Number(d.volume_24h) / 1e6).toFixed(1)}M` : "—"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Futures;
