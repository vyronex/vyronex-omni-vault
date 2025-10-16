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
import { useAuth } from "@/hooks/useAuth";

const Index = () => {
  const { data: vnxPrice } = useVNXPrice();
  const { user } = useAuth();

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
              {user ? (
                <>
                  <Link to="/wallet">
                    <Button size="lg" className="gap-2 shadow-glow-lg hover-glow animate-slide-up">
                      Open Wallet <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/trade">
                    <Button size="lg" variant="outline" className="gap-2 glass-card hover-lift">
                      <LineChart className="h-5 w-5" />
                      Trade Now
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button size="lg" className="gap-2 shadow-glow-lg hover-glow animate-slide-up">
                      Get Started <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/markets">
                    <Button size="lg" variant="outline" className="gap-2 glass-card hover-lift">
                      View Markets
                    </Button>
                  </Link>
                </>
              )}
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

      {/* Testimonials Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(1_99%_48%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                What <span className="text-gradient">Traders</span> Say
              </h2>
              <p className="text-muted-foreground">Trusted by thousands of traders worldwide</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Alex Chen", role: "Day Trader", text: "Best multi-chain platform I've used. Lightning fast trades and great UI!" },
                { name: "Sarah Johnson", role: "Crypto Investor", text: "The staking rewards are incredible. I've earned 15% more with VNX staking." },
                { name: "Michael Rodriguez", role: "DeFi Enthusiast", text: "Finally a platform that supports all my favorite chains in one place!" },
              ].map((testimonial, i) => (
                <div key={i} className="p-6 rounded-lg glass-card hover-lift">
                  <p className="text-sm text-muted-foreground mb-4 italic">"{testimonial.text}"</p>
                  <div>
                    <p className="font-bold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,hsl(25_95%_53%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="text-gradient">Bank-Grade</span> Security
              </h2>
              <p className="text-muted-foreground">Your assets are protected with industry-leading security</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Cold Storage", desc: "95% of funds stored offline" },
                { title: "2FA Authentication", desc: "Multi-factor authentication" },
                { title: "Encrypted Data", desc: "AES-256 encryption" },
                { title: "Insurance Fund", desc: "$100M protection fund" },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-lg glass-card hover-lift text-center">
                  <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                    <Shield className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_60%,hsl(45_93%_58%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Trusted <span className="text-gradient">Partners</span>
              </h2>
              <p className="text-muted-foreground">Integrated with leading blockchain platforms</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {["Ethereum", "BNB Chain", "Tron", "Bitcoin", "Fantom", "Solana"].map((partner, i) => (
                <div key={i} className="p-6 rounded-lg glass-card hover-lift flex items-center justify-center">
                  <span className="font-bold text-gradient">{partner}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Token Economics */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,hsl(1_99%_48%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="text-gradient">Token</span> Economics
              </h2>
              <p className="text-muted-foreground">Sustainable tokenomics for long-term growth</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-lg glass-card shadow-elevated">
                <h3 className="text-xl font-bold mb-6">Distribution</h3>
                <div className="space-y-4">
                  {[
                    { label: "Public Sale", percent: "40%", amount: "4B VNX" },
                    { label: "Staking Rewards", percent: "25%", amount: "2.5B VNX" },
                    { label: "Team & Advisors", percent: "15%", amount: "1.5B VNX" },
                    { label: "Liquidity", percent: "10%", amount: "1B VNX" },
                    { label: "Marketing", percent: "10%", amount: "1B VNX" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-muted-foreground">{item.label}</span>
                      <div className="text-right">
                        <span className="font-bold">{item.percent}</span>
                        <span className="text-sm text-muted-foreground ml-2">({item.amount})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-8 rounded-lg glass-card shadow-elevated">
                <h3 className="text-xl font-bold mb-6">Utility</h3>
                <div className="space-y-4">
                  {[
                    { title: "Trading Fee Discounts", desc: "Up to 50% off trading fees" },
                    { title: "Staking Rewards", desc: "Earn 12.5% APR on staked VNX" },
                    { title: "Governance Rights", desc: "Vote on platform decisions" },
                    { title: "Premium Features", desc: "Access to advanced tools" },
                    { title: "Launchpad Access", desc: "Early access to new tokens" },
                  ].map((item, i) => (
                    <div key={i}>
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(25_95%_53%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 md:p-12 rounded-lg glass-card shadow-elevated text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Stay <span className="text-gradient">Updated</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Get the latest news, updates, and exclusive offers delivered to your inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:border-primary"
                />
                <Button size="lg" className="shadow-glow hover-glow">
                  Subscribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Join 50,000+ traders receiving weekly insights
              </p>
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
