import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wallet, TrendingUp, Shield, Zap, LineChart } from "lucide-react";
import Navigation from "@/components/Navigation";
import PriceCard from "@/components/PriceCard";
import StatsCard from "@/components/StatsCard";
import { useVNXPrice } from "@/hooks/useVNXPrice";

const Index = () => {
  const { data: vnxPrice } = useVNXPrice();

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center animate-slide-up">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              The Future of{" "}
              <span className="text-gradient">Decentralized Trading</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              VyronexVNX - Your gateway to multi-chain DeFi. Trade, stake, and manage your crypto portfolio with enterprise-grade security.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/wallet">
                <Button size="lg" className="gap-2 shadow-glow">
                  Get Started <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <Link to="/trade">
                <Button size="lg" variant="outline" className="gap-2">
                  <LineChart className="h-5 w-5" />
                  Trade Now
                </Button>
              </Link>
              <Link to="/markets">
                <Button size="lg" variant="outline" className="gap-2">
                  View Markets
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* VNX Price Section */}
      <section className="py-12 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">VNX Token</h2>
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              <PriceCard
                symbol="VNX"
                name="Vyronex Token"
                price={vnxPrice?.price || 0.000542}
                change24h={vnxPrice?.change24h || 2.45}
                volume={`$${((vnxPrice?.volume24h || 125000) / 1000).toFixed(1)}K`}
              />
              <div className="grid grid-cols-2 gap-4">
                <StatsCard
                  icon={TrendingUp}
                  label="Market Cap"
                  value={`$${((vnxPrice?.marketCap || 5420000) / 1000000).toFixed(2)}M`}
                />
                <StatsCard
                  icon={Wallet}
                  label="Total Supply"
                  value="10B VNX"
                />
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">
              Why Choose VyronexVNX?
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-lg border border-border hover:border-primary transition-smooth">
                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mb-4">
                  <Wallet className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Multi-Chain</h3>
                <p className="text-muted-foreground">
                  Support for Ethereum, BNB, Tron, Bitcoin, Fantom, and Solana networks.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-border hover:border-primary transition-smooth">
                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">DeFi Ready</h3>
                <p className="text-muted-foreground">
                  Stake, farm, and provide liquidity with VNX token priority.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-border hover:border-primary transition-smooth">
                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Secure</h3>
                <p className="text-muted-foreground">
                  Enterprise-grade encryption with biometric and hardware wallet support.
                </p>
              </div>

              <div className="p-6 rounded-lg border border-border hover:border-primary transition-smooth">
                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold mb-2">Real-Time</h3>
                <p className="text-muted-foreground">
                  Live market data, instant transactions, and real-time price updates.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 mt-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center text-muted-foreground">
            <p>© 2025 VyronexVNX. All rights reserved.</p>
            <p className="text-sm mt-2">
              Contract: 0xeb55a55c384095ced21587afbe7418b7c9ae40cb
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
