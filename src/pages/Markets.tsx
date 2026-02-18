import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PriceCard from "@/components/PriceCard";
import StatsCard from "@/components/StatsCard";
import PriceChart from "@/components/PriceChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVNXPrice } from "@/hooks/useVNXPrice";
import { useMarketData, useGlobalData, useTrending } from "@/hooks/useCoinGecko";
import { TrendingUp, TrendingDown, Flame, Globe, BarChart3 } from "lucide-react";

const Markets = () => {
  const navigate = useNavigate();
  const { data: vnxPrice } = useVNXPrice();
  const { data: coins, isLoading: coinsLoading } = useMarketData(20);
  const { data: globalData } = useGlobalData();
  const { data: trending } = useTrending();
  const [chartCoinId, setChartCoinId] = useState("bitcoin");

  const global = globalData?.data;
  const trendingCoins = trending?.coins?.slice(0, 6) || [];

  // Derive top gainer / loser from live data
  const topGainer = coins?.reduce((best: any, c: any) =>
    !best || (c.price_change_percentage_24h || 0) > (best.price_change_percentage_24h || 0) ? c : best, null);
  const topLoser = coins?.reduce((worst: any, c: any) =>
    !worst || (c.price_change_percentage_24h || 0) < (worst.price_change_percentage_24h || 0) ? c : worst, null);
  const highestVol = coins?.reduce((best: any, c: any) =>
    !best || (c.total_volume || 0) > (best.total_volume || 0) ? c : best, null);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Markets</h1>
            <p className="text-muted-foreground">Real-time cryptocurrency market data powered by CoinGecko</p>
          </div>

          {/* Global Stats */}
          {global && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatsCard
                label="Total Market Cap"
                value={`$${(global.total_market_cap?.usd / 1e12).toFixed(2)}T`}
                change={`${global.market_cap_change_percentage_24h_usd?.toFixed(2)}% (24h)`}
              />
              <StatsCard
                label="24h Volume"
                value={`$${(global.total_volume?.usd / 1e9).toFixed(1)}B`}
              />
              <StatsCard
                label="BTC Dominance"
                value={`${global.market_cap_percentage?.btc?.toFixed(1)}%`}
              />
              <StatsCard
                label="Active Coins"
                value={global.active_cryptocurrencies?.toLocaleString() || "—"}
              />
            </div>
          )}

          {/* VNX Featured */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Featured</h2>
            <PriceCard
              symbol="VNX"
              name="VyronexVNX Token"
              price={vnxPrice?.price || 0}
              change24h={vnxPrice?.change24h || 0}
              volume={vnxPrice?.volume24h ? `$${(vnxPrice.volume24h / 1000).toFixed(1)}K` : "$0"}
            />
          </div>

          {/* Price Chart */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Price Chart
            </h2>
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              {(coins || []).slice(0, 10).map((c: any) => (
                <button
                  key={c.id}
                  onClick={() => setChartCoinId(c.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    chartCoinId === c.id
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card border-border text-foreground hover:bg-accent"
                  }`}
                >
                  <img src={c.image} alt={c.symbol} className="w-4 h-4 rounded-full" />
                  {c.symbol?.toUpperCase()}
                </button>
              ))}
            </div>
            <PriceChart
              coinId={chartCoinId}
              coinName={coins?.find((c: any) => c.id === chartCoinId)?.name || chartCoinId}
            />
          </div>

          {/* Trending Coins */}
          {trendingCoins.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                <Flame className="h-5 w-5 text-primary" /> Trending
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {trendingCoins.map((t: any, i: number) => {
                  const item = t.item;
                  return (
                    <Card key={i} className="shadow-card hover:shadow-glow transition-smooth">
                      <CardContent className="p-4 text-center">
                        <img src={item.thumb} alt={item.symbol} className="w-8 h-8 rounded-full mx-auto mb-2" />
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
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Top Assets
            </h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full">
                <thead className="bg-card border-b border-border">
                  <tr className="text-left">
                    <th className="p-3 font-semibold text-sm">#</th>
                    <th className="p-3 font-semibold text-sm">Name</th>
                    <th className="p-3 font-semibold text-sm">Price</th>
                    <th className="p-3 font-semibold text-sm">1h %</th>
                    <th className="p-3 font-semibold text-sm">24h %</th>
                    <th className="p-3 font-semibold text-sm">7d %</th>
                    <th className="p-3 font-semibold text-sm hidden md:table-cell">Market Cap</th>
                    <th className="p-3 font-semibold text-sm hidden lg:table-cell">Volume (24h)</th>
                  </tr>
                </thead>
                <tbody>
                  {coinsLoading ? (
                    <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading live data…</td></tr>
                  ) : coins?.map((c: any, i: number) => (
                    <tr
                      key={c.id}
                      className="border-b border-border/50 hover:bg-accent/5 transition-colors cursor-pointer animate-fade-in"
                      style={{ animationDelay: `${i * 25}ms`, animationFillMode: "both" }}
                      onClick={() => navigate(`/coin/${c.id}`)}
                    >
                      <td className="p-3 text-muted-foreground">{i + 1}</td>
                      <td className="p-3">
                        <div className="flex items-center gap-2">
                          <img src={c.image} alt={c.symbol} className="w-6 h-6 rounded-full" />
                          <div>
                            <div className="font-semibold text-sm">{c.name}</div>
                            <div className="text-xs text-muted-foreground uppercase">{c.symbol}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-3 font-mono text-sm">${Number(c.current_price).toLocaleString()}</td>
                      <td className="p-3">
                        <PctBadge value={c.price_change_percentage_1h_in_currency} />
                      </td>
                      <td className="p-3">
                        <PctBadge value={c.price_change_percentage_24h} />
                      </td>
                      <td className="p-3">
                        <PctBadge value={c.price_change_percentage_7d_in_currency} />
                      </td>
                      <td className="p-3 hidden md:table-cell text-muted-foreground text-sm">
                        ${(c.market_cap / 1e9).toFixed(2)}B
                      </td>
                      <td className="p-3 hidden lg:table-cell text-muted-foreground text-sm">
                        ${(c.total_volume / 1e6).toFixed(1)}M
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Market Insights — live */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Market Insights (Live)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Top Gainer (24h)</h3>
                  {topGainer ? (
                    <div className="flex items-center gap-2">
                      <img src={topGainer.image} alt="" className="w-6 h-6 rounded-full" />
                      <span className="font-bold text-lg">{topGainer.symbol?.toUpperCase()}</span>
                      <span className="text-green-500 font-semibold">
                        +{topGainer.price_change_percentage_24h?.toFixed(2)}%
                      </span>
                    </div>
                  ) : <span className="text-muted-foreground">—</span>}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Top Loser (24h)</h3>
                  {topLoser ? (
                    <div className="flex items-center gap-2">
                      <img src={topLoser.image} alt="" className="w-6 h-6 rounded-full" />
                      <span className="font-bold text-lg">{topLoser.symbol?.toUpperCase()}</span>
                      <span className="text-red-500 font-semibold">
                        {topLoser.price_change_percentage_24h?.toFixed(2)}%
                      </span>
                    </div>
                  ) : <span className="text-muted-foreground">—</span>}
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Highest Volume</h3>
                  {highestVol ? (
                    <div className="flex items-center gap-2">
                      <img src={highestVol.image} alt="" className="w-6 h-6 rounded-full" />
                      <span className="font-bold text-lg">{highestVol.symbol?.toUpperCase()}</span>
                      <span className="text-muted-foreground">
                        ${(highestVol.total_volume / 1e9).toFixed(2)}B
                      </span>
                    </div>
                  ) : <span className="text-muted-foreground">—</span>}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Dominance from global */}
          {global && (
            <Card className="shadow-card mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" /> Market Dominance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-1">BTC Dominance</p>
                    <p className="text-2xl font-bold">{global.market_cap_percentage?.btc?.toFixed(1)}%</p>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${global.market_cap_percentage?.btc || 0}%` }} />
                    </div>
                  </div>
                  <div className="p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-1">ETH Dominance</p>
                    <p className="text-2xl font-bold">{global.market_cap_percentage?.eth?.toFixed(1)}%</p>
                    <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${global.market_cap_percentage?.eth || 0}%` }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

const PctBadge = ({ value }: { value?: number | null }) => {
  if (value == null) return <span className="text-muted-foreground text-sm">—</span>;
  const isPositive = value >= 0;
  return (
    <span className={`flex items-center gap-0.5 text-sm font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}>
      {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
      {Math.abs(value).toFixed(2)}%
    </span>
  );
};

export default Markets;
