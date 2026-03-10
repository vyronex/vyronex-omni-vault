import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PriceChart from "@/components/PriceChart";
import PriceCard from "@/components/PriceCard";
import StatsCard from "@/components/StatsCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useVNXPrice } from "@/hooks/useVNXPrice";
import { ExternalLink, Copy, Shield, Coins, Vote, Zap, TrendingUp, BarChart3 } from "lucide-react";
import { toast } from "sonner";

const CONTRACT = "0xeb55a55c384095ced21587afbe7418b7c9ae40cb";

const VNXToken = () => {
  const { data: vnxPrice, isLoading } = useVNXPrice();

  const copyContract = () => {
    navigator.clipboard.writeText(CONTRACT);
    toast.success("Contract address copied!");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Hero */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_30%,hsl(1_99%_48%/0.2),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full glass-card text-sm font-semibold">
              <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xs">V</span>
              </div>
              BEP-20 Token on BNB Chain
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              <span className="text-gradient">VNX</span> Token
            </h1>
            <p className="text-lg text-muted-foreground mb-4 max-w-2xl mx-auto">
              The native utility token powering the VyronexVNX ecosystem — trade, stake, govern, and earn.
            </p>
            <div className="flex items-center justify-center gap-2 mb-8">
              <code className="px-4 py-2 rounded-lg bg-card border border-border text-xs font-mono text-muted-foreground">
                {CONTRACT}
              </code>
              <Button variant="ghost" size="icon" onClick={copyContract}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-3 justify-center flex-wrap">
              <a href={`https://pancakeswap.finance/swap?outputCurrency=${CONTRACT}`} target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="shadow-glow-lg hover-glow">Buy VNX on PancakeSwap</Button>
              </a>
              <Link to="/stake">
                <Button size="lg" variant="outline" className="glass-card hover-lift">Stake VNX</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Price */}
      <section className="py-16 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(1_99%_48%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Live <span className="text-gradient">Price</span>
              </h2>
              <p className="text-muted-foreground text-sm">Real-time data from DexScreener</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="hover-lift">
                <PriceCard
                  symbol="VNX"
                  name="Vyronex Token"
                  price={vnxPrice?.price || 0}
                  change24h={vnxPrice?.change24h || 0}
                  volume={vnxPrice?.volume24h ? `$${(vnxPrice.volume24h / 1000).toFixed(1)}K` : "$0"}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="hover-lift">
                  <StatsCard label="Market Cap" value={`$${((vnxPrice?.marketCap || 0) / 1e6).toFixed(2)}M`} />
                </div>
                <div className="hover-lift">
                  <StatsCard label="24h Volume" value={`$${((vnxPrice?.volume24h || 0) / 1000).toFixed(1)}K`} />
                </div>
                <div className="hover-lift">
                  <StatsCard label="Total Supply" value="10B VNX" />
                </div>
                <div className="hover-lift">
                  <StatsCard label="Network" value="BNB Chain" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chart */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(25_95%_53%/0.06),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-primary" /> Price <span className="text-gradient">Chart</span>
            </h2>
            <div className="glass-card rounded-lg p-4 shadow-elevated">
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 text-primary/40" />
                <p className="font-semibold mb-2">VNX Price Chart</p>
                <p className="text-sm">View real-time charts on DexScreener for detailed analysis</p>
                <a
                  href={`https://dexscreener.com/bsc/${CONTRACT}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-4"
                >
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" /> View on DexScreener
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tokenomics */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,hsl(1_99%_48%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                <span className="text-gradient">Tokenomics</span>
              </h2>
              <p className="text-muted-foreground text-sm">Sustainable distribution for long-term growth</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              {/* Distribution */}
              <Card className="shadow-elevated glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Coins className="h-5 w-5 text-primary" /> Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { label: "Public Sale", pct: 40, color: "bg-primary" },
                      { label: "Staking Rewards", pct: 25, color: "bg-[hsl(25_95%_53%)]" },
                      { label: "Team & Advisors", pct: 15, color: "bg-[hsl(45_93%_58%)]" },
                      { label: "Liquidity", pct: 10, color: "bg-primary/60" },
                      { label: "Marketing", pct: 10, color: "bg-primary/30" },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-muted-foreground">{item.label}</span>
                          <span className="font-semibold">{item.pct}% ({(item.pct / 10).toFixed(0)}B VNX)</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${item.color} transition-all duration-1000`} style={{ width: `${item.pct}%` }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Utility */}
              <Card className="shadow-elevated glass-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Zap className="h-5 w-5 text-primary" /> Utility</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {[
                      { icon: <Coins className="h-5 w-5 text-primary" />, title: "Trading Fee Discounts", desc: "Up to 50% off all trading fees" },
                      { icon: <TrendingUp className="h-5 w-5 text-primary" />, title: "Staking Rewards", desc: "Earn up to 12.5% APR on staked VNX" },
                      { icon: <Vote className="h-5 w-5 text-primary" />, title: "Governance", desc: "Vote on platform proposals and upgrades" },
                      { icon: <Shield className="h-5 w-5 text-primary" />, title: "Premium Access", desc: "Unlock advanced trading tools and analytics" },
                      { icon: <Zap className="h-5 w-5 text-primary" />, title: "Launchpad", desc: "Early access to new token listings" },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-3 p-3 rounded-lg bg-background/50 hover-lift">
                        {item.icon}
                        <div>
                          <p className="font-semibold text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* How to Buy */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_60%,hsl(25_95%_53%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                How to <span className="text-gradient">Buy VNX</span>
              </h2>
              <p className="text-muted-foreground text-sm">Get VNX in 3 simple steps</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { step: "1", title: "Get BNB", desc: "Purchase BNB from any exchange and transfer to your wallet (MetaMask, Trust Wallet)" },
                { step: "2", title: "Connect to PancakeSwap", desc: "Go to PancakeSwap, connect your wallet, and paste the VNX contract address" },
                { step: "3", title: "Swap for VNX", desc: "Enter the amount of BNB to swap, set slippage to 1-3%, and confirm" },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-lg glass-card hover-lift text-center animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                  <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                    <span className="text-xl font-bold text-primary-foreground">{item.step}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Staking Integration */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,hsl(45_93%_58%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-4">
                  Stake <span className="text-gradient">VNX</span> & Earn
                </h2>
                <p className="text-muted-foreground mb-6">
                  Lock your VNX tokens to earn passive rewards. Multiple pools with flexible terms from 30 to 365 days.
                </p>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  {[
                    { label: "Standard Pool", apr: "12.5% APR", lock: "Flexible" },
                    { label: "Premium Pool", apr: "18.0% APR", lock: "30 days" },
                    { label: "LP Pool", apr: "25.5% APR", lock: "Flexible" },
                    { label: "Elite Pool", apr: "30.0% APR", lock: "90 days" },
                  ].map((pool, i) => (
                    <div key={i} className="p-3 rounded-lg glass-card hover-lift">
                      <p className="font-semibold text-sm">{pool.label}</p>
                      <p className="text-lg font-bold text-gradient">{pool.apr}</p>
                      <p className="text-xs text-muted-foreground">{pool.lock}</p>
                    </div>
                  ))}
                </div>
                <Link to="/stake">
                  <Button size="lg" className="shadow-glow hover-glow">Start Staking</Button>
                </Link>
              </div>
              <div className="p-8 rounded-lg glass-card shadow-elevated">
                <h3 className="text-lg font-bold mb-4">Staking Calculator</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-background/50">
                    <p className="text-xs text-muted-foreground mb-1">If you stake</p>
                    <p className="text-2xl font-bold">100,000 VNX</p>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-background/50 text-center">
                      <p className="text-xs text-muted-foreground">30 days</p>
                      <p className="font-bold text-gradient">1,042 VNX</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 text-center">
                      <p className="text-xs text-muted-foreground">90 days</p>
                      <p className="font-bold text-gradient">3,125 VNX</p>
                    </div>
                    <div className="p-3 rounded-lg bg-background/50 text-center">
                      <p className="text-xs text-muted-foreground">1 year</p>
                      <p className="font-bold text-gradient">12,500 VNX</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contract Links */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(1_99%_48%/0.06),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-2">
                Contract <span className="text-gradient">Info</span>
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "BSCScan", url: `https://bscscan.com/token/${CONTRACT}` },
                { label: "PancakeSwap", url: `https://pancakeswap.finance/swap?outputCurrency=${CONTRACT}` },
                { label: "DexScreener", url: `https://dexscreener.com/bsc/${CONTRACT}` },
                { label: "ApeSpace", url: `https://apespace.io/bsc/${CONTRACT}` },
              ].map((link, i) => (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-4 rounded-lg glass-card hover-lift text-center group"
                >
                  <p className="font-semibold text-sm group-hover:text-primary transition-colors">{link.label}</p>
                  <ExternalLink className="h-3 w-3 mx-auto mt-1 text-muted-foreground" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default VNXToken;
