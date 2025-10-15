import Navigation from "@/components/Navigation";
import PriceCard from "@/components/PriceCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVNXPrice } from "@/hooks/useVNXPrice";

const Markets = () => {
  const { data: vnxPrice } = useVNXPrice();

  // Demo market data (in production, fetch real-time from APIs)
  const markets = [
    {
      symbol: "BTC",
      name: "Bitcoin",
      price: 98250.50,
      change24h: 3.25,
      volume: "$52.4B",
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      price: 3542.75,
      change24h: 5.12,
      volume: "$28.1B",
    },
    {
      symbol: "BNB",
      name: "BNB",
      price: 678.90,
      change24h: 2.45,
      volume: "$2.8B",
    },
    {
      symbol: "SOL",
      name: "Solana",
      price: 198.45,
      change24h: -1.23,
      volume: "$4.2B",
    },
    {
      symbol: "TRX",
      name: "Tron",
      price: 0.2456,
      change24h: 1.85,
      volume: "$890M",
    },
    {
      symbol: "FTM",
      name: "Fantom",
      price: 0.8923,
      change24h: 4.67,
      volume: "$345M",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Markets</h1>
            <p className="text-muted-foreground">Real-time cryptocurrency market data</p>
          </div>

          {/* VNX Featured */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Featured</h2>
            <PriceCard
              symbol="VNX"
              name="Vyronex Token"
              price={vnxPrice?.price || 0.000542}
              change24h={vnxPrice?.change24h || 2.45}
              volume={`$${((vnxPrice?.volume24h || 125000) / 1000).toFixed(1)}K`}
            />
          </div>

          {/* Market Overview */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Supported Assets</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {markets.map((market) => (
                <PriceCard
                  key={market.symbol}
                  symbol={market.symbol}
                  name={market.name}
                  price={market.price}
                  change24h={market.change24h}
                  volume={market.volume}
                />
              ))}
            </div>
          </div>

          {/* Trading Pairs */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Top Trading Pairs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { pair: "VNX/USDT", price: "0.000542", change: "+2.45%", volume: "$125K" },
                  { pair: "VNX/BNB", price: "0.00000080", change: "+1.23%", volume: "$89K" },
                  { pair: "VNX/BUSD", price: "0.000541", change: "+2.67%", volume: "$67K" },
                ].map((pair, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary transition-smooth"
                  >
                    <div>
                      <p className="font-semibold">{pair.pair}</p>
                      <p className="text-sm text-muted-foreground">24h Volume: {pair.volume}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{pair.price}</p>
                      <p className={`text-sm ${pair.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                        {pair.change}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Insights */}
          <Card className="shadow-card mt-6">
            <CardHeader>
              <CardTitle>Market Insights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">Top Gainer (24h)</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">ETH</span>
                    <span className="text-green-500 font-semibold">+5.12%</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Top Loser (24h)</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">SOL</span>
                    <span className="text-red-500 font-semibold">-1.23%</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Highest Volume</h3>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-lg">BTC</span>
                    <span className="text-muted-foreground">$52.4B</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Watchlist */}
          <Card className="shadow-card mt-6">
            <CardHeader>
              <CardTitle>My Watchlist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { symbol: "VNX", name: "Vyronex", price: 0.000542, change: 2.45 },
                  { symbol: "BTC", name: "Bitcoin", price: 98250.50, change: 3.25 },
                  { symbol: "ETH", name: "Ethereum", price: 3542.75, change: 5.12 },
                ].map((coin, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary transition-smooth">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">{coin.symbol[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{coin.symbol}</p>
                        <p className="text-sm text-muted-foreground">{coin.name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${coin.price.toLocaleString()}</p>
                      <p className={`text-sm ${coin.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {coin.change >= 0 ? '+' : ''}{coin.change}%
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Market Analysis */}
          <Card className="shadow-card mt-6">
            <CardHeader>
              <CardTitle>Market Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">Market Sentiment</h3>
                  <div className="flex items-center gap-4">
                    <div className="flex-1">
                      <div className="h-3 rounded-full bg-card overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 w-[68%]" />
                      </div>
                    </div>
                    <span className="font-bold text-green-500">68% Bullish</span>
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Fear & Greed Index</p>
                    <p className="text-2xl font-bold text-green-500">72</p>
                    <p className="text-sm text-muted-foreground">Greed</p>
                  </div>
                  <div className="p-4 rounded-lg border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Market Dominance</p>
                    <p className="text-2xl font-bold">BTC 45.2%</p>
                    <p className="text-sm text-muted-foreground">ETH 18.8%</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market News */}
          <Card className="shadow-card mt-6">
            <CardHeader>
              <CardTitle>Latest News</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { title: "Bitcoin reaches new all-time high", time: "2 hours ago", tag: "BTC" },
                  { title: "Ethereum upgrade scheduled for Q2", time: "5 hours ago", tag: "ETH" },
                  { title: "VNX announces new partnership", time: "1 day ago", tag: "VNX" },
                  { title: "DeFi TVL surpasses $100B milestone", time: "2 days ago", tag: "DeFi" },
                ].map((news, i) => (
                  <div key={i} className="p-4 rounded-lg border border-border hover:border-primary transition-smooth cursor-pointer">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{news.title}</h4>
                        <p className="text-sm text-muted-foreground">{news.time}</p>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-semibold bg-primary/10 text-primary">
                        {news.tag}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Markets;
