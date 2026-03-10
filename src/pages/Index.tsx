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
  const scrollRef = useScrollRevealContainer();

  return (
    <div ref={scrollRef} className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-28 md:pt-32 md:pb-40">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute top-20 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[100px]" />
        <div className="section-container relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="section-badge animate-fade-in">
              Multi-Chain DeFi Platform
            </div>
            <h1 className="mb-6 animate-fade-in">
              Trade Smarter with{" "}
              <span className="text-gradient">Decentralized</span>{" "}
              Power
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed animate-fade-in">
              Your gateway to multi-chain DeFi. Trade, stake, and manage your crypto portfolio with enterprise-grade security.
            </p>
            <div className="flex flex-wrap gap-4 justify-center animate-slide-up">
              {user ? (
                <>
                  <Link to="/wallet">
                    <Button size="lg" className="rounded-2xl px-8 h-14 text-base gradient-primary shadow-glow hover:shadow-glow-lg transition-all">
                      Open Wallet
                    </Button>
                  </Link>
                  <Link to="/trade">
                    <Button size="lg" variant="outline" className="rounded-2xl px-8 h-14 text-base hover-lift">
                      Trade Now
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button size="lg" className="rounded-2xl px-8 h-14 text-base gradient-primary shadow-glow hover:shadow-glow-lg transition-all">
                      Get Started Free
                    </Button>
                  </Link>
                  <Link to="/markets">
                    <Button size="lg" variant="outline" className="rounded-2xl px-8 h-14 text-base hover-lift">
                      View Markets
                    </Button>
                  </Link>
                </>
              )}
            </div>
            {/* Trust bar */}
            <div className="mt-14 flex flex-wrap items-center justify-center gap-6 md:gap-10 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--vnx-green))]" />
                <span>50K+ Active Users</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--vnx-green))]" />
                <span>$2.5B+ Volume</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-[hsl(var(--vnx-green))]" />
                <span>6 Chains Supported</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* VNX Price Section */}
      <section className="py-20 relative">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Live Data</span>
              <h2>
                <span className="text-gradient">VNX Token</span> Performance
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Real-time token metrics and market performance</p>
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
                  <StatsCard label="Market Cap" value={`$${((vnxPrice?.marketCap || 5420000) / 1000000).toFixed(2)}M`} />
                </div>
                <div className="hover-lift">
                  <StatsCard label="Total Supply" value="10B VNX" />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="https://pancakeswap.finance/info/tokens/0xeb55a55c384095ced21587afbe7418b7c9ae40cb" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="rounded-xl">View on PancakeSwap</Button>
              </a>
              <a href="https://apespace.io/bsc/0xeb55a55c384095ced21587afbe7418b7c9ae40cb" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="rounded-xl">View on ApeSpace</Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 relative gradient-warm rounded-3xl mx-4 md:mx-8">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Why Us</span>
              <h2>
                Why Choose <span className="text-gradient">VyronexVNX</span>?
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Enterprise-grade features designed for modern traders</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Multi-Chain", desc: "Support for Ethereum, BNB, Tron, Bitcoin, Fantom, and Solana networks." },
                { title: "DeFi Ready", desc: "Stake, farm, and provide liquidity with VNX token priority." },
                { title: "Secure", desc: "Enterprise-grade encryption with biometric and hardware wallet support." },
                { title: "Real-Time", desc: "Live market data, instant transactions, and real-time price updates." },
              ].map((item, i) => (
                <div key={i} className="card-modern group">
                  <h3 className="text-lg font-bold mb-2 group-hover:text-gradient transition-all">{item.title}</h3>
                  <p className="text-muted-foreground text-sm">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Getting Started</span>
              <h2>
                How It <span className="text-gradient">Works</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Get started in just a few simple steps</p>
            </div>
            <div className="grid md:grid-cols-4 gap-6">
              {[
                { step: "01", title: "Create Account", desc: "Sign up with your email and verify your identity securely" },
                { step: "02", title: "Connect Wallet", desc: "Link your crypto wallet or use our built-in multi-chain wallet" },
                { step: "03", title: "Deposit Funds", desc: "Add crypto or fiat to start trading on multiple chains" },
                { step: "04", title: "Start Trading", desc: "Trade, stake, and earn rewards across the DeFi ecosystem" },
              ].map((item, i) => (
                <div key={i} className="card-modern text-center relative">
                  <div className="text-4xl font-bold text-primary/15 mb-3" style={{ fontFamily: "'Space Grotesk', system-ui" }}>{item.step}</div>
                  <h3 className="text-lg font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Live Market Prices Section */}
      <section className="py-20 relative">
        <div className="section-container">
          <div className="max-w-7xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Real-Time</span>
              <h2>
                <span className="text-gradient">Live Market</span> Prices
              </h2>
              <p className="text-muted-foreground mt-3">Real-time prices for top 50 cryptocurrencies</p>
            </div>
            <div className="rounded-2xl bg-card border border-border/40 shadow-elevated overflow-hidden">
              <LivePricesTable />
            </div>
          </div>
        </div>
      </section>

      {/* Trading Modes Section */}
      <section className="py-20 relative gradient-warm rounded-3xl mx-4 md:mx-8">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Trade</span>
              <h2>
                <span className="text-gradient">Trading</span> Modes
              </h2>
              <p className="text-muted-foreground mt-3">Choose the trading style that fits your strategy</p>
            </div>
            <TradingModes />
          </div>
        </div>
      </section>

      {/* Quick Swap Section */}
      <section className="py-24 relative">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Instant</span>
              <h2>
                <span className="text-gradient">Quick</span> Swap
              </h2>
              <p className="text-muted-foreground mt-3">Swap tokens instantly across multiple blockchains</p>
            </div>
            <div className="hover-lift max-w-lg mx-auto">
              <QuickSwap />
            </div>
          </div>
        </div>
      </section>

      {/* Community Stats Section */}
      <section className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
        <div className="section-container relative">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Community</span>
              <h2>
                Join Our <span className="text-gradient">Community</span>
              </h2>
              <p className="text-muted-foreground mt-3">Connect with traders worldwide</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { value: "50K+", label: "Active Users" },
                { value: "$2.5B+", label: "Trading Volume" },
                { value: "6+", label: "Supported Chains" },
              ].map((stat, i) => (
                <div key={i} className="card-modern text-center">
                  <div className="text-4xl font-bold text-gradient mb-2">{stat.value}</div>
                  <p className="text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 relative gradient-warm rounded-3xl mx-4 md:mx-8">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Testimonials</span>
              <h2>
                What <span className="text-gradient">Traders</span> Say
              </h2>
              <p className="text-muted-foreground mt-3">Trusted by thousands of traders worldwide</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "Alex Chen", role: "Day Trader", text: "Best multi-chain platform I've used. Lightning fast trades and great UI!", rating: 5 },
                { name: "Sarah Johnson", role: "Crypto Investor", text: "The staking rewards are incredible. I've earned 15% more with VNX staking.", rating: 5 },
                { name: "Michael Rodriguez", role: "DeFi Enthusiast", text: "Finally a platform that supports all my favorite chains in one place!", rating: 5 },
              ].map((t, i) => (
                <div key={i} className="card-modern">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.rating }).map((_, j) => (
                      <span key={j} className="text-accent font-bold">*</span>
                    ))}
                  </div>
                  <p className="text-foreground mb-6 leading-relaxed">"{t.text}"</p>
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full gradient-primary flex items-center justify-center">
                      <span className="text-primary-foreground font-bold text-sm">{t.name[0]}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 relative">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <div className="section-header">
              <span className="section-badge">FAQ</span>
              <h2>
                Frequently Asked <span className="text-gradient">Questions</span>
              </h2>
              <p className="text-muted-foreground mt-3">Common questions about VyronexVNX</p>
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
                <div key={i} className="card-modern">
                  <h3 className="font-bold mb-2 text-base">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Section */}
      <section className="py-20 relative">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Vision</span>
              <h2><span className="text-gradient">Roadmap</span></h2>
              <p className="text-muted-foreground mt-3">Our journey to revolutionize DeFi</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { quarter: "Q4 2024", title: "Platform Launch", items: ["Multi-chain wallet", "VNX token launch", "Basic trading"], active: true },
                { quarter: "Q1 2025", title: "DeFi Expansion", items: ["Staking pools", "Liquidity farming", "Governance"], active: true },
                { quarter: "Q2 2025", title: "Advanced Trading", items: ["Margin trading", "Futures contracts", "Options"], active: false },
                { quarter: "Q3 2025", title: "Enterprise", items: ["API access", "White-label", "Institutional"], active: false },
              ].map((phase, i) => (
                <div key={i} className={`card-modern relative ${phase.active ? "border-primary/30" : ""}`}>
                  {phase.active && <div className="absolute top-4 right-4 h-2 w-2 rounded-full bg-[hsl(var(--vnx-green))]" />}
                  <div className="text-xs font-semibold text-primary mb-1">{phase.quarter}</div>
                  <h3 className="text-lg font-bold mb-4">{phase.title}</h3>
                  <ul className="space-y-2.5">
                    {phase.items.map((item, j) => (
                      <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
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
      <section className="py-20 relative gradient-warm rounded-3xl mx-4 md:mx-8">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Security</span>
              <h2><span className="text-gradient">Bank-Grade</span> Security</h2>
              <p className="text-muted-foreground mt-3">Your assets are protected with industry-leading security</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Cold Storage", desc: "95% of funds stored offline" },
                { title: "2FA Auth", desc: "Multi-factor authentication" },
                { title: "Encrypted", desc: "AES-256 encryption" },
                { title: "Insurance", desc: "$100M protection fund" },
              ].map((item, i) => (
                <div key={i} className="card-modern text-center">
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="py-20 relative">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Ecosystem</span>
              <h2>Trusted <span className="text-gradient">Partners</span></h2>
              <p className="text-muted-foreground mt-3">Integrated with leading blockchain platforms</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {["Ethereum", "BNB Chain", "Tron", "Bitcoin", "Fantom", "Solana"].map((partner, i) => (
                <div key={i} className="card-modern flex items-center justify-center py-6">
                  <span className="font-bold text-gradient text-sm">{partner}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Token Economics */}
      <section className="py-24 relative">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Tokenomics</span>
              <h2><span className="text-gradient">Token</span> Economics</h2>
              <p className="text-muted-foreground mt-3">Sustainable tokenomics for long-term growth</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-modern">
                <h3 className="text-lg font-bold mb-6">Distribution</h3>
                <div className="space-y-5">
                  {[
                    { label: "Public Sale", percent: 40, amount: "4B VNX" },
                    { label: "Staking Rewards", percent: 25, amount: "2.5B VNX" },
                    { label: "Team & Advisors", percent: 15, amount: "1.5B VNX" },
                    { label: "Liquidity", percent: 10, amount: "1B VNX" },
                    { label: "Marketing", percent: 10, amount: "1B VNX" },
                  ].map((item, i) => (
                    <div key={i}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className="text-sm font-bold">{item.percent}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${item.percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-modern">
                <h3 className="text-lg font-bold mb-6">Utility</h3>
                <div className="space-y-5">
                  {[
                    { title: "Trading Fee Discounts", desc: "Up to 50% off trading fees" },
                    { title: "Staking Rewards", desc: "Earn 12.5% APR on staked VNX" },
                    { title: "Governance Rights", desc: "Vote on platform decisions" },
                    { title: "Premium Features", desc: "Access to advanced tools" },
                    { title: "Launchpad Access", desc: "Early access to new tokens" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0 mt-2" />
                      <div>
                        <h4 className="font-semibold text-sm mb-0.5">{item.title}</h4>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Supported Assets Section */}
      <section className="py-20 relative gradient-warm rounded-3xl mx-4 md:mx-8">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Assets</span>
              <h2>Supported <span className="text-gradient">Assets</span></h2>
              <p className="text-muted-foreground mt-3">Trade hundreds of tokens across multiple chains</p>
            </div>
            <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
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
                <div key={i} className="card-modern text-center py-5">
                  <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center mx-auto mb-2">
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
      <section className="py-24 relative">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Earn</span>
              <h2>Earn <span className="text-gradient">Passive Income</span></h2>
              <p className="text-muted-foreground mt-3">Multiple ways to grow your portfolio while you sleep</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Staking", apr: "12.5%", desc: "Lock VNX tokens and earn daily rewards with flexible or fixed terms", badge: "Popular", color: "bg-primary/10 text-primary" },
                { title: "Liquidity Mining", apr: "18.2%", desc: "Provide liquidity to trading pairs and earn a share of trading fees", badge: "High Yield", color: "bg-accent/10 text-accent" },
                { title: "Yield Farming", apr: "24.8%", desc: "Optimize returns across DeFi protocols with automated strategies", badge: "Advanced", color: "bg-[hsl(var(--vnx-gold))]/10 text-[hsl(var(--vnx-gold))]" },
              ].map((earn, i) => (
                <div key={i} className="card-modern">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold">{earn.title}</h3>
                    <span className={`text-xs px-3 py-1 rounded-full font-semibold ${earn.color}`}>{earn.badge}</span>
                  </div>
                  <div className="text-4xl font-bold text-gradient mb-2">Up to {earn.apr}</div>
                  <p className="text-sm text-muted-foreground mb-6">{earn.desc}</p>
                  <Link to="/stake">
                    <Button variant="outline" size="sm" className="w-full rounded-xl">Start Earning</Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Platform Comparison Section */}
      <section className="py-20 relative">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Compare</span>
              <h2>Why <span className="text-gradient">VyronexVNX</span> Stands Out</h2>
              <p className="text-muted-foreground mt-3">See how we compare to other platforms</p>
            </div>
            <div className="rounded-2xl bg-card border border-border/40 shadow-elevated overflow-hidden">
              <div className="grid grid-cols-4 gap-0 text-sm">
                <div className="p-5 font-bold border-b border-border/40">Feature</div>
                <div className="p-5 font-bold border-b border-border/40 text-center text-gradient">VyronexVNX</div>
                <div className="p-5 font-bold border-b border-border/40 text-center text-muted-foreground">CEX</div>
                <div className="p-5 font-bold border-b border-border/40 text-center text-muted-foreground">Other DEX</div>
                {[
                  { feature: "Multi-Chain", vnx: "Yes", cex: "Limited", other: "No" },
                  { feature: "Self-Custody", vnx: "Yes", cex: "No", other: "Yes" },
                  { feature: "Low Fees", vnx: "0.1%", cex: "0.2-0.5%", other: "0.3%+" },
                  { feature: "Staking", vnx: "12.5%", cex: "3-5%", other: "Variable" },
                  { feature: "Fiat On-Ramp", vnx: "Yes", cex: "Yes", other: "No" },
                  { feature: "No KYC", vnx: "Optional", cex: "Required", other: "No" },
                ].map((row, i) => (
                  <div key={i} className="contents">
                    <div className="p-4 border-b border-border/20 text-muted-foreground">{row.feature}</div>
                    <div className="p-4 border-b border-border/20 text-center font-semibold text-primary">{row.vnx}</div>
                    <div className="p-4 border-b border-border/20 text-center text-muted-foreground">{row.cex}</div>
                    <div className="p-4 border-b border-border/20 text-center text-muted-foreground">{row.other}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Governance Section */}
      <section className="py-20 relative gradient-warm rounded-3xl mx-4 md:mx-8">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">DAO</span>
              <h2>Community <span className="text-gradient">Governance</span></h2>
              <p className="text-muted-foreground mt-3">Shape the future of VyronexVNX with your vote</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="card-modern">
                <h3 className="text-lg font-bold mb-5">How Governance Works</h3>
                <div className="space-y-5">
                  {[
                    { step: "01", title: "Hold VNX", desc: "Stake VNX tokens to gain voting power" },
                    { step: "02", title: "Propose", desc: "Submit proposals for platform improvements" },
                    { step: "03", title: "Vote", desc: "Cast your vote on active proposals" },
                    { step: "04", title: "Execute", desc: "Approved proposals are implemented" },
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 items-start">
                      <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center shrink-0">
                        <span className="text-primary-foreground font-bold text-xs">{item.step}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{item.title}</p>
                        <p className="text-sm text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="card-modern">
                <h3 className="text-lg font-bold mb-5">Active Proposals</h3>
                <div className="space-y-3">
                  {[
                    { title: "Reduce Trading Fees to 0.08%", votes: "12,450", status: "Active" },
                    { title: "Add Avalanche Chain Support", votes: "8,320", status: "Active" },
                    { title: "Increase Staking APR to 15%", votes: "15,780", status: "Passed" },
                    { title: "Launch NFT Marketplace", votes: "6,100", status: "Voting" },
                  ].map((proposal, i) => (
                    <div key={i} className="p-4 rounded-xl bg-background/50 border border-border/30">
                      <div className="flex justify-between items-start">
                        <p className="font-semibold text-sm">{proposal.title}</p>
                        <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${proposal.status === 'Passed' ? 'bg-[hsl(var(--vnx-green))]/10 text-[hsl(var(--vnx-green))]' : 'bg-primary/10 text-primary'}`}>
                          {proposal.status}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">{proposal.votes} votes</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Developer API Section */}
      <section className="py-24 relative">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Developers</span>
              <h2>Built for <span className="text-gradient">Developers</span></h2>
              <p className="text-muted-foreground mt-3">Integrate VyronexVNX into your applications</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { title: "REST API", desc: "Full-featured REST endpoints for trading, market data, and account management" },
                { title: "WebSocket", desc: "Real-time market data streams with sub-millisecond latency" },
                { title: "SDK Libraries", desc: "Official SDKs for JavaScript, Python, Go, and Rust" },
              ].map((api, i) => (
                <div key={i} className="card-modern">
                  <h3 className="text-lg font-bold mb-2">{api.title}</h3>
                  <p className="text-sm text-muted-foreground">{api.desc}</p>
                </div>
              ))}
            </div>
            <div className="rounded-2xl bg-card border border-border/40 shadow-card p-6 overflow-x-auto">
              <pre className="text-sm text-muted-foreground">
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
      <section className="py-20 relative gradient-warm rounded-3xl mx-4 md:mx-8">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-16 items-center">
              <div>
                <span className="section-badge">Mobile</span>
                <h2 className="mt-4 mb-4">
                  Trade <span className="text-gradient">Anywhere</span>
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
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
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                        <span className="text-primary text-xs">✓</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{feature}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 flex-wrap">
                  <a href="#" className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-foreground text-background hover:opacity-90 transition-opacity">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.55 4.3-3.74 4.25z"/></svg>
                    <div className="text-left">
                      <div className="text-[10px] leading-none opacity-70">Download on the</div>
                      <div className="text-sm font-semibold leading-tight">App Store</div>
                    </div>
                  </a>
                  <a href="#" className="inline-flex items-center gap-3 px-5 py-3 rounded-2xl bg-foreground text-background hover:opacity-90 transition-opacity">
                    <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current"><path d="M3.18 23.49c-.41-.2-.68-.6-.68-1.04V1.55c0-.44.27-.84.68-1.04l11.3 11.49L3.18 23.49zm1.4-22.2L15.58 12 4.58 22.71V1.29zm.72-.3L17.16 10.6l-2.83 2.89L5.3.99zM17.89 11.27l2.6 1.5c.65.37.65 1.1 0 1.47l-2.6 1.5-3.14-2.23 3.14-2.24zM5.3 23.01l12.86-7.43-2.58-2.58L5.3 23.01z"/></svg>
                    <div className="text-left">
                      <div className="text-[10px] leading-none opacity-70">GET IT ON</div>
                      <div className="text-sm font-semibold leading-tight">Google Play</div>
                    </div>
                  </a>
                </div>
              </div>
              <div className="relative">
                <div className="mx-auto w-[260px] md:w-[280px] relative animate-float">
                  <div className="rounded-[2.5rem] border-[5px] border-border/30 bg-card shadow-elevated overflow-hidden aspect-[9/19]">
                    <div className="h-full w-full p-4 flex flex-col">
                      <div className="flex justify-between items-center mb-3 px-1">
                        <span className="text-[10px] font-semibold">9:41</span>
                        <div className="flex gap-1">
                          <div className="w-3 h-2 rounded-sm bg-foreground/40" />
                          <div className="w-3 h-2 rounded-sm bg-foreground/40" />
                          <div className="w-5 h-2 rounded-sm bg-primary" />
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="h-7 w-7 rounded-lg gradient-primary flex items-center justify-center">
                          <span className="text-primary-foreground font-bold text-xs">V</span>
                        </div>
                        <span className="text-xs font-bold">VyronexVNX</span>
                      </div>
                      <div className="p-3 rounded-xl gradient-primary mb-3">
                        <p className="text-[10px] text-primary-foreground/80">Total Balance</p>
                        <p className="text-lg font-bold text-primary-foreground">$24,856.40</p>
                        <p className="text-[10px] text-primary-foreground/80 mt-0.5">+5.23% today</p>
                      </div>
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {["Send", "Swap", "Stake", "Buy"].map(a => (
                          <div key={a} className="text-center">
                            <div className="h-8 w-8 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-1">
                              <div className="h-3 w-3 rounded-full bg-primary/40" />
                            </div>
                            <p className="text-[8px] text-muted-foreground">{a}</p>
                          </div>
                        ))}
                      </div>
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
                              <p className="text-[8px] text-[hsl(var(--vnx-green))]">{c.pct}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="absolute -inset-6 bg-[radial-gradient(circle_at_50%_50%,hsl(0_84%_55%/0.15),transparent_60%)] -z-10 blur-xl" />
                </div>
                <div className="grid grid-cols-3 gap-4 mt-8 text-center">
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
      <section className="py-24 relative">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Rewards</span>
              <h2><span className="text-gradient">Referral</span> Program</h2>
              <p className="text-muted-foreground mt-3">Earn rewards by inviting friends to VyronexVNX</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              {[
                { tier: "Bronze", referrals: "1-10", reward: "10% Commission", bonus: "500 VNX", icon: "🥉" },
                { tier: "Silver", referrals: "11-50", reward: "15% Commission", bonus: "2,500 VNX", icon: "🥈" },
                { tier: "Gold", referrals: "51+", reward: "20% Commission", bonus: "10,000 VNX", icon: "🥇" },
              ].map((tier, i) => (
                <div key={i} className="card-modern text-center">
                  <div className="text-4xl mb-3">{tier.icon}</div>
                  <h3 className="text-lg font-bold mb-1">{tier.tier}</h3>
                  <p className="text-xs text-muted-foreground mb-4">{tier.referrals} referrals</p>
                  <div className="text-2xl font-bold text-gradient mb-1">{tier.reward}</div>
                  <p className="text-sm text-muted-foreground">+ {tier.bonus} bonus</p>
                </div>
              ))}
            </div>
            <div className="text-center">
              <Link to="/auth">
                <Button size="lg" className="rounded-2xl px-8 gradient-primary shadow-glow hover:shadow-glow-lg transition-all">Start Referring</Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Center Section */}
      <section className="py-20 relative">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Learn</span>
              <h2>Learning <span className="text-gradient">Center</span></h2>
              <p className="text-muted-foreground mt-3">Level up your trading knowledge with expert resources</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: "Beginner Guides", count: "24 Articles", desc: "Start your crypto journey with step-by-step tutorials", icon: "📖" },
                { title: "Trading Strategies", count: "18 Lessons", desc: "Learn proven strategies from professional traders", icon: "📊" },
                { title: "DeFi Deep Dives", count: "12 Guides", desc: "Understand yield farming, liquidity pools, and more", icon: "🔬" },
                { title: "Security Tips", count: "8 Resources", desc: "Protect your assets with essential security tips", icon: "🔐" },
              ].map((resource, i) => (
                <div key={i} className="card-modern">
                  <div className="text-2xl mb-3">{resource.icon}</div>
                  <h3 className="text-base font-bold mb-1">{resource.title}</h3>
                  <p className="text-xs text-primary font-semibold mb-3">{resource.count}</p>
                  <p className="text-sm text-muted-foreground mb-4">{resource.desc}</p>
                  <Link to="/blog" className="text-sm text-primary font-semibold hover:underline">
                    Explore →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Launchpad Section */}
      <section className="py-20 relative gradient-warm rounded-3xl mx-4 md:mx-8">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">IDO</span>
              <h2>VNX <span className="text-gradient">Launchpad</span></h2>
              <p className="text-muted-foreground mt-3">Be early to the next big project — exclusive token launches for VNX holders</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { name: "MetaForge", ticker: "MFG", raised: "$1.2M", target: "$2M", status: "Live", progress: 60 },
                { name: "ChainGuard", ticker: "CGD", raised: "$800K", target: "$1.5M", status: "Upcoming", progress: 0 },
                { name: "NeuraNet", ticker: "NRT", raised: "$3M", target: "$3M", status: "Completed", progress: 100 },
              ].map((project, i) => (
                <div key={i} className="card-modern">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold">{project.name}</h3>
                      <span className="text-xs text-muted-foreground">${project.ticker}</span>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${project.status === 'Live' ? 'bg-primary/10 text-primary' : project.status === 'Completed' ? 'bg-[hsl(var(--vnx-green))]/10 text-[hsl(var(--vnx-green))]' : 'bg-muted text-muted-foreground'}`}>
                      {project.status}
                    </span>
                  </div>
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                      <span>{project.raised}</span>
                      <span>{project.target}</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${project.progress}%` }} />
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full rounded-xl" disabled={project.status === 'Completed'}>
                    {project.status === 'Completed' ? 'Ended' : project.status === 'Live' ? 'Participate' : 'Notify Me'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Global Reach Section */}
      <section className="py-24 relative">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Worldwide</span>
              <h2><span className="text-gradient">Global</span> Reach</h2>
              <p className="text-muted-foreground mt-3">Serving traders in 120+ countries with 24/7 uptime</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
              {[
                { region: "North America", users: "12K+", volume: "$450M" },
                { region: "Europe", users: "18K+", volume: "$620M" },
                { region: "Asia Pacific", users: "15K+", volume: "$780M" },
                { region: "Rest of World", users: "5K+", volume: "$150M" },
              ].map((r, i) => (
                <div key={i} className="card-modern text-center">
                  <h3 className="font-bold mb-2 text-sm">{r.region}</h3>
                  <div className="text-2xl font-bold text-gradient">{r.users}</div>
                  <p className="text-xs text-muted-foreground mt-1">Vol: {r.volume}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {["English", "中文", "Español", "العربية", "Français", "日本語"].map((lang, i) => (
                <div key={i} className="p-3 rounded-xl bg-card border border-border/30 text-center text-sm font-medium text-muted-foreground">{lang}</div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Press & Media Section */}
      <section className="py-20 relative">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Media</span>
              <h2>In The <span className="text-gradient">Press</span></h2>
              <p className="text-muted-foreground mt-3">What the media is saying about VyronexVNX</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { source: "CoinTelegraph", quote: "VyronexVNX is redefining multi-chain DeFi with its seamless user experience and robust security.", date: "Jan 2025" },
                { source: "CryptoSlate", quote: "The VNX token has shown impressive utility, making it a standout in the crowded DeFi landscape.", date: "Dec 2024" },
                { source: "The Block", quote: "With 50K+ active users and growing, VyronexVNX is one to watch in the multi-chain DEX space.", date: "Nov 2024" },
              ].map((article, i) => (
                <div key={i} className="card-modern">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-gradient">{article.source}</span>
                    <span className="text-xs text-muted-foreground">{article.date}</span>
                  </div>
                  <p className="text-sm text-muted-foreground italic leading-relaxed">"{article.quote}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section className="py-20 relative gradient-warm rounded-3xl mx-4 md:mx-8">
        <div className="section-container">
          <div className="max-w-6xl mx-auto">
            <div className="section-header">
              <span className="section-badge">Gamification</span>
              <h2>Earn <span className="text-gradient">Badges</span></h2>
              <p className="text-muted-foreground mt-3">Complete milestones and unlock exclusive rewards</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { badge: "First Trade", xp: "100 XP", icon: "🎯" },
                { badge: "Diamond Hands", xp: "500 XP", icon: "💎" },
                { badge: "Whale", xp: "1,000 XP", icon: "🐋" },
                { badge: "Staker", xp: "250 XP", icon: "🏆" },
                { badge: "Referral King", xp: "750 XP", icon: "👑" },
                { badge: "OG Member", xp: "2,000 XP", icon: "⭐" },
              ].map((b, i) => (
                <div key={i} className="card-modern text-center py-6">
                  <div className="text-3xl mb-3">{b.icon}</div>
                  <p className="font-bold text-sm mb-1">{b.badge}</p>
                  <p className="text-xs text-primary font-semibold">{b.xp}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-24 relative">
        <div className="section-container">
          <div className="max-w-3xl mx-auto">
            <div className="p-10 md:p-14 rounded-3xl bg-card border border-border/40 shadow-elevated text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
              <div className="relative">
                <span className="section-badge">Newsletter</span>
                <h2 className="mt-4 mb-3">
                  Stay <span className="text-gradient">Updated</span>
                </h2>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Get the latest news, updates, and exclusive offers delivered to your inbox
                </p>
                <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-5 py-3.5 rounded-xl bg-background border border-border/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                  />
                  <Button size="lg" className="rounded-xl gradient-primary shadow-glow hover:shadow-glow-lg transition-all whitespace-nowrap">
                    Subscribe
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-5">
                  Join 50,000+ traders receiving weekly insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
