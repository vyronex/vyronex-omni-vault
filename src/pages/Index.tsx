import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Navigation from "@/components/Navigation";
import PriceCard from "@/components/PriceCard";
import StatsCard from "@/components/StatsCard";
import LivePricesTable from "@/components/LivePricesTable";
import TradingModes from "@/components/TradingModes";
import QuickSwap from "@/components/QuickSwap";
import Footer from "@/components/Footer";
import { useVNXPrice } from "@/hooks/useVNXPrice";
import { useAuth } from "@/hooks/useAuth";
import { useScrollRevealContainer } from "@/hooks/useScrollReveal";

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
              Multi-Chain DeFi Platform
            </div>
            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
              The Future of{" "}
              <span className="text-gradient animate-pulse-glow">Decentralized Trading</span>
            </h1>
            <p className="text-[18px] text-muted-foreground mb-8 max-w-2xl mx-auto">
              VyronexVNX - Your gateway to multi-chain DeFi. Trade, stake, and manage your crypto portfolio with enterprise-grade security.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {user ? (
                <>
                  <Link to="/wallet">
                    <Button size="lg" className="gap-2 shadow-glow-lg hover-glow animate-slide-up">
                      Open Wallet
                    </Button>
                  </Link>
                  <Link to="/trade">
                    <Button size="lg" variant="outline" className="gap-2 glass-card hover-lift">
                      Trade Now
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button size="lg" className="gap-2 shadow-glow-lg hover-glow animate-slide-up">
                      Get Started
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
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                <span className="text-gradient">VNX Token</span>
              </h2>
              <p className="text-muted-foreground text-sm">Real-time token metrics and performance</p>
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
                    label="Market Cap"
                    value={`$${((vnxPrice?.marketCap || 5420000) / 1000000).toFixed(2)}M`}
                  />
                </div>
                <div className="hover-lift">
                  <StatsCard
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
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Why Choose <span className="text-gradient">VyronexVNX</span>?
              </h2>
              <p className="text-muted-foreground text-sm">Enterprise-grade features for modern traders</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-lg glass-card hover-lift group">
                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-glow group-hover:shadow-glow-lg transition-all">
                  <span className="text-primary-foreground font-bold">MC</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Multi-Chain</h3>
                <p className="text-muted-foreground text-sm">
                  Support for Ethereum, BNB, Tron, Bitcoin, Fantom, and Solana networks.
                </p>
              </div>

              <div className="p-6 rounded-lg glass-card hover-lift group">
                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-glow group-hover:shadow-glow-lg transition-all">
                  <span className="text-primary-foreground font-bold">DF</span>
                </div>
                <h3 className="text-xl font-bold mb-2">DeFi Ready</h3>
                <p className="text-muted-foreground text-sm">
                  Stake, farm, and provide liquidity with VNX token priority.
                </p>
              </div>

              <div className="p-6 rounded-lg glass-card hover-lift group">
                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-glow group-hover:shadow-glow-lg transition-all">
                  <span className="text-primary-foreground font-bold">SC</span>
                </div>
                <h3 className="text-xl font-bold mb-2">Secure</h3>
                <p className="text-muted-foreground text-sm">
                  Enterprise-grade encryption with biometric and hardware wallet support.
                </p>
              </div>

              <div className="p-6 rounded-lg glass-card hover-lift group">
                <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-glow group-hover:shadow-glow-lg transition-all">
                  <span className="text-primary-foreground font-bold">RT</span>
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

      {/* How It Works Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(45_93%_58%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                How It <span className="text-gradient">Works</span>
              </h2>
              <p className="text-muted-foreground text-sm">Get started in just a few simple steps</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: "1", title: "Create Account", desc: "Sign up with your email and verify your identity securely" },
                { step: "2", title: "Connect Wallet", desc: "Link your crypto wallet or use our built-in multi-chain wallet" },
                { step: "3", title: "Deposit Funds", desc: "Add crypto or fiat to start trading on multiple chains" },
                { step: "4", title: "Start Trading", desc: "Trade, stake, and earn rewards across the DeFi ecosystem" },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-lg glass-card hover-lift text-center">
                  <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                    <span className="text-xl font-bold text-primary-foreground">{item.step}</span>
                  </div>
                  <h3 className="text-[18px] font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Prices Section */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(1_99%_48%/0.05),transparent_70%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                <span className="text-gradient">Live Market</span> Prices
              </h2>
              <p className="text-muted-foreground text-sm">
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
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,hsl(45_93%_58%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                <span className="text-gradient">Trading</span> Modes
              </h2>
              <p className="text-muted-foreground text-sm">
                Choose the trading style that fits your strategy
              </p>
            </div>
            <TradingModes />
          </div>
        </div>
      </section>

      {/* Quick Swap Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,hsl(1_99%_48%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                <span className="text-gradient">Quick</span> Swap
              </h2>
              <p className="text-muted-foreground text-sm">
                Swap tokens instantly across multiple blockchains
              </p>
            </div>
            <div className="hover-lift">
              <QuickSwap />
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_60%,hsl(1_99%_48%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Join Our <span className="text-gradient">Community</span>
              </h2>
              <p className="text-muted-foreground text-sm">Connect with traders worldwide</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="p-8 rounded-lg glass-card hover-lift text-center">
                <div className="text-3xl font-bold text-gradient mb-2">50K+</div>
                <p className="text-muted-foreground text-sm">Active Users</p>
              </div>
              <div className="p-8 rounded-lg glass-card hover-lift text-center">
                <div className="text-3xl font-bold text-gradient mb-2">$2.5B+</div>
                <p className="text-muted-foreground text-sm">Trading Volume</p>
              </div>
              <div className="p-8 rounded-lg glass-card hover-lift text-center">
                <div className="text-3xl font-bold text-gradient mb-2">6+</div>
                <p className="text-muted-foreground text-sm">Supported Chains</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(1_99%_48%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                What <span className="text-gradient">Traders</span> Say
              </h2>
              <p className="text-muted-foreground text-sm">Trusted by thousands of traders worldwide</p>
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

      {/* FAQ Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,hsl(45_93%_58%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Frequently Asked <span className="text-gradient">Questions</span>
              </h2>
              <p className="text-muted-foreground text-sm">Common questions about VyronexVNX</p>
            </div>
            <div className="space-y-4">
              {[
                { q: "What is VNX token?", a: "VNX is the native utility token of VyronexVNX platform, used for trading fees, staking rewards, and governance." },
                { q: "Which chains are supported?", a: "We support Ethereum, BNB Chain, Tron, Bitcoin, Fantom, and Solana networks." },
                { q: "How do I start trading?", a: "Connect your wallet, deposit funds, and start trading with our intuitive interface." },
                { q: "What are the trading fees?", a: "Standard trading fees are 0.1%, with discounts for VNX token holders." },
                { q: "Is my money safe?", a: "Yes, we use enterprise-grade security including cold storage, 2FA, and AES-256 encryption." },
                { q: "How do staking rewards work?", a: "Stake VNX tokens to earn up to 12.5% APR. Rewards are distributed daily and can be claimed anytime." },
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

      {/* Roadmap Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_40%,hsl(25_95%_53%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                <span className="text-gradient">Roadmap</span>
              </h2>
              <p className="text-muted-foreground text-sm">Our journey to revolutionize DeFi</p>
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
                  <h3 className="text-[18px] font-bold mb-4">{phase.title}</h3>
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

      {/* Security Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,hsl(25_95%_53%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                <span className="text-gradient">Bank-Grade</span> Security
              </h2>
              <p className="text-muted-foreground text-sm">Your assets are protected with industry-leading security</p>
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
                    <span className="text-primary-foreground font-bold text-sm">{item.title.substring(0, 2).toUpperCase()}</span>
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
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_60%,hsl(45_93%_58%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Trusted <span className="text-gradient">Partners</span>
              </h2>
              <p className="text-muted-foreground text-sm">Integrated with leading blockchain platforms</p>
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
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_50%,hsl(1_99%_48%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                <span className="text-gradient">Token</span> Economics
              </h2>
              <p className="text-muted-foreground text-sm">Sustainable tokenomics for long-term growth</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-lg glass-card shadow-elevated">
                <h3 className="text-[18px] font-bold mb-6">Distribution</h3>
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
                <h3 className="text-[18px] font-bold mb-6">Utility</h3>
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

      {/* Supported Assets Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,hsl(1_99%_48%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Supported <span className="text-gradient">Assets</span>
              </h2>
              <p className="text-muted-foreground text-sm">Trade hundreds of tokens across multiple chains</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { symbol: "BTC", name: "Bitcoin", chain: "Bitcoin" },
                { symbol: "ETH", name: "Ethereum", chain: "Ethereum" },
                { symbol: "BNB", name: "BNB", chain: "BSC" },
                { symbol: "SOL", name: "Solana", chain: "Solana" },
                { symbol: "TRX", name: "Tron", chain: "Tron" },
                { symbol: "FTM", name: "Fantom", chain: "Fantom" },
                { symbol: "USDT", name: "Tether", chain: "Multi" },
                { symbol: "USDC", name: "USD Coin", chain: "Multi" },
                { symbol: "DAI", name: "Dai", chain: "Ethereum" },
                { symbol: "LINK", name: "Chainlink", chain: "Multi" },
                { symbol: "UNI", name: "Uniswap", chain: "Ethereum" },
                { symbol: "VNX", name: "VyronexVNX", chain: "BSC" },
              ].map((asset, i) => (
                <div key={i} className="p-4 rounded-lg glass-card hover-lift text-center">
                  <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center mx-auto mb-2">
                    <span className="text-primary-foreground font-bold text-xs">{asset.symbol.substring(0, 3)}</span>
                  </div>
                  <p className="font-bold text-sm">{asset.symbol}</p>
                  <p className="text-xs text-muted-foreground">{asset.name}</p>
                  <p className="text-xs text-primary mt-1">{asset.chain}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Earn & Yield Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_70%,hsl(45_93%_58%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Earn <span className="text-gradient">Passive Income</span>
              </h2>
              <p className="text-muted-foreground text-sm">Multiple ways to grow your portfolio while you sleep</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Staking", apr: "12.5%", desc: "Lock VNX tokens and earn daily rewards with flexible or fixed terms", badge: "Popular" },
                { title: "Liquidity Mining", apr: "18.2%", desc: "Provide liquidity to trading pairs and earn a share of trading fees", badge: "High Yield" },
                { title: "Yield Farming", apr: "24.8%", desc: "Optimize returns across DeFi protocols with automated strategies", badge: "Advanced" },
              ].map((earn, i) => (
                <div key={i} className="p-6 rounded-lg glass-card hover-lift">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-[18px] font-bold">{earn.title}</h3>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">{earn.badge}</span>
                  </div>
                  <div className="text-3xl font-bold text-gradient mb-2">Up to {earn.apr}</div>
                  <p className="text-sm text-muted-foreground mb-4">{earn.desc}</p>
                  <Link to="/stake">
                    <Button variant="outline" size="sm" className="w-full">Start Earning</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Comparison Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,hsl(1_99%_48%/0.06),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Why <span className="text-gradient">VyronexVNX</span> Stands Out
              </h2>
              <p className="text-muted-foreground text-sm">See how we compare to other platforms</p>
            </div>
            <div className="rounded-lg glass-card shadow-elevated overflow-hidden">
              <div className="grid grid-cols-4 gap-0 text-sm">
                <div className="p-4 font-bold border-b border-border">Feature</div>
                <div className="p-4 font-bold border-b border-border text-center text-gradient">VyronexVNX</div>
                <div className="p-4 font-bold border-b border-border text-center text-muted-foreground">CEX</div>
                <div className="p-4 font-bold border-b border-border text-center text-muted-foreground">Other DEX</div>
                {[
                  { feature: "Multi-Chain", vnx: "Yes", cex: "Limited", other: "No" },
                  { feature: "Self-Custody", vnx: "Yes", cex: "No", other: "Yes" },
                  { feature: "Low Fees", vnx: "0.1%", cex: "0.2-0.5%", other: "0.3%+" },
                  { feature: "Staking", vnx: "12.5% APR", cex: "3-5%", other: "Variable" },
                  { feature: "Fiat On-Ramp", vnx: "Yes", cex: "Yes", other: "No" },
                  { feature: "No KYC Required", vnx: "Optional", cex: "Required", other: "No" },
                ].map((row, i) => (
                  <div key={i} className="contents">
                    <div className="p-4 border-b border-border/50 text-muted-foreground">{row.feature}</div>
                    <div className="p-4 border-b border-border/50 text-center font-semibold text-primary">{row.vnx}</div>
                    <div className="p-4 border-b border-border/50 text-center text-muted-foreground">{row.cex}</div>
                    <div className="p-4 border-b border-border/50 text-center text-muted-foreground">{row.other}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Governance Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,hsl(25_95%_53%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Community <span className="text-gradient">Governance</span>
              </h2>
              <p className="text-muted-foreground text-sm">Shape the future of VyronexVNX with your vote</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-lg glass-card shadow-elevated">
                <h3 className="text-[18px] font-bold mb-4">How Governance Works</h3>
                <div className="space-y-4">
                  {[
                    { step: "1", title: "Hold VNX", desc: "Stake VNX tokens to gain voting power" },
                    { step: "2", title: "Propose", desc: "Submit proposals for platform improvements" },
                    { step: "3", title: "Vote", desc: "Cast your vote on active proposals" },
                    { step: "4", title: "Execute", desc: "Approved proposals are implemented" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center shrink-0">
                        <span className="text-primary-foreground font-bold text-xs">{item.step}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-8 rounded-lg glass-card shadow-elevated">
                <h3 className="text-[18px] font-bold mb-4">Active Proposals</h3>
                <div className="space-y-4">
                  {[
                    { title: "Reduce Trading Fees to 0.08%", votes: "12,450", status: "Active" },
                    { title: "Add Avalanche Chain Support", votes: "8,320", status: "Active" },
                    { title: "Increase Staking APR to 15%", votes: "15,780", status: "Passed" },
                    { title: "Launch NFT Marketplace", votes: "6,100", status: "Voting" },
                  ].map((proposal, i) => (
                    <div key={i} className="p-3 rounded-lg bg-background/50 border border-border/50">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-sm">{proposal.title}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${proposal.status === 'Passed' ? 'bg-green-500/10 text-green-500' : 'bg-primary/10 text-primary'}`}>
                          {proposal.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{proposal.votes} votes</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer API Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,hsl(1_99%_48%/0.06),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Built for <span className="text-gradient">Developers</span>
              </h2>
              <p className="text-muted-foreground text-sm">Integrate VyronexVNX into your applications with our powerful API</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { title: "REST API", desc: "Full-featured REST endpoints for trading, market data, and account management" },
                { title: "WebSocket", desc: "Real-time market data streams with sub-millisecond latency" },
                { title: "SDK Libraries", desc: "Official SDKs for JavaScript, Python, Go, and Rust" },
              ].map((api, i) => (
                <div key={i} className="p-6 rounded-lg glass-card hover-lift">
                  <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center mb-4">
                    <span className="text-primary-foreground font-bold text-xs">{api.title.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <h3 className="text-[18px] font-bold mb-2">{api.title}</h3>
                  <p className="text-sm text-muted-foreground">{api.desc}</p>
                </div>
              ))}
            </div>
            <div className="p-6 rounded-lg glass-card shadow-elevated">
              <pre className="text-sm text-muted-foreground overflow-x-auto">
                <code>{`// Example: Fetch VNX price
const response = await fetch('https://api.vyronexvnx.com/v1/market/VNX-USDT');
const data = await response.json();
console.log(data.price); // 0.000542`}</code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile App Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_40%,hsl(45_93%_58%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold mb-3">
                  Trade <span className="text-gradient">Anywhere</span>
                </h2>
                <p className="text-muted-foreground text-sm mb-6">
                  Access your portfolio, execute trades, and monitor markets from any device with our mobile-optimized platform.
                </p>
                <div className="space-y-4 mb-8">
                  {[
                    "Real-time price alerts and notifications",
                    "Biometric authentication for secure access",
                    "One-tap trading with customizable shortcuts",
                    "Offline portfolio tracking and analytics",
                  ].map((feature, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-primary shrink-0" />
                      <p className="text-sm text-muted-foreground">{feature}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 flex-wrap">
                  <a href="#" className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity">
                    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.55 4.3-3.74 4.25z"/></svg>
                    <div className="text-left">
                      <div className="text-[10px] leading-none opacity-80">Download on the</div>
                      <div className="text-base font-semibold leading-tight">App Store</div>
                    </div>
                  </a>
                  <a href="#" className="inline-flex items-center gap-3 px-5 py-3 rounded-xl bg-foreground text-background hover:opacity-90 transition-opacity">
                    <svg viewBox="0 0 24 24" className="h-7 w-7 fill-current"><path d="M3.18 23.49c-.41-.2-.68-.6-.68-1.04V1.55c0-.44.27-.84.68-1.04l11.3 11.49L3.18 23.49zm1.4-22.2L15.58 12 4.58 22.71V1.29zm.72-.3L17.16 10.6l-2.83 2.89L5.3.99zM17.89 11.27l2.6 1.5c.65.37.65 1.1 0 1.47l-2.6 1.5-3.14-2.23 3.14-2.24zM5.3 23.01l12.86-7.43-2.58-2.58L5.3 23.01z"/></svg>
                    <div className="text-left">
                      <div className="text-[10px] leading-none opacity-80">GET IT ON</div>
                      <div className="text-base font-semibold leading-tight">Google Play</div>
                    </div>
                  </a>
                </div>
              </div>
              <div className="relative">
                {/* Phone mockup */}
                <div className="mx-auto w-[260px] md:w-[300px] relative">
                  <div className="rounded-[2.5rem] border-[6px] border-foreground/20 bg-card shadow-elevated overflow-hidden aspect-[9/19]">
                    <div className="h-full w-full p-4 flex flex-col">
                      {/* Status bar */}
                      <div className="flex justify-between items-center mb-3 px-1">
                        <span className="text-[10px] font-semibold">9:41</span>
                        <div className="flex gap-1">
                          <div className="w-3 h-2 rounded-sm bg-foreground/40" />
                          <div className="w-3 h-2 rounded-sm bg-foreground/40" />
                          <div className="w-5 h-2 rounded-sm bg-primary" />
                        </div>
                      </div>
                      {/* App header */}
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-xs">V</span>
                        </div>
                        <span className="text-xs font-bold">VyronexVNX</span>
                      </div>
                      {/* Portfolio card */}
                      <div className="p-3 rounded-xl gradient-primary mb-3">
                        <p className="text-[10px] text-primary-foreground/80">Total Balance</p>
                        <p className="text-lg font-bold text-primary-foreground">$24,856.40</p>
                        <p className="text-[10px] text-primary-foreground/80 mt-0.5">+5.23% today</p>
                      </div>
                      {/* Quick actions */}
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {["Send", "Swap", "Stake", "Buy"].map(a => (
                          <div key={a} className="text-center">
                            <div className="h-8 w-8 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-1">
                              <div className="h-3 w-3 rounded-full bg-primary/50" />
                            </div>
                            <p className="text-[8px] text-muted-foreground">{a}</p>
                          </div>
                        ))}
                      </div>
                      {/* Coin list */}
                      <div className="space-y-2 flex-1">
                        {[
                          { sym: "BTC", val: "$68,240", pct: "+2.1%" },
                          { sym: "ETH", val: "$3,520", pct: "+1.8%" },
                          { sym: "VNX", val: "$0.00054", pct: "+5.2%" },
                        ].map(c => (
                          <div key={c.sym} className="flex justify-between items-center p-2 rounded-lg bg-background/50">
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded-full gradient-primary flex items-center justify-center">
                                <span className="text-[8px] font-bold text-primary-foreground">{c.sym[0]}</span>
                              </div>
                              <span className="text-[10px] font-semibold">{c.sym}</span>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] font-semibold">{c.val}</p>
                              <p className="text-[8px] text-green-500">{c.pct}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute -inset-4 bg-[radial-gradient(circle_at_50%_50%,hsl(1_99%_48%/0.2),transparent_70%)] -z-10 blur-xl" />
                </div>
                {/* Stats under phone */}
                <div className="grid grid-cols-3 gap-4 mt-6 text-center">
                  <div>
                    <div className="text-xl font-bold animate-count-up">100K+</div>
                    <p className="text-xs text-muted-foreground">Downloads</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold animate-count-up">4.8★</div>
                    <p className="text-xs text-muted-foreground">Rating</p>
                  </div>
                  <div>
                    <div className="text-xl font-bold animate-count-up">&lt;50ms</div>
                    <p className="text-xs text-muted-foreground">Latency</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Referral Program Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_80%,hsl(25_95%_53%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                <span className="text-gradient">Referral</span> Program
              </h2>
              <p className="text-muted-foreground text-sm">Earn rewards by inviting friends to VyronexVNX</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { tier: "Bronze", referrals: "1-10", reward: "10% Commission", bonus: "500 VNX" },
                { tier: "Silver", referrals: "11-50", reward: "15% Commission", bonus: "2,500 VNX" },
                { tier: "Gold", referrals: "51+", reward: "20% Commission", bonus: "10,000 VNX" },
              ].map((tier, i) => (
                <div key={i} className="p-6 rounded-lg glass-card hover-lift text-center">
                  <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 shadow-glow">
                    <span className="text-primary-foreground font-bold text-xs">{tier.tier.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <h3 className="text-[18px] font-bold mb-1">{tier.tier}</h3>
                  <p className="text-xs text-muted-foreground mb-3">{tier.referrals} referrals</p>
                  <div className="text-xl font-bold text-gradient mb-1">{tier.reward}</div>
                  <p className="text-sm text-muted-foreground">+ {tier.bonus} bonus</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link to="/auth">
                <Button size="lg" className="shadow-glow hover-glow">Start Referring</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Center Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_50%,hsl(1_99%_48%/0.06),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Learning <span className="text-gradient">Center</span>
              </h2>
              <p className="text-muted-foreground text-sm">Level up your trading knowledge with expert resources</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Beginner Guides", count: "24 Articles", desc: "Start your crypto journey with step-by-step tutorials" },
                { title: "Trading Strategies", count: "18 Lessons", desc: "Learn proven strategies from professional traders" },
                { title: "DeFi Deep Dives", count: "12 Guides", desc: "Understand yield farming, liquidity pools, and more" },
                { title: "Security Best Practices", count: "8 Resources", desc: "Protect your assets with essential security tips" },
              ].map((resource, i) => (
                <div key={i} className="p-6 rounded-lg glass-card hover-lift">
                  <h3 className="text-[18px] font-bold mb-1">{resource.title}</h3>
                  <p className="text-xs text-primary font-semibold mb-3">{resource.count}</p>
                  <p className="text-sm text-muted-foreground">{resource.desc}</p>
                  <Link to="/blog" className="text-sm text-primary font-semibold mt-4 inline-block hover:underline">
                    Explore
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Launchpad Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_30%,hsl(0_84%_50%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                VNX <span className="text-gradient">Launchpad</span>
              </h2>
              <p className="text-muted-foreground text-sm">Be early to the next big project — exclusive token launches for VNX holders</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "MetaForge", ticker: "MFG", raised: "$1.2M", target: "$2M", status: "Live", progress: 60 },
                { name: "ChainGuard", ticker: "CGD", raised: "$800K", target: "$1.5M", status: "Upcoming", progress: 0 },
                { name: "NeuraNet", ticker: "NRT", raised: "$3M", target: "$3M", status: "Completed", progress: 100 },
              ].map((project, i) => (
                <div key={i} className="p-6 rounded-lg glass-card hover-lift">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-[18px] font-bold">{project.name}</h3>
                      <span className="text-xs text-muted-foreground">${project.ticker}</span>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${project.status === 'Live' ? 'bg-primary/10 text-primary' : project.status === 'Completed' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{project.raised}</span>
                      <span>{project.target}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full" disabled={project.status === 'Completed'}>
                    {project.status === 'Completed' ? 'Ended' : project.status === 'Live' ? 'Participate' : 'Notify Me'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Global Reach Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(0_84%_50%/0.06),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                <span className="text-gradient">Global</span> Reach
              </h2>
              <p className="text-muted-foreground text-sm">Serving traders in 120+ countries with 24/7 uptime</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[
                { region: "North America", users: "12K+", volume: "$450M" },
                { region: "Europe", users: "18K+", volume: "$620M" },
                { region: "Asia Pacific", users: "15K+", volume: "$780M" },
                { region: "Rest of World", users: "5K+", volume: "$150M" },
              ].map((r, i) => (
                <div key={i} className="p-6 rounded-lg glass-card hover-lift text-center">
                  <h3 className="font-bold mb-2">{r.region}</h3>
                  <div className="text-xl font-bold text-gradient">{r.users}</div>
                  <p className="text-xs text-muted-foreground">Vol: {r.volume}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
              {["English", "中文", "Español", "العربية", "Français", "日本語"].map((lang, i) => (
                <div key={i} className="p-3 rounded-lg glass-card text-center text-sm font-semibold">{lang}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Press & Media Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,hsl(0_84%_50%/0.06),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                In The <span className="text-gradient">Press</span>
              </h2>
              <p className="text-muted-foreground text-sm">What the media is saying about VyronexVNX</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { source: "CoinTelegraph", quote: "VyronexVNX is redefining multi-chain DeFi with its seamless user experience and robust security.", date: "Jan 2025" },
                { source: "CryptoSlate", quote: "The VNX token has shown impressive utility, making it a standout in the crowded DeFi landscape.", date: "Dec 2024" },
                { source: "The Block", quote: "With 50K+ active users and growing, VyronexVNX is one to watch in the multi-chain DEX space.", date: "Nov 2024" },
              ].map((article, i) => (
                <div key={i} className="p-6 rounded-lg glass-card hover-lift">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gradient">{article.source}</span>
                    <span className="text-xs text-muted-foreground">{article.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground italic">"{article.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_70%,hsl(0_84%_50%/0.06),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Earn <span className="text-gradient">Badges</span>
              </h2>
              <p className="text-muted-foreground text-sm">Complete milestones and unlock exclusive rewards</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { badge: "First Trade", xp: "100 XP" },
                { badge: "Diamond Hands", xp: "500 XP" },
                { badge: "Whale", xp: "1,000 XP" },
                { badge: "Staker", xp: "250 XP" },
                { badge: "Referral King", xp: "750 XP" },
                { badge: "OG Member", xp: "2,000 XP" },
              ].map((b, i) => (
                <div key={i} className="p-4 rounded-lg glass-card hover-lift text-center">
                  <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mx-auto mb-3 shadow-glow">
                    <span className="text-primary-foreground font-bold text-xs">{b.badge.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <p className="font-bold text-sm mb-1">{b.badge}</p>
                  <p className="text-xs text-primary font-semibold">{b.xp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(0_84%_50%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 md:p-12 rounded-lg glass-card shadow-elevated text-center">
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                Stay <span className="text-gradient">Updated</span>
              </h2>
              <p className="text-muted-foreground text-sm mb-6">
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
