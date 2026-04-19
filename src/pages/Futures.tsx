import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { useDerivatives, useDerivativesExchanges } from "@/hooks/useCoinGecko";
import PageTransition from "@/components/PageTransition";
import OpenOrdersPanel from "@/components/OpenOrdersPanel";
import { useTradeNotifications } from "@/hooks/useTradeNotifications";
import { useAuth } from "@/hooks/useAuth";

const Futures = () => {
  const { user } = useAuth();
  useTradeNotifications();
  const { data: derivatives, isLoading } = useDerivatives();
  const { data: exchanges } = useDerivativesExchanges();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
      <Navigation />

      {/* Page Header */}
      <section className="page-header">
        <div className="absolute inset-0 gradient-hero" />
        <div className="page-header-content">
          <div className="max-w-7xl mx-auto animate-slide-up">
            <span className="section-badge">Derivatives</span>
            <h1 className="page-title">
              Futures & <span className="text-gradient">Derivatives</span>
            </h1>
            <p className="page-subtitle">Live derivatives market data from top exchanges</p>
          </div>
        </div>
      </section>

      <div className="section-container py-8">
        <div className="max-w-7xl mx-auto">

          {/* Derivatives Exchanges */}
          {exchanges && exchanges.length > 0 && (
            <div className="mb-10 animate-slide-up stagger-1">
              <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                Top <span className="text-gradient">Exchanges</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {exchanges.slice(0, 10).map((ex: any, i: number) => (
                  <Card key={ex.id} className="card-modern !p-4 text-center">
                    <CardContent className="p-0">
                      {ex.image && <img src={ex.image} alt={ex.name} className="w-9 h-9 rounded-full mx-auto mb-2" />}
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
          <div className="rounded-2xl bg-card border border-border/40 shadow-elevated overflow-hidden animate-slide-up stagger-2">
            <div className="p-5 border-b border-border/40">
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                Live Perpetual & <span className="text-gradient">Futures</span> Contracts
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="table-modern">
                <thead>
                  <tr>
                    <th>Market</th>
                    <th>Symbol</th>
                    <th>Price</th>
                    <th>24h %</th>
                    <th className="hidden md:table-cell">Index Price</th>
                    <th className="hidden md:table-cell">Basis</th>
                    <th className="hidden lg:table-cell">Spread</th>
                    <th className="hidden lg:table-cell">Funding Rate</th>
                    <th className="hidden xl:table-cell">OI</th>
                    <th className="hidden xl:table-cell">Volume (24h)</th>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr><td colSpan={10} className="p-12 text-center text-muted-foreground">
                      <div className="h-6 w-6 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                    </td></tr>
                  ) : !derivatives || derivatives.length === 0 ? (
                    <tr><td colSpan={10} className="p-12 text-center text-muted-foreground">No data available</td></tr>
                  ) : (
                    derivatives.slice(0, 50).map((d: any, i: number) => {
                      const pct = d.price_percentage_change_24h;
                      const isPositive = (pct || 0) >= 0;
                      return (
                        <tr
                          key={i}
                          className="animate-fade-in"
                          style={{ animationDelay: `${i * 20}ms`, animationFillMode: "both" }}
                        >
                          <td className="text-sm font-semibold">{d.market || "—"}</td>
                          <td className="text-sm">{d.symbol || "—"}</td>
                          <td className="text-sm font-mono">${Number(d.price || 0).toLocaleString()}</td>
                          <td>
                            <span className={`text-sm font-semibold ${isPositive ? "text-[hsl(var(--vnx-green))]" : "text-[hsl(var(--vnx-red))]"}`}>
                              {isPositive ? '+' : ''}{Math.abs(pct || 0).toFixed(2)}%
                            </span>
                          </td>
                          <td className="hidden md:table-cell text-sm text-muted-foreground">
                            ${Number(d.index || 0).toLocaleString()}
                          </td>
                          <td className="hidden md:table-cell text-sm text-muted-foreground">
                            {d.basis != null ? `${Number(d.basis).toFixed(4)}%` : "—"}
                          </td>
                          <td className="hidden lg:table-cell text-sm text-muted-foreground">
                            {d.spread != null ? `${Number(d.spread).toFixed(4)}%` : "—"}
                          </td>
                          <td className="hidden lg:table-cell text-sm text-muted-foreground">
                            {d.funding_rate != null ? `${Number(d.funding_rate).toFixed(4)}%` : "—"}
                          </td>
                          <td className="hidden xl:table-cell text-sm text-muted-foreground">
                            {d.open_interest ? `$${(Number(d.open_interest) / 1e6).toFixed(1)}M` : "—"}
                          </td>
                          <td className="hidden xl:table-cell text-sm text-muted-foreground">
                            {d.volume_24h ? `$${(Number(d.volume_24h) / 1e6).toFixed(1)}M` : "—"}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
    </PageTransition>
  );
};

export default Futures;
