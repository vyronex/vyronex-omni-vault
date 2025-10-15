import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wallet, TrendingUp, Shield, Zap, LineChart } from "lucide-react";
import Navigation from "@/components/Navigation";
import PriceCard from "@/components/PriceCard";
import StatsCard from "@/components/StatsCard";
import LivePricesTable from "@/components/LivePricesTable";
import TradingModes from "@/components/TradingModes";
import QuickSwap from "@/components/QuickSwap";
import Footer from "@/components/Footer";
import { useVNXPrice } from "@/hooks/useVNXPrice";

const Index = () => {
  const { data: vnxPrice } = useVNXPrice();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(1_99%_48%/0.15),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,hsl(25_95%_53%/0.1),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-block mb-6 px-4 py-2 rounded-full glass-card text-sm font-semibold">
              🚀 Multi-Chain DeFi Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              The Future of{" "}
              <span className="text-gradient animate-pulse-glow">Decentralized Trading</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              VyronexVNX - Your gateway to multi-chain DeFi. Trade, stake, and manage your crypto portfolio with enterprise-grade security.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/wallet">
                <Button size="lg" className="gap-2 shadow-glow-lg hover-glow animate-slide-up">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/trade">
                <Button size="lg" variant="outline" className="gap-2 glass-card hover-lift">
                  <LineChart className="h-5 w-5" />
                  Trade Now
                </Button>
              </Link>
              <Link to="/markets">
                <Button size="lg" variant="outline" className="gap-2 glass-card hover-lift">
                  View Markets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* VNX Price Section */}
      <section className="py-16 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,hsl(1_99%_48%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="text-gradient">VNX Token</span>
              </h2>
              <p className="text-muted-foreground">Real-time token metrics and performance</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <div className="hover-lift">
                <PriceCard
                  symbol="VNX"
                  name="Vyronex Token"
                  price={vnxPrice?.price || 0.000542}
                  change24h={vnxPrice?.change24h || 2.45}
                  volume={`$${((vnxPrice?.volume24h || 125000) / 1000).toFixed(1)}K`}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="hover-lift">
                  <StatsCard
                    icon={TrendingUp}
                    label="Market Cap"
                    value={`$${((vnxPrice?.marketCap || 5420000) / 1000000).toFixed(2)}M`}
                  />
                </div>
                <div className="hover-lift">
                  <StatsCard
                    icon={Wallet}
                    label="Total Supply"
                    value="10B VNX"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              <a 
                href="https://pancakeswap.finance/info/tokens/0xeb55a55c384095ced21587afbe7418b7c9ae40cb" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  View on PancakeSwap
                </Button>
              </a>
              <a 
                href="https://apespace.io/bsc/0xeb55a55c384095ced21587afbe7418b7c9ae40cb" 
                target="_blank" 
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="sm">
                  View on ApeSpace
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,hsl(25_95%_53%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Why Choose <span className="text-gradient">VyronexVNX</span>?
              </h2>
              <p className="text-muted-foreground">Enterprise-grade features for modern traders</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-lg glass-card hover-lift group">
                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-glow group-hover:shadow-glow-lg transition-all">
                  <Wallet className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Multi-Chain</h3>
                <p className="text-muted-foreground text-sm">
                  Support for Ethereum, BNB, Tron, Bitcoin, Fantom, and Solana networks.
                </p>
              </div>

              <div className="p-6 rounded-lg glass-card hover-lift group">
                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-glow group-hover:shadow-glow-lg transition-all">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">DeFi Ready</h3>
                <p className="text-muted-foreground text-sm">
                  Stake, farm, and provide liquidity with VNX token priority.
                </p>
              </div>

              <div className="p-6 rounded-lg glass-card hover-lift group">
                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-glow group-hover:shadow-glow-lg transition-all">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Secure</h3>
                <p className="text-muted-foreground text-sm">
                  Enterprise-grade encryption with biometric and hardware wallet support.
                </p>
              </div>

              <div className="p-6 rounded-lg glass-card hover-lift group">
                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-glow group-hover:shadow-glow-lg transition-all">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Real-Time</h3>
                <p className="text-muted-foreground text-sm">
                  Live market data, instant transactions, and real-time price updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Prices Section */}
      <section className="py-16 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(1_99%_48%/0.05),transparent_70%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="text-gradient">Live Market</span> Prices
              </h2>
              <p className="text-muted-foreground">
                Real-time prices for top 50 cryptocurrencies
              </p>
            </div>
            <div className="rounded-lg glass-card overflow-hidden shadow-elevated hover-lift">
              <LivePricesTable />
            </div>
          </div>
        </div>
      </section>

      {/* Trading Modes Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(45_93%_58%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="text-gradient">Trading</span> Modes
              </h2>
              <p className="text-muted-foreground">
                Choose the trading style that fits your strategy
              </p>
            </div>
            <TradingModes />
          </div>
        </div>
      </section>

      {/* Quick Swap Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(1_99%_48%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="text-gradient">Quick</span> Swap
              </h2>
              <p className="text-muted-foreground">
                Swap tokens instantly across multiple blockchains
              </p>
            </div>
            <div className="hover-lift">
              <QuickSwap />
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,hsl(25_95%_53%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="text-gradient">Roadmap</span>
              </h2>
              <p className="text-muted-foreground">Our journey to revolutionize DeFi</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { quarter: "Q4 2024", title: "Platform Launch", items: ["Multi-chain wallet", "VNX token launch", "Basic trading"] },
                { quarter: "Q1 2025", title: "DeFi Expansion", items: ["Staking pools", "Liquidity farming", "Governance"] },
                { quarter: "Q2 2025", title: "Advanced Trading", items: ["Margin trading", "Futures contracts", "Options"] },
                { quarter: "Q3 2025", title: "Enterprise", items: ["API access", "White-label", "Institutional"] },
              ].map((phase, i) => (
                <div key={i} className="p-6 rounded-lg glass-card hover-lift">
                  <div className="text-sm font-semibold text-primary mb-2">{phase.quarter}</div>
                  <h3 className="text-xl font-bold mb-4">{phase.title}</h3>
                  <ul className="space-y-2">
                    {phase.items.map((item, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Community Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_60%,hsl(1_99%_48%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Join Our <span className="text-gradient">Community</span>
              </h2>
              <p className="text-muted-foreground">Connect with traders worldwide</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-8 rounded-lg glass-card hover-lift text-center">
                <div className="text-4xl font-bold text-gradient mb-2">50K+</div>
                <p className="text-muted-foreground">Active Users</p>
              </div>
              <div className="p-8 rounded-lg glass-card hover-lift text-center">
                <div className="text-4xl font-bold text-gradient mb-2">$2.5B+</div>
                <p className="text-muted-foreground">Trading Volume</p>
              </div>
              <div className="p-8 rounded-lg glass-card hover-lift text-center">
                <div className="text-4xl font-bold text-gradient mb-2">6+</div>
                <p className="text-muted-foreground">Supported Chains</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,hsl(45_93%_58%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="text-gradient">FAQ</span>
              </h2>
              <p className="text-muted-foreground">Common questions about VyronexVNX</p>
            </div>
            <div className="space-y-4">
              {[
                { q: "What is VNX token?", a: "VNX is the native utility token of VyronexVNX platform, used for trading fees, staking rewards, and governance." },
                { q: "Which chains are supported?", a: "We support Ethereum, BNB Chain, Tron, Bitcoin, Fantom, and Solana networks." },
                { q: "How do I start trading?", a: "Connect your wallet, deposit funds, and start trading with our intuitive interface." },
                { q: "What are the trading fees?", a: "Standard trading fees are 0.1%, with discounts for VNX token holders." },
              ].map((faq, i) => (
                <div key={i} className="p-6 rounded-lg glass-card hover-lift">
                  <h3 className="font-bold mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Index;
