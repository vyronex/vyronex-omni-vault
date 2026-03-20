import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PriceCard from "@/components/PriceCard";
import StatsCard from "@/components/StatsCard";
import PriceChart from "@/components/PriceChart";
import { Card, CardContent } from "@/components/ui/card";
import { useVNXPrice } from "@/hooks/useVNXPrice";
import { useMarketData, useGlobalData, useTrending } from "@/hooks/useCoinGecko";
import PageTransition from "@/components/PageTransition";

const Markets = () => {
  const navigate = useNavigate();
  const { data: vnxPrice } = useVNXPrice();
  const { data: coins, isLoading: coinsLoading } = useMarketData(20);
  const { data: globalData } = useGlobalData();
  const { data: trending } = useTrending();
  const [chartCoinId, setChartCoinId] = useState("bitcoin");

  const global = globalData?.data;
  const trendingCoins = trending?.coins?.slice(0, 6) || [];

  const topGainer = coins?.reduce((best: any, c: any) =>
    !best || (c.price_change_percentage_24h || 0) > (best.price_change_percentage_24h || 0) ? c : best, null);
  const topLoser = coins?.reduce((worst: any, c: any) =>
    !worst || (c.price_change_percentage_24h || 0) < (worst.price_change_percentage_24h || 0) ? c : worst, null);
  const highestVol = coins?.reduce((best: any, c: any) =>
    !best || (c.total_volume || 0) > (best.total_volume || 0) ? c : best, null);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
      <Navigation />

      {/* Page Header */}
      <section className="page-header">
        <div className="absolute inset-0 gradient-hero" />
        <div className="page-header-content">
          <div className="max-w-6xl mx-auto animate-slide-up">
            <span className="section-badge">Real-Time</span>
            <h1 className="page-title">
              <span className="text-gradient">Markets</span>
            </h1>
            <p className="page-subtitle">Real-time cryptocurrency market data powered by CoinGecko</p>
          </div>
        </div>
      </section>

      <div className="section-container py-8">
        <div className="max-w-6xl mx-auto">

          {/* Global Stats */}
          {global && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: "Total Market Cap", value: `$${(global.total_market_cap?.usd / 1e12).toFixed(2)}T`, change: `${global.market_cap_change_percentage_24h_usd?.toFixed(2)}% (24h)` },
                { label: "24h Volume", value: `$${(global.total_volume?.usd / 1e9).toFixed(1)}B` },
                { label: "BTC Dominance", value: `${global.market_cap_percentage?.btc?.toFixed(1)}%` },
                { label: "Active Coins", value: global.active_cryptocurrencies?.toLocaleString() || "—" },
              ].map((stat, i) => (
                <div key={i} className={`animate-slide-up stagger-${i + 1}`}>
                  <StatsCard label={stat.label} value={stat.value} change={stat.change} />
                </div>
              ))}
            </div>
          )}

          {/* VNX Featured */}
          <div className="mb-10 animate-slide-up stagger-2">
            <div className="flex items-center gap-3 mb-5">
              <span className="section-badge">Featured</span>
            </div>
            <div className="hover-lift">
              <PriceCard
                symbol="VNX"
                name="VyronexVNX Token"
                price={vnxPrice?.price || 0}
                change24h={vnxPrice?.change24h || 0}
                volume={vnxPrice?.volume24h ? `$${(vnxPrice.volume24h / 1000).toFixed(1)}K` : "$0"}
              />
            </div>
          </div>

          {/* Price Chart */}
          <div className="mb-10 animate-slide-up stagger-3">
            <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
              Price <span className="text-gradient">Chart</span>
            </h2>
            <div className="flex items-center gap-2 mb-5 flex-wrap">
              {(coins || []).slice(0, 10).map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setChartCoinId(c.id)}
                  className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium border transition-all duration-200 active-press ${
                    chartCoinId === c.id
                      ? "bg-primary text-primary-foreground border-primary shadow-glow"
                      : "bg-card border-border/40 text-foreground hover:border-primary/30"
                  }`}
                >
                  <img src={c.image} alt={c.symbol} className="w-4 h-4 rounded-full" />
                  {c.symbol?.toUpperCase()}
                </button>
              ))}
            </div>
            <div className="rounded-2xl bg-card border border-border/40 shadow-card overflow-hidden">
              <PriceChart
                coinId={chartCoinId}
                coinName={coins?.find((c: any) => c.id === chartCoinId)?.name || chartCoinId}
              />
            </div>
          </div>

          {/* Trending Coins */}
          {trendingCoins.length > 0 && (
            <div className="mb-10 animate-slide-up stagger-4">
              <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                <span className="text-gradient">Trending</span>
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {trendingCoins.map((t: any, i: number) => {
                  const item = t.item;
                  return (
                    <Card key={i} className="card-modern !p-4 text-center">
                      <CardContent className="p-0">
                        <img src={item.thumb} alt={item.symbol} className="w-9 h-9 rounded-full mx-auto mb-2" />
                        <p className="font-semibold text-sm">{item.symbol}</p>
                        <p className="text-xs text-muted-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">Rank #{item.market_cap_rank || "—"}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Live Market Table */}
          <div className="mb-10 animate-slide-up stagger-5">
            <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
              Top <span className="text-gradient">Assets</span>
            </h2>
            <div className="rounded-2xl bg-card border border-border/40 shadow-elevated overflow-hidden">
              <div className="overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Name</th>
                      <th>Price</th>
                      <th>1h %</th>
                      <th>24h %</th>
                      <th>7d %</th>
                      <th className="hidden md:table-cell">Market Cap</th>
                      <th className="hidden lg:table-cell">Volume (24h)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coinsLoading ? (
                      <tr><td colSpan={8} className="p-12 text-center text-muted-foreground">
                        <div className="h-6 w-6 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      </td></tr>
                    ) : coins?.map((c: any, i: number) => (
                      <tr
                        key={c.id}
                        className="cursor-pointer animate-fade-in"
                        style={{ animationDelay: `${i * 25}ms`, animationFillMode: "both" }}
                        onClick={() => navigate(`/coin/${c.id}`)}
                      >
                        <td className="text-muted-foreground">{i + 1}</td>
                        <td>
                          <div className="flex items-center gap-2.5">
                            <img src={c.image} alt={c.symbol} className="w-7 h-7 rounded-full" />
                            <div>
                              <div className="font-semibold text-sm">{c.name}</div>
                              <div className="text-xs text-muted-foreground uppercase">{c.symbol}</div>
                            </div>
                          </div>
                        </td>
                        <td className="font-mono text-sm">${Number(c.current_price).toLocaleString()}</td>
                        <td><PctBadge value={c.price_change_percentage_1h_in_currency} /></td>
                        <td><PctBadge value={c.price_change_percentage_24h} /></td>
                        <td><PctBadge value={c.price_change_percentage_7d_in_currency} /></td>
                        <td className="hidden md:table-cell text-muted-foreground text-sm">
                          ${(c.market_cap / 1e9).toFixed(2)}B
                        </td>
                        <td className="hidden lg:table-cell text-muted-foreground text-sm">
                          ${(c.total_volume / 1e6).toFixed(1)}M
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Market Insights */}
          <div className="data-card mb-8 animate-slide-up stagger-6">
            <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
              Market <span className="text-gradient">Insights</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { label: "Top Gainer (24h)", data: topGainer, isGainer: true },
                { label: "Top Loser (24h)", data: topLoser, isGainer: false },
                { label: "Highest Volume", data: highestVol, isVolume: true },
              ].map((insight, i) => (
                <div key={i} className="p-4 rounded-xl bg-background/50 border border-border/30">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3">{insight.label}</p>
                  {insight.data ? (
                    <div className="flex items-center gap-3">
                      <img src={insight.data.image} alt="" className="w-8 h-8 rounded-full" />
                      <div>
                        <span className="font-bold">{insight.data.symbol?.toUpperCase()}</span>
                        <p className={`text-sm font-semibold ${
                          insight.isVolume ? 'text-muted-foreground' :
                          insight.isGainer ? 'text-[hsl(var(--vnx-green))]' : 'text-[hsl(var(--vnx-red))]'
                        }`}>
                          {insight.isVolume
                            ? `$${(insight.data.total_volume / 1e9).toFixed(2)}B`
                            : `${insight.isGainer ? '+' : ''}${insight.data.price_change_percentage_24h?.toFixed(2)}%`
                          }
                        </p>
                      </div>
                    </div>
                  ) : <span className="text-muted-foreground">—</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Market Dominance */}
          {global && (
            <div className="data-card animate-slide-up">
              <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                Market <span className="text-gradient">Dominance</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                {[
                  { label: "BTC Dominance", value: global.market_cap_percentage?.btc },
                  { label: "ETH Dominance", value: global.market_cap_percentage?.eth },
                ].map((item, i) => (
                  <div key={i} className="p-5 rounded-xl bg-background/50 border border-border/30">
                    <p className="text-sm text-muted-foreground mb-1">{item.label}</p>
                    <p className="text-3xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk', system-ui" }}>{item.value?.toFixed(1)}%</p>
                    <div className="h-2.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full gradient-primary transition-all duration-1000" style={{ width: `${item.value || 0}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
    </PageTransition>
  );
};

const PctBadge = ({ value }: { value?: number | null }) => {
  if (value == null) return <span className="text-muted-foreground text-sm">—</span>;
  const isPositive = value >= 0;
  return (
    <span className={`text-sm font-semibold ${isPositive ? "text-[hsl(var(--vnx-green))]" : "text-[hsl(var(--vnx-red))]"}`}>
      {isPositive ? '+' : ''}{Math.abs(value).toFixed(2)}%
    </span>
  );
};

export default Markets;
