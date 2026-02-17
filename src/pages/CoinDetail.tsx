import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import PriceChart from "@/components/PriceChart";
import { useCoinDetail } from "@/hooks/useCoinGecko";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, ExternalLink, TrendingUp, TrendingDown, Globe, BarChart3 } from "lucide-react";

const fmt = (n: number | undefined | null, decimals = 2) => {
  if (n == null) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(decimals)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(decimals)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(decimals)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(decimals)}K`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 6 })}`;
};

const StatBlock = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="p-4 rounded-lg border border-border bg-card animate-fade-in">
    <p className="text-xs text-muted-foreground mb-1">{label}</p>
    <p className="text-lg font-bold font-mono">{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
  </div>
);

const CoinDetail = () => {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const { data: coin, isLoading } = useCoinDetail(coinId || "");

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-8 max-w-6xl space-y-6">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[300px] w-full rounded-lg" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!coin || coin.error) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold mb-4">Coin not found</h1>
          <Button onClick={() => navigate("/markets")} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Markets
          </Button>
        </div>
      </div>
    );
  }

  const md = coin.market_data;
  const pct24h = md?.price_change_percentage_24h;
  const isPositive = (pct24h || 0) >= 0;

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/markets")}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img
              src={coin.image?.large || coin.image?.small}
              alt={coin.name}
              className="w-12 h-12 rounded-full"
            />
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                {coin.name}
                <span className="text-lg text-muted-foreground font-normal uppercase">
                  {coin.symbol}
                </span>
                {coin.market_cap_rank && (
                  <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">
                    Rank #{coin.market_cap_rank}
                  </span>
                )}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-bold font-mono animate-count-up">
                  {fmt(md?.current_price?.usd)}
                </span>
                {pct24h != null && (
                  <span
                    className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}
                  >
                    {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(pct24h).toFixed(2)}% (24h)
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            {coin.links?.homepage?.[0] && (
              <Button variant="outline" size="sm" asChild>
                <a href={coin.links.homepage[0]} target="_blank" rel="noopener noreferrer">
                  <Globe className="h-4 w-4 mr-1" /> Website
                </a>
              </Button>
            )}
            {coin.links?.blockchain_site?.[0] && (
              <Button variant="outline" size="sm" asChild>
                <a href={coin.links.blockchain_site[0]} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4 mr-1" /> Explorer
                </a>
              </Button>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="mb-6">
          <PriceChart coinId={coinId || ""} coinName={coin.name} />
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatBlock label="Market Cap" value={fmt(md?.market_cap?.usd)} />
          <StatBlock label="24h Volume" value={fmt(md?.total_volume?.usd)} />
          <StatBlock label="Circulating Supply" value={md?.circulating_supply ? `${(md.circulating_supply / 1e6).toFixed(2)}M` : "—"} sub={coin.symbol?.toUpperCase()} />
          <StatBlock label="Total Supply" value={md?.total_supply ? `${(md.total_supply / 1e6).toFixed(2)}M` : "∞"} />
          <StatBlock label="24h High" value={fmt(md?.high_24h?.usd)} />
          <StatBlock label="24h Low" value={fmt(md?.low_24h?.usd)} />
          <StatBlock label="ATH" value={fmt(md?.ath?.usd)} sub={md?.ath_date?.usd ? new Date(md.ath_date.usd).toLocaleDateString() : undefined} />
          <StatBlock label="ATL" value={fmt(md?.atl?.usd)} sub={md?.atl_date?.usd ? new Date(md.atl_date.usd).toLocaleDateString() : undefined} />
        </div>

        {/* Price Changes */}
        <Card className="shadow-card mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" /> Price Change
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { label: "1h", val: md?.price_change_percentage_1h_in_currency?.usd },
                { label: "24h", val: md?.price_change_percentage_24h },
                { label: "7d", val: md?.price_change_percentage_7d },
                { label: "30d", val: md?.price_change_percentage_30d },
                { label: "1y", val: md?.price_change_percentage_1y },
              ].map(({ label, val }) => (
                <div key={label} className="text-center p-3 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-1">{label}</p>
                  {val != null ? (
                    <p className={`font-bold ${val >= 0 ? "text-green-500" : "text-red-500"}`}>
                      {val >= 0 ? "+" : ""}{val.toFixed(2)}%
                    </p>
                  ) : (
                    <p className="text-muted-foreground">—</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        {coin.description?.en && (
          <Card className="shadow-card animate-fade-in">
            <CardHeader>
              <CardTitle>About {coin.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="prose prose-sm max-w-none text-foreground/80 [&_a]:text-primary [&_a]:underline"
                dangerouslySetInnerHTML={{ __html: coin.description.en.split(". ").slice(0, 8).join(". ") + "." }}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default CoinDetail;
