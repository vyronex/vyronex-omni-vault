import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import Navigation from "@/components/Navigation";
import LivePricesTable from "@/components/LivePricesTable";
import TradingModes from "@/components/TradingModes";
import QuickSwap from "@/components/QuickSwap";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { useVNXPrice } from "@/hooks/useVNXPrice";
import { useAuth } from "@/hooks/useAuth";
import { useScrollRevealContainer } from "@/hooks/useScrollReveal";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const staggerContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const Index = () => {
  const { data: vnxPrice } = useVNXPrice();
  const { user } = useAuth();
  const scrollRef = useScrollRevealContainer();

  return (
    <PageTransition>
      <div ref={scrollRef} className="min-h-screen bg-background">
        <Navigation />

        {/* ═══ HERO — Cinematic centered layout ═══ */}
        <section className="relative overflow-hidden min-h-[95vh] flex flex-col items-center justify-center">
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] md:w-[700px] md:h-[700px] rounded-full"
              style={{ background: 'radial-gradient(circle, hsl(0 84% 55% / 0.12) 0%, hsl(25 95% 55% / 0.06) 40%, transparent 70%)' }}
              animate={{ scale: [1, 1.15, 1], rotate: [0, 180, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
            <div className="absolute top-[20%] left-[15%] w-1 h-1 rounded-full bg-primary/40 animate-pulse" />
            <div className="absolute top-[30%] right-[20%] w-1.5 h-1.5 rounded-full bg-accent/30 animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-[25%] left-[25%] w-1 h-1 rounded-full bg-primary/30 animate-pulse" style={{ animationDelay: '2s' }} />
            <div className="absolute bottom-[35%] right-[15%] w-0.5 h-0.5 rounded-full bg-accent/40 animate-pulse" style={{ animationDelay: '0.5s' }} />
          </div>

          <div className="relative text-center max-w-4xl mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div variants={fadeUp} custom={0}>
                <span className="inline-block px-5 py-2 rounded-full text-[11px] font-bold tracking-[0.2em] uppercase border border-primary/20 bg-primary/5 text-primary">
                  Centralized Crypto Exchange
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                custom={1}
                className="text-5xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight leading-[1.05]"
                style={{ fontFamily: "'Space Grotesk', system-ui" }}
              >
                Trade without
                <br />
                <span className="text-gradient">boundaries.</span>
              </motion.h1>

              <motion.p variants={fadeUp} custom={2} className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
                One platform. Six blockchains. Institutional-grade trading infrastructure with insured custody.
              </motion.p>

              <motion.div variants={fadeUp} custom={3} className="flex flex-wrap justify-center gap-4 pt-2">
                {user ? (
                  <>
                    <Link to="/wallet">
                      <Button size="lg" className="rounded-full px-10 h-14 text-base gradient-primary shadow-glow hover:shadow-glow-lg transition-all active-press">
                        Open Wallet
                      </Button>
                    </Link>
                    <Link to="/trade">
                      <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-base hover-border-glow active-press">
                        Trade Now
                      </Button>
                    </Link>
                  </>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button size="lg" className="rounded-full px-10 h-14 text-base gradient-primary shadow-glow hover:shadow-glow-lg transition-all active-press">
                        Start Trading
                      </Button>
                    </Link>
                    <Link to="/markets">
                      <Button size="lg" variant="outline" className="rounded-full px-10 h-14 text-base hover-border-glow active-press">
                        Explore Markets
                      </Button>
                    </Link>
                  </>
                )}
              </motion.div>

              {/* Stats ribbon */}
              <motion.div variants={fadeUp} custom={4} className="pt-12 flex flex-wrap justify-center gap-8 md:gap-16">
                {[
                  { label: "Trading Volume", value: "$2.5B+" },
                  { label: "Active Users", value: "50K+" },
                  { label: "Blockchains", value: "6" },
                  { label: "Uptime", value: "99.9%" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center">
                    <p className="text-2xl md:text-3xl font-bold text-gradient" style={{ fontFamily: "'Space Grotesk'" }}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </motion.div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
        </section>

        {/* ═══ VNX LIVE PRICE TICKER ═══ */}
        <section className="py-4 border-b border-border/20 bg-card/30">
          <div className="section-container">
            <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-center gap-6 md:gap-12">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                  <span className="text-[10px] font-bold text-primary-foreground">VNX</span>
                </div>
                <div>
                  <span className="font-bold text-sm" style={{ fontFamily: "'Space Grotesk'" }}>VNX Token</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Price</p>
                <p className="font-bold font-mono text-sm">${vnxPrice?.price?.toFixed(6) || '0.000542'}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-muted-foreground">24h Change</p>
                <p className={`font-bold text-sm ${(vnxPrice?.change24h || 0) >= 0 ? 'text-[hsl(var(--vnx-green))]' : 'text-[hsl(var(--vnx-red))]'}`}>
                  {(vnxPrice?.change24h || 0) >= 0 ? '+' : ''}{vnxPrice?.change24h?.toFixed(2) || '0.00'}%
                </p>
              </div>
              <div className="text-center hidden sm:block">
                <p className="text-xs text-muted-foreground">24h Volume</p>
                <p className="font-bold text-sm font-mono">${vnxPrice?.volume24h ? (vnxPrice.volume24h / 1000).toFixed(1) + 'K' : '0'}</p>
              </div>
              <Link to="/vnx">
                <Button variant="outline" size="sm" className="rounded-full text-xs hover-border-glow">View Token</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ═══ MARQUEE — Scrolling chain logos ═══ */}
        <section className="py-6 border-b border-border/20 overflow-hidden">
          <div className="flex animate-[marquee_20s_linear_infinite] gap-12 whitespace-nowrap">
            {[...Array(2)].flatMap((_, dupeIdx) =>
              ["Ethereum", "BNB Chain", "Tron", "Bitcoin", "Fantom", "Solana", "Polygon", "Avalanche"].map((chain, i) => (
                <span key={`${dupeIdx}-${i}`} className="text-sm font-semibold text-muted-foreground/50 uppercase tracking-[0.15em]">
                  {chain}
                </span>
              ))
            )}
          </div>
        </section>

        {/* ═══ BENTO FEATURES — Asymmetric grid ═══ */}
        <section className="py-24 relative">
          <div className="section-container">
            <div className="max-w-7xl mx-auto">
              <div className="mb-16">
                <span className="section-badge">Platform</span>
                <h2 className="mt-4 text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>
                  Everything you need,<br />
                  <span className="text-gradient">nothing you don't.</span>
                </h2>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="md:row-span-2 p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/[0.02] border border-primary/20 flex flex-col justify-between min-h-[360px] hover-border-glow transition-all group">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Multi-Chain</p>
                    <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk'" }}>6 blockchains,<br />one exchange.</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Trade across Ethereum, BNB, Tron, Bitcoin, Fantom, and Solana — all from a single, unified account with insured custody.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-6">
                    {["ETH", "BNB", "TRX", "BTC", "FTM", "SOL"].map(c => (
                      <span key={c} className="px-3 py-1.5 rounded-full bg-card/80 border border-border/40 text-xs font-bold text-muted-foreground group-hover:border-primary/30 transition-all">{c}</span>
                    ))}
                  </div>
                </div>

                <div className="p-7 rounded-3xl bg-card border border-border/40 shadow-card hover-border-glow transition-all">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">Security</p>
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Space Grotesk'" }}>Institutional-grade custody</h3>
                  <p className="text-sm text-muted-foreground">AES-256 encryption, multi-sig cold storage for 95% of assets, and $100M insurance fund.</p>
                </div>

                <div className="p-7 rounded-3xl bg-card border border-border/40 shadow-card hover-border-glow transition-all">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--vnx-green))] mb-3">Speed</p>
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Space Grotesk'" }}>Sub-millisecond matching</h3>
                  <p className="text-sm text-muted-foreground">Our matching engine processes 100K+ orders per second with less than 1ms latency.</p>
                </div>

                <div className="md:col-span-2 p-7 rounded-3xl bg-card border border-border/40 shadow-card hover-border-glow transition-all">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--vnx-gold))] mb-3">Trading Suite</p>
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Space Grotesk'" }}>Spot, Futures, Margin — all in one platform</h3>
                  <p className="text-sm text-muted-foreground mb-4">Advanced order types, up to 100x leverage, and professional charting tools for every trading style.</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Spot Trading", fee: "0.1%" },
                      { label: "Futures", leverage: "100x" },
                      { label: "Earn Programs", apr: "24.8%" },
                    ].map((e, i) => (
                      <div key={i} className="p-3 rounded-xl bg-background/50 border border-border/30 text-center">
                        <p className="text-xs text-muted-foreground">{e.label}</p>
                        <p className="text-lg font-bold text-gradient" style={{ fontFamily: "'Space Grotesk'" }}>{e.fee || e.leverage || e.apr}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ MATCHING ENGINE & ORDER TYPES ═══ */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent" />
          <div className="section-container relative">
            <div className="max-w-7xl mx-auto">
              <div className="mb-16">
                <span className="section-badge">Engine</span>
                <h2 className="mt-4 text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>
                  Built for<br />
                  <span className="text-gradient">serious traders.</span>
                </h2>
                <p className="text-muted-foreground mt-3 max-w-lg">Ultra-low-latency matching engine with institutional-grade order types and deep liquidity pools.</p>
              </div>

              <div className="grid lg:grid-cols-2 gap-8">
                {/* Engine Stats */}
                <div className="p-8 rounded-3xl bg-card border border-border/40 shadow-card">
                  <h3 className="text-lg font-bold mb-6" style={{ fontFamily: "'Space Grotesk'" }}>Engine Performance</h3>
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {[
                      { value: "100K+", label: "Orders / Second", sub: "Peak throughput" },
                      { value: "<1ms", label: "Matching Latency", sub: "Average execution" },
                      { value: "99.99%", label: "Uptime SLA", sub: "Enterprise guarantee" },
                      { value: "$500M+", label: "Daily Liquidity", sub: "Across all pairs" },
                    ].map((s, i) => (
                      <div key={i} className="p-4 rounded-xl bg-background/50 border border-border/30 text-center">
                        <p className="text-2xl font-bold text-gradient" style={{ fontFamily: "'Space Grotesk'" }}>{s.value}</p>
                        <p className="text-xs font-bold mt-1">{s.label}</p>
                        <p className="text-[10px] text-muted-foreground">{s.sub}</p>
                      </div>
                    ))}
                  </div>
                  <div className="p-4 rounded-xl bg-gradient-to-r from-primary/5 to-transparent border border-primary/20">
                    <p className="text-xs text-muted-foreground">Our proprietary matching engine uses price-time priority with memory-mapped order books, ensuring deterministic execution for every trade.</p>
                  </div>
                </div>

                {/* Order Types */}
                <div className="p-8 rounded-3xl bg-card border border-border/40 shadow-card">
                  <h3 className="text-lg font-bold mb-6" style={{ fontFamily: "'Space Grotesk'" }}>Advanced Order Types</h3>
                  <div className="space-y-3">
                    {[
                      { type: "Market Order", desc: "Instant execution at the best available price", tag: "Basic" },
                      { type: "Limit Order", desc: "Set your price — executes when the market reaches it", tag: "Basic" },
                      { type: "Stop-Loss", desc: "Automatically sell when price drops below your threshold", tag: "Risk Mgmt" },
                      { type: "OCO (One-Cancels-Other)", desc: "Pair a take-profit and stop-loss — one triggers, the other cancels", tag: "Advanced" },
                      { type: "Trailing Stop", desc: "Dynamic stop that follows the price by a set percentage", tag: "Advanced" },
                      { type: "Iceberg Order", desc: "Large orders split into smaller visible chunks to reduce market impact", tag: "Institutional" },
                    ].map((order, i) => (
                      <div key={i} className="p-4 rounded-xl bg-background/50 border border-border/30 hover-border-glow transition-all">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-bold text-sm">{order.type}</p>
                            <p className="text-xs text-muted-foreground mt-0.5">{order.desc}</p>
                          </div>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold shrink-0">{order.tag}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS ═══ */}
        <section className="py-20 relative">
          <div className="section-container">
            <div className="max-w-7xl mx-auto">
              <div className="mb-14">
                <span className="section-badge">Getting Started</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Four steps to <span className="text-gradient">freedom.</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-4 gap-0 relative">
                <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30" />
                {[
                  { step: "01", title: "Create Account", desc: "Sign up with email and verify your identity" },
                  { step: "02", title: "Deposit Funds", desc: "Add crypto or fiat via bank transfer or card" },
                  { step: "03", title: "Choose Your Market", desc: "Spot, futures, or margin trading" },
                  { step: "04", title: "Start Trading", desc: "Execute trades and earn rewards" },
                ].map((item, i) => (
                  <div key={i} className="text-center px-4 py-6 relative group">
                    <div className="h-20 w-20 mx-auto rounded-full border-2 border-primary/20 bg-card flex items-center justify-center mb-5 group-hover:border-primary/60 group-hover:shadow-glow transition-all">
                      <span className="text-2xl font-bold text-gradient" style={{ fontFamily: "'Space Grotesk'" }}>{item.step}</span>
                    </div>
                    <h3 className="font-bold mb-1 text-base" style={{ fontFamily: "'Space Grotesk'" }}>{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ LIVE PRICES ═══ */}
        <section className="py-20 relative">
          <div className="section-container">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
                <div>
                  <span className="section-badge">Real-Time</span>
                  <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                    Live <span className="text-gradient">Markets</span>
                  </h2>
                </div>
                <Link to="/markets">
                  <Button variant="outline" className="rounded-full hover-border-glow">View all markets</Button>
                </Link>
              </div>
              <div className="rounded-2xl bg-card border border-border/40 shadow-elevated overflow-hidden">
                <LivePricesTable />
              </div>
            </div>
          </div>
        </section>

        {/* ═══ TRADING MODES ═══ */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent" />
          <div className="section-container relative">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Trade</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Choose your <span className="text-gradient">style.</span>
                </h2>
                <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Spot, futures, or margin — professional tools for every strategy.</p>
              </div>
              <TradingModes />
            </div>
          </div>
        </section>

        {/* ═══ INSTANT CONVERT ═══ */}
        <section className="py-24 relative">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <span className="section-badge">Convert</span>
                  <h2 className="mt-4 text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>
                    Instant<br />
                    <span className="text-gradient">conversion.</span>
                  </h2>
                  <p className="text-muted-foreground mt-4 text-lg leading-relaxed max-w-md">
                    Convert between 500+ token pairs instantly — no orderbook needed. Best rates guaranteed with zero slippage on stablecoins.
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-4">
                    {[
                      { label: "Convert Fee", value: "0.1%" },
                      { label: "Chains", value: "6+" },
                      { label: "Pairs", value: "500+" },
                    ].map((s, i) => (
                      <div key={i} className="text-center p-3 rounded-xl bg-card border border-border/30">
                        <p className="text-xl font-bold text-gradient" style={{ fontFamily: "'Space Grotesk'" }}>{s.value}</p>
                        <p className="text-xs text-muted-foreground mt-1">{s.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="hover-lift">
                  <QuickSwap />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FIAT GATEWAY ═══ */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] to-transparent" />
          <div className="section-container relative">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <span className="section-badge">Fiat</span>
                  <h2 className="mt-4 text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>
                    Buy crypto with<br />
                    <span className="text-gradient">real money.</span>
                  </h2>
                  <p className="text-muted-foreground mt-4 text-lg leading-relaxed max-w-md">
                    Deposit and withdraw fiat currencies instantly. Multiple payment methods, regulated banking partners, and competitive rates.
                  </p>
                  <div className="mt-8 space-y-4">
                    {[
                      "Instant deposits via bank transfer, credit/debit card",
                      "Support for USD, EUR, GBP, AUD, and 15+ currencies",
                      "Apple Pay and Google Pay integration",
                      "Same-day withdrawals to your bank account",
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                        <p className="text-sm text-muted-foreground">{feature}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { method: "Bank Transfer", speed: "1-2 hours", fee: "Free", limit: "$1M/day" },
                    { method: "Credit Card", speed: "Instant", fee: "1.5%", limit: "$50K/day" },
                    { method: "Apple Pay", speed: "Instant", fee: "1.0%", limit: "$25K/day" },
                    { method: "Wire Transfer", speed: "1 business day", fee: "0.1%", limit: "Unlimited" },
                  ].map((m, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-card border border-border/40 hover-border-glow transition-all">
                      <p className="font-bold text-sm mb-3" style={{ fontFamily: "'Space Grotesk'" }}>{m.method}</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Speed</span>
                          <span className="font-semibold">{m.speed}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Fee</span>
                          <span className="font-semibold text-[hsl(var(--vnx-green))]">{m.fee}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Limit</span>
                          <span className="font-semibold">{m.limit}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ TOKENOMICS ═══ */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.03] to-transparent" />
          <div className="section-container relative">
            <div className="max-w-7xl mx-auto">
              <div className="mb-16">
                <span className="section-badge">Tokenomics</span>
                <h2 className="mt-4 text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>
                  Built for<br />
                  <span className="text-gradient">long-term growth.</span>
                </h2>
              </div>
              <div className="grid lg:grid-cols-2 gap-8">
                <div className="p-8 rounded-3xl bg-card border border-border/40 shadow-card">
                  <h3 className="text-lg font-bold mb-8" style={{ fontFamily: "'Space Grotesk'" }}>Token Distribution</h3>
                  <div className="space-y-5">
                    {[
                      { label: "Public Sale", percent: 40, amount: "4B VNX" },
                      { label: "Staking Rewards", percent: 25, amount: "2.5B VNX" },
                      { label: "Team & Advisors", percent: 15, amount: "1.5B VNX" },
                      { label: "Liquidity", percent: 10, amount: "1B VNX" },
                      { label: "Marketing", percent: 10, amount: "1B VNX" },
                    ].map((item, i) => (
                      <div key={i}>
                        <div className="flex justify-between mb-1.5">
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                          <span className="text-sm font-bold">{item.percent}% — {item.amount}</span>
                        </div>
                        <div className="h-2 rounded-full bg-muted overflow-hidden">
                          <motion.div
                            className="h-full rounded-full gradient-primary"
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.percent}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { title: "Trading Fee Discounts", desc: "Up to 50% off trading fees", highlight: "50%" },
                    { title: "Staking Rewards", desc: "Earn on staked VNX", highlight: "12.5% APR" },
                    { title: "VIP Tiers", desc: "Higher VNX = lower fees & priority", highlight: "VIP" },
                    { title: "Premium Features", desc: "Advanced trading tools", highlight: "Pro" },
                    { title: "Launchpad Access", desc: "Early access to new tokens", highlight: "IEO" },
                    { title: "Fee Burn", desc: "Deflationary mechanism", highlight: "Burn" },
                  ].map((item, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-card border border-border/40 hover-border-glow transition-all group">
                      <span className="text-xl font-bold text-gradient block mb-2" style={{ fontFamily: "'Space Grotesk'" }}>{item.highlight}</span>
                      <h4 className="font-semibold text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mt-8">
                <a href="https://pancakeswap.finance/info/tokens/0xeb55a55c384095ced21587afbe7418b7c9ae40cb" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="rounded-full hover-border-glow">PancakeSwap</Button>
                </a>
                <a href="https://apespace.io/bsc/0xeb55a55c384095ced21587afbe7418b7c9ae40cb" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="rounded-full hover-border-glow">ApeSpace</Button>
                </a>
                <Link to="/vnx">
                  <Button variant="outline" size="sm" className="rounded-full hover-border-glow">VNX Token Page</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ COMPARISON ═══ */}
        <section className="py-20 relative">
          <div className="section-container">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Compare</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Why we <span className="text-gradient">stand out.</span>
                </h2>
              </div>
              <div className="rounded-2xl bg-card border border-border/40 shadow-elevated overflow-hidden">
                <div className="grid grid-cols-4 gap-0 text-sm">
                  <div className="p-5 font-bold border-b border-border/40">Feature</div>
                  <div className="p-5 font-bold border-b border-border/40 text-center text-gradient">VyronexVNX</div>
                  <div className="p-5 font-bold border-b border-border/40 text-center text-muted-foreground">Other CEX</div>
                  <div className="p-5 font-bold border-b border-border/40 text-center text-muted-foreground">DEX</div>
                  {[
                    { feature: "Multi-Chain", vnx: "6 Chains", cex: "Limited", other: "1-2" },
                    { feature: "Custody", vnx: "Insured", cex: "Basic", other: "Self" },
                    { feature: "Fees", vnx: "0.1%", cex: "0.2-0.5%", other: "Gas + 0.3%" },
                    { feature: "Earn Programs", vnx: "24.8%", cex: "3-5%", other: "Variable" },
                    { feature: "Fiat On-Ramp", vnx: "15+ Currencies", cex: "Limited", other: "None" },
                    { feature: "Matching Speed", vnx: "<1ms", cex: "5-50ms", other: "Block time" },
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

        {/* ═══ SUPPORTED ASSETS ═══ */}
        <section className="py-20 relative">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Assets</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Hundreds of <span className="text-gradient">tokens.</span>
                </h2>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { symbol: "BTC", name: "Bitcoin", icon: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
                  { symbol: "ETH", name: "Ethereum", icon: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
                  { symbol: "BNB", name: "BNB", icon: "https://assets.coingecko.com/coins/images/825/small/bnb-icon2_2x.png" },
                  { symbol: "SOL", name: "Solana", icon: "https://assets.coingecko.com/coins/images/4128/small/solana.png" },
                  { symbol: "TRX", name: "Tron", icon: "https://assets.coingecko.com/coins/images/1094/small/tron-logo.png" },
                  { symbol: "FTM", name: "Fantom", icon: "https://assets.coingecko.com/coins/images/4001/small/Fantom_round.png" },
                  { symbol: "USDT", name: "Tether", icon: "https://assets.coingecko.com/coins/images/325/small/Tether.png" },
                  { symbol: "USDC", name: "USD Coin", icon: "https://assets.coingecko.com/coins/images/6319/small/usdc.png" },
                  { symbol: "DAI", name: "Dai", icon: "https://assets.coingecko.com/coins/images/9956/small/Badge_Dai.png" },
                  { symbol: "LINK", name: "Chainlink", icon: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png" },
                  { symbol: "UNI", name: "Uniswap", icon: "https://assets.coingecko.com/coins/images/12504/small/uniswap-logo.png" },
                  { symbol: "MATIC", name: "Polygon", icon: "https://assets.coingecko.com/coins/images/4713/small/polygon.png" },
                  { symbol: "AVAX", name: "Avalanche", icon: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png" },
                  { symbol: "ARB", name: "Arbitrum", icon: "https://assets.coingecko.com/coins/images/16547/small/arb.jpg" },
                  { symbol: "OP", name: "Optimism", icon: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png" },
                  { symbol: "DOGE", name: "Dogecoin", icon: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png" },
                  { symbol: "SHIB", name: "Shiba Inu", icon: "https://assets.coingecko.com/coins/images/11939/small/shiba.png" },
                  { symbol: "ADA", name: "Cardano", icon: "https://assets.coingecko.com/coins/images/975/small/cardano.png" },
                  { symbol: "XRP", name: "Ripple", icon: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png" },
                  { symbol: "VNX", name: "VyronexVNX", icon: "/placeholder.svg", isVnx: true },
                ].map((asset, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-5 py-3 rounded-full bg-card border border-border/40 hover-border-glow transition-all hover-scale-subtle cursor-default">
                    {asset.isVnx ? (
                      <div className="h-7 w-7 rounded-full gradient-primary flex items-center justify-center">
                        <span className="text-[10px] font-bold text-primary-foreground">VNX</span>
                      </div>
                    ) : (
                      <img src={asset.icon} alt={asset.name} className="h-7 w-7 rounded-full" loading="lazy" />
                    )}
                    <span className="font-semibold text-sm">{asset.symbol}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">{asset.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ EARN PROGRAMS ═══ */}
        <section className="py-24 relative">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Earn</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Passive income,<br />
                  <span className="text-gradient">simplified.</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { title: "Flexible Savings", apr: "8.5%", desc: "Deposit and withdraw anytime with daily interest on 50+ supported tokens", tag: "Easy", tagColor: "bg-primary/10 text-primary" },
                  { title: "Fixed Staking", apr: "12.5%", desc: "Lock VNX or other tokens for fixed terms and earn guaranteed higher returns", tag: "Popular", tagColor: "bg-accent/10 text-accent" },
                  { title: "Launchpool", apr: "24.8%", desc: "Stake VNX to farm new token listings before they go live on the exchange", tag: "Exclusive", tagColor: "bg-[hsl(var(--vnx-gold))]/10 text-[hsl(var(--vnx-gold))]" },
                ].map((earn, i) => (
                  <div key={i} className="p-8 rounded-3xl bg-card border border-border/40 shadow-card hover-border-glow transition-all group">
                    <div className="flex justify-between items-start mb-6">
                      <h3 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk'" }}>{earn.title}</h3>
                      <span className={`text-xs px-3 py-1 rounded-full font-semibold ${earn.tagColor}`}>{earn.tag}</span>
                    </div>
                    <p className="text-5xl font-bold text-gradient mb-3" style={{ fontFamily: "'Space Grotesk'" }}>
                      {earn.apr}
                    </p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-4">APR</p>
                    <p className="text-sm text-muted-foreground mb-6">{earn.desc}</p>
                    <Link to="/stake">
                      <Button variant="outline" size="sm" className="w-full rounded-full group-hover:border-primary/40 transition-all">
                        Start Earning
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ COPY TRADING & LEADERBOARD ═══ */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
          <div className="section-container relative">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <span className="section-badge">Social</span>
                  <h2 className="mt-4 text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>
                    Copy the<br />
                    <span className="text-gradient">best traders.</span>
                  </h2>
                  <p className="text-muted-foreground mt-4 mb-8 max-w-md">
                    Follow top-performing traders and automatically mirror their strategies. Earn while you learn.
                  </p>
                  <div className="space-y-4">
                    {[
                      { step: "01", title: "Browse Leaderboard", desc: "Find traders ranked by ROI, win rate, and risk score" },
                      { step: "02", title: "Follow & Copy", desc: "One-click to auto-copy any trader's positions" },
                      { step: "03", title: "Set Limits", desc: "Control max investment, stop-loss, and allocation per trade" },
                      { step: "04", title: "Earn Together", desc: "Profit when they profit — transparent profit-sharing model" },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 items-center p-4 rounded-xl hover:bg-card/50 transition-all">
                        <span className="text-xl font-bold text-primary/30 w-8" style={{ fontFamily: "'Space Grotesk'" }}>{item.step}</span>
                        <div>
                          <p className="font-semibold text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-card border border-border/40 shadow-card">
                  <h3 className="text-lg font-bold mb-6" style={{ fontFamily: "'Space Grotesk'" }}>Top Traders This Month</h3>
                  <div className="space-y-3">
                    {[
                      { rank: "1", name: "CryptoAlpha", roi: "+142.5%", winRate: "78%", followers: "2,340", pnl: "+$1.2M" },
                      { rank: "2", name: "SwingMaster", roi: "+98.3%", winRate: "72%", followers: "1,850", pnl: "+$890K" },
                      { rank: "3", name: "SteadyEddie", roi: "+67.1%", winRate: "85%", followers: "3,120", pnl: "+$540K" },
                      { rank: "4", name: "MoonTrader", roi: "+54.8%", winRate: "65%", followers: "980", pnl: "+$320K" },
                      { rank: "5", name: "DCAKing", roi: "+43.2%", winRate: "91%", followers: "4,500", pnl: "+$280K" },
                    ].map((trader, i) => (
                      <div key={i} className="p-4 rounded-xl bg-background/50 border border-border/30 hover-border-glow transition-all">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="text-lg font-bold text-primary/40 w-6" style={{ fontFamily: "'Space Grotesk'" }}>#{trader.rank}</span>
                            <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                              <span className="text-xs font-bold text-primary-foreground">{trader.name[0]}</span>
                            </div>
                            <div>
                              <p className="font-bold text-sm">{trader.name}</p>
                              <p className="text-[10px] text-muted-foreground">{trader.followers} followers</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-sm text-[hsl(var(--vnx-green))]">{trader.roi}</p>
                            <p className="text-[10px] text-muted-foreground">Win {trader.winRate}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ COMMUNITY VOICE ═══ */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
          <div className="section-container relative">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <span className="section-badge">Community</span>
                  <h2 className="mt-4 text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>
                    Your voice<br />
                    <span className="text-gradient">matters.</span>
                  </h2>
                  <p className="text-muted-foreground mt-4 mb-8 max-w-md">Shape the future of VyronexVNX through community governance. Hold VNX to propose and vote on platform changes.</p>
                  <div className="space-y-4">
                    {[
                      { step: "01", title: "Hold VNX", desc: "VNX holdings determine your voting power" },
                      { step: "02", title: "Propose", desc: "Submit platform improvement proposals" },
                      { step: "03", title: "Vote", desc: "Cast your vote on active proposals" },
                      { step: "04", title: "Execute", desc: "Approved changes are implemented by the team" },
                    ].map((item, i) => (
                      <div key={i} className="flex gap-4 items-center p-4 rounded-xl hover:bg-card/50 transition-all">
                        <span className="text-xl font-bold text-primary/30 w-8" style={{ fontFamily: "'Space Grotesk'" }}>{item.step}</span>
                        <div>
                          <p className="font-semibold text-sm">{item.title}</p>
                          <p className="text-xs text-muted-foreground">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-card border border-border/40 shadow-card">
                  <h3 className="text-lg font-bold mb-6" style={{ fontFamily: "'Space Grotesk'" }}>Active Proposals</h3>
                  <div className="space-y-3">
                    {[
                      { title: "Reduce Trading Fees to 0.08%", votes: "12,450", status: "Active" },
                      { title: "Add Avalanche Chain Support", votes: "8,320", status: "Active" },
                      { title: "Increase Staking APR to 15%", votes: "15,780", status: "Passed" },
                      { title: "Launch Copy Trading Feature", votes: "6,100", status: "Voting" },
                    ].map((proposal, i) => (
                      <div key={i} className="p-4 rounded-xl bg-background/50 border border-border/30 hover-border-glow transition-all">
                        <div className="flex justify-between items-start">
                          <p className="font-semibold text-sm">{proposal.title}</p>
                          <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium shrink-0 ml-2 ${proposal.status === 'Passed' ? 'bg-[hsl(var(--vnx-green))]/10 text-[hsl(var(--vnx-green))]' : 'bg-primary/10 text-primary'}`}>
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

        {/* ═══ DEVELOPER API ═══ */}
        <section className="py-24 relative">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">API</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Built for <span className="text-gradient">developers.</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[
                  { title: "REST API", desc: "Full-featured endpoints for trading, account, and market data" },
                  { title: "WebSocket", desc: "Real-time order book, trades, and account streams" },
                  { title: "SDK Libraries", desc: "Official SDKs for JavaScript, Python, Go, and Rust" },
                ].map((api, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-card border border-border/40 hover-border-glow transition-all">
                    <h3 className="font-bold mb-2" style={{ fontFamily: "'Space Grotesk'" }}>{api.title}</h3>
                    <p className="text-sm text-muted-foreground">{api.desc}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-card border border-border/40 p-6 overflow-x-auto">
                <pre className="text-sm text-muted-foreground font-mono">
                  <code>{`// Place a limit order via REST API
const res = await fetch('https://api.vyronexvnx.com/v1/order', {
  method: 'POST',
  headers: { 'X-API-Key': apiKey },
  body: JSON.stringify({
    symbol: 'VNX-USDT',
    side: 'buy',
    type: 'limit',
    price: '0.000542',
    quantity: '10000'
  })
});`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ INSTITUTIONAL & OTC ═══ */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/[0.04] to-transparent" />
          <div className="section-container relative">
            <div className="max-w-7xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <span className="section-badge">Institutional</span>
                  <h2 className="mt-4 text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>
                    Built for<br />
                    <span className="text-gradient">institutions.</span>
                  </h2>
                  <p className="text-muted-foreground mt-4 mb-8 text-lg max-w-md leading-relaxed">
                    Enterprise-grade tools for funds, family offices, and professional trading firms. Deep liquidity and white-glove service.
                  </p>
                  <div className="space-y-3 mb-8">
                    {[
                      "OTC desk for large block trades with zero market impact",
                      "Dedicated account managers and priority API access",
                      "Sub-account management for fund allocation",
                      "Custom fee tiers and negotiated rates",
                      "Regulatory-compliant reporting and audit trails",
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                        <p className="text-sm text-muted-foreground">{feature}</p>
                      </div>
                    ))}
                  </div>
                  <Link to="/contact">
                    <Button size="lg" className="rounded-full px-10 gradient-primary shadow-glow hover:shadow-glow-lg transition-all active-press">
                      Contact Sales
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { value: "$50M+", label: "Min OTC Trade", sub: "No market impact" },
                    { value: "T+0", label: "Settlement", sub: "Same-day clearing" },
                    { value: "24/7", label: "OTC Desk", sub: "Always available" },
                    { value: "Custom", label: "Fee Structure", sub: "Negotiated rates" },
                    { value: "FIX 4.4", label: "Protocol", sub: "Institutional standard" },
                    { value: "SOC 2", label: "Compliance", sub: "Type II certified" },
                  ].map((item, i) => (
                    <div key={i} className="p-5 rounded-2xl bg-card border border-border/40 hover-border-glow transition-all text-center">
                      <p className="text-2xl font-bold text-gradient" style={{ fontFamily: "'Space Grotesk'" }}>{item.value}</p>
                      <p className="text-xs font-bold mt-1">{item.label}</p>
                      <p className="text-[10px] text-muted-foreground">{item.sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ MOBILE APP ═══ */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-primary/[0.04] to-transparent" />
          <div className="section-container relative">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div className="relative order-2 lg:order-1">
                  <div className="mx-auto w-[240px] md:w-[270px] relative animate-float">
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
                          {["Send", "Trade", "Earn", "Buy"].map(a => (
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
                </div>

                <div className="order-1 lg:order-2">
                  <span className="section-badge">Mobile</span>
                  <h2 className="mt-4 text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>
                    Trade from<br />
                    <span className="text-gradient">anywhere.</span>
                  </h2>
                  <p className="text-muted-foreground mt-4 mb-8 text-lg max-w-md leading-relaxed">
                    Full exchange functionality in your pocket. Execute trades, manage your portfolio, and earn rewards on the go.
                  </p>
                  <div className="space-y-3 mb-8">
                    {[
                      "Real-time price alerts and push notifications",
                      "Biometric authentication for secure access",
                      "One-tap trading with customizable shortcuts",
                      "Portfolio analytics and P&L tracking",
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0" />
                        <p className="text-sm text-muted-foreground">{feature}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 flex-wrap">
                    <a href="#" className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity active-press">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.32 2.32-1.55 4.3-3.74 4.25z"/></svg>
                      <div className="text-left">
                        <div className="text-[10px] leading-none opacity-70">Download on the</div>
                        <div className="text-sm font-semibold leading-tight">App Store</div>
                      </div>
                    </a>
                    <a href="#" className="inline-flex items-center gap-3 px-5 py-3 rounded-full bg-foreground text-background hover:opacity-90 transition-opacity active-press">
                      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M3.18 23.49c-.41-.2-.68-.6-.68-1.04V1.55c0-.44.27-.84.68-1.04l11.3 11.49L3.18 23.49zm1.4-22.2L15.58 12 4.58 22.71V1.29zm.72-.3L17.16 10.6l-2.83 2.89L5.3.99zM17.89 11.27l2.6 1.5c.65.37.65 1.1 0 1.47l-2.6 1.5-3.14-2.23 3.14-2.24zM5.3 23.01l12.86-7.43-2.58-2.58L5.3 23.01z"/></svg>
                      <div className="text-left">
                        <div className="text-[10px] leading-none opacity-70">GET IT ON</div>
                        <div className="text-sm font-semibold leading-tight">Google Play</div>
                      </div>
                    </a>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mt-8">
                    <div className="text-center">
                      <div className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>100K+</div>
                      <p className="text-xs text-muted-foreground">Downloads</p>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>4.8</div>
                      <p className="text-xs text-muted-foreground">Rating</p>
                    </div>
                    <div className="text-center">
                      <div className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>&lt;50ms</div>
                      <p className="text-xs text-muted-foreground">Latency</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PARTNERS & INTEGRATIONS ═══ */}
        <section className="py-20 relative">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Ecosystem</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Trusted <span className="text-gradient">partners.</span>
                </h2>
                <p className="text-muted-foreground mt-3">Industry-leading infrastructure and compliance partners.</p>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  "Chainlink", "Fireblocks", "Chainalysis", "Elliptic",
                  "AWS", "Cloudflare", "CertiK", "PeckShield",
                  "Visa", "Mastercard", "Circle", "MoonPay",
                ].map((partner, i) => (
                  <div key={i} className="px-6 py-4 rounded-full bg-card border border-border/40 hover-border-glow transition-all hover-scale-subtle cursor-default">
                    <span className="font-bold text-sm tracking-wide">{partner}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ TESTIMONIALS ═══ */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
          <div className="section-container relative">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Testimonials</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Loved by <span className="text-gradient">traders worldwide.</span>
                </h2>
                <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                  Join 50,000+ users trading on VyronexVNX.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-5 mb-10">
                {[
                  { quote: "Best multi-chain CEX I've used. Instant deposits, fast matching, and the earn programs are unbeatable.", name: "Marcus T.", role: "Day Trader", rating: "5.0" },
                  { quote: "VNX staking has been a game-changer. I'm earning passive income daily and the platform feels rock-solid.", name: "Sofia R.", role: "Long-term Holder", rating: "5.0" },
                  { quote: "The futures dashboard rivals Binance. Deep liquidity and zero downtime — exactly what I need for scalping.", name: "Kenji A.", role: "Futures Trader", rating: "4.9" },
                ].map((t, i) => (
                  <div key={i} className="p-7 rounded-3xl bg-card border border-border/40 shadow-card hover-border-glow transition-all flex flex-col">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-primary/10 text-primary">★ {t.rating}</span>
                      <span className="text-xs text-muted-foreground uppercase tracking-wider">Verified User</span>
                    </div>
                    <p className="text-sm leading-relaxed mb-6 flex-1">"{t.quote}"</p>
                    <div className="pt-4 border-t border-border/30">
                      <p className="font-bold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { value: "50K+", label: "Active Users" },
                  { value: "4.9/5", label: "Avg Rating" },
                  { value: "$2.5B+", label: "Volume Traded" },
                  { value: "120+", label: "Countries" },
                ].map((s, i) => (
                  <div key={i} className="text-center p-5 rounded-2xl bg-card border border-border/40">
                    <p className="text-2xl font-bold text-gradient" style={{ fontFamily: "'Space Grotesk'" }}>{s.value}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ REFERRAL ═══ */}
        <section className="py-24 relative">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Rewards</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Refer and <span className="text-gradient">earn.</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4 mb-10">
                {[
                  { tier: "Bronze", referrals: "1-10", reward: "10%", bonus: "500 VNX" },
                  { tier: "Silver", referrals: "11-50", reward: "15%", bonus: "2,500 VNX" },
                  { tier: "Gold", referrals: "51+", reward: "20%", bonus: "10,000 VNX" },
                ].map((tier, i) => (
                  <div key={i} className="p-8 rounded-3xl bg-card border border-border/40 shadow-card text-center hover-border-glow transition-all">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-2">{tier.tier}</p>
                    <p className="text-4xl font-bold text-gradient mb-1" style={{ fontFamily: "'Space Grotesk'" }}>{tier.reward}</p>
                    <p className="text-sm text-muted-foreground mb-3">Commission</p>
                    <div className="h-px bg-border/40 my-4" />
                    <p className="text-xs text-muted-foreground">{tier.referrals} referrals — +{tier.bonus} bonus</p>
                  </div>
                ))}
              </div>
              <div className="text-center">
                <Link to="/auth">
                  <Button size="lg" className="rounded-full px-10 gradient-primary shadow-glow hover:shadow-glow-lg transition-all active-press">Start Referring</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ LAUNCHPAD (IEO) ═══ */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent" />
          <div className="section-container relative">
            <div className="max-w-6xl mx-auto">
              <div className="mb-14">
                <span className="section-badge">IEO</span>
                <h2 className="mt-4 text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>
                  VNX <span className="text-gradient">Launchpad.</span>
                </h2>
                <p className="text-muted-foreground mt-3 max-w-md">Be early to the next big project — exclusive token launches vetted and listed by VyronexVNX.</p>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { name: "MetaForge", ticker: "MFG", raised: "$1.2M", target: "$2M", status: "Live", progress: 60 },
                  { name: "ChainGuard", ticker: "CGD", raised: "$800K", target: "$1.5M", status: "Upcoming", progress: 0 },
                  { name: "NeuraNet", ticker: "NRT", raised: "$3M", target: "$3M", status: "Completed", progress: 100 },
                ].map((project, i) => (
                  <div key={i} className="p-7 rounded-3xl bg-card border border-border/40 shadow-card hover-border-glow transition-all">
                    <div className="flex justify-between items-start mb-5">
                      <div>
                        <h3 className="font-bold text-lg" style={{ fontFamily: "'Space Grotesk'" }}>{project.name}</h3>
                        <span className="text-xs text-muted-foreground">${project.ticker}</span>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${project.status === 'Live' ? 'bg-primary/10 text-primary' : project.status === 'Completed' ? 'bg-[hsl(var(--vnx-green))]/10 text-[hsl(var(--vnx-green))]' : 'bg-muted text-muted-foreground'}`}>
                        {project.status}
                      </span>
                    </div>
                    <div className="mb-5">
                      <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
                        <span>{project.raised}</span>
                        <span>{project.target}</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted overflow-hidden">
                        <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${project.progress}%` }} />
                      </div>
                    </div>
                    <Button variant="outline" size="sm" className="w-full rounded-full" disabled={project.status === 'Completed'}>
                      {project.status === 'Completed' ? 'Ended' : project.status === 'Live' ? 'Participate' : 'Notify Me'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ SECURITY & COMPLIANCE ═══ */}
        <section className="py-24 relative">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Security & Compliance</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Audited. Insured. <span className="text-gradient">Regulated.</span>
                </h2>
                <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                  Institutional-grade security architecture with proof-of-reserves and regulatory compliance across 120+ jurisdictions.
                </p>
              </div>

              <div className="grid md:grid-cols-4 gap-4 mb-10">
                {[
                  { value: "$100M", label: "Insurance Fund", sub: "User asset protection" },
                  { value: "95%", label: "Cold Storage", sub: "Multi-sig vaults" },
                  { value: "AES-256", label: "Encryption", sub: "End-to-end" },
                  { value: "24/7", label: "Monitoring", sub: "Real-time threat detection" },
                ].map((item, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-card border border-border/40 hover-border-glow transition-all text-center">
                    <p className="text-3xl font-bold text-gradient mb-1" style={{ fontFamily: "'Space Grotesk'" }}>{item.value}</p>
                    <p className="text-sm font-bold mb-1">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4 mb-8">
                <div className="p-8 rounded-3xl bg-gradient-to-br from-primary/5 to-transparent border border-primary/20">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Proof of Reserves</p>
                  <h3 className="text-lg font-bold mb-3" style={{ fontFamily: "'Space Grotesk'" }}>100% asset-backed</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">All user funds are fully backed 1:1. Our proof-of-reserves is verified monthly by independent auditors and published on-chain for full transparency.</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Reserve Ratio", value: "102%" },
                      { label: "Last Audit", value: "Apr 2026" },
                      { label: "Auditor", value: "CertiK" },
                    ].map((r, i) => (
                      <div key={i} className="p-3 rounded-xl bg-background/50 border border-border/30 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase">{r.label}</p>
                        <p className="text-sm font-bold mt-1">{r.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-8 rounded-3xl bg-card border border-border/40 shadow-card">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-4">Bug Bounty Program</p>
                  <h3 className="text-lg font-bold mb-3" style={{ fontFamily: "'Space Grotesk'" }}>$250K bounty pool</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">Security researchers worldwide are incentivized to responsibly disclose vulnerabilities. Payouts from $500 to $100K based on severity.</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Pool Size", value: "$250K" },
                      { label: "Max Payout", value: "$100K" },
                      { label: "Reports", value: "340+" },
                    ].map((r, i) => (
                      <div key={i} className="p-3 rounded-xl bg-background/50 border border-border/30 text-center">
                        <p className="text-[10px] text-muted-foreground uppercase">{r.label}</p>
                        <p className="text-sm font-bold mt-1">{r.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-card border border-border/40">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Audited by</p>
                    <h3 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk'" }}>Industry-leading security partners</h3>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    {["CertiK", "Hacken", "PeckShield", "SlowMist"].map((firm) => (
                      <span key={firm} className="px-5 py-2.5 rounded-full bg-background/50 border border-border/40 text-sm font-bold tracking-wide">
                        {firm}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "KYC/AML", value: "Compliant" },
                    { label: "GDPR", value: "Certified" },
                    { label: "SOC 2", value: "Type II" },
                    { label: "ISO 27001", value: "Certified" },
                  ].map((c, i) => (
                    <div key={i} className="p-3 rounded-xl bg-background/50 border border-border/30 text-center">
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{c.label}</p>
                      <p className="text-sm font-bold mt-1">{c.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ GLOBAL REACH ═══ */}
        <section className="py-20 relative">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Worldwide</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  <span className="text-gradient">Global</span> reach.
                </h2>
                <p className="text-muted-foreground mt-3">120+ countries. 24/7 uptime. Regulated across jurisdictions.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { region: "North America", users: "12K+", volume: "$450M" },
                  { region: "Europe", users: "18K+", volume: "$620M" },
                  { region: "Asia Pacific", users: "15K+", volume: "$780M" },
                  { region: "Rest of World", users: "5K+", volume: "$150M" },
                ].map((r, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-card border border-border/40 text-center hover-border-glow transition-all">
                    <p className="text-xs text-muted-foreground mb-2">{r.region}</p>
                    <p className="text-2xl font-bold text-gradient" style={{ fontFamily: "'Space Grotesk'" }}>{r.users}</p>
                    <p className="text-xs text-muted-foreground mt-1">Vol: {r.volume}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap justify-center gap-2">
                {["English", "中文", "Español", "العربية", "Français", "日本語", "한국어", "Português"].map((lang, i) => (
                  <span key={i} className="px-4 py-2 rounded-full bg-card border border-border/30 text-xs font-medium text-muted-foreground">{lang}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ PRESS ═══ */}
        <section className="py-20 relative">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Media</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  In the <span className="text-gradient">press.</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { source: "CoinTelegraph", quote: "VyronexVNX is redefining multi-chain trading with institutional-grade infrastructure and competitive fees.", date: "Jan 2025" },
                  { source: "CryptoSlate", quote: "The VNX token ecosystem creates a flywheel of trading discounts, staking, and governance utility.", date: "Dec 2024" },
                  { source: "The Block", quote: "With 50K+ active users and $2.5B+ in volume, VyronexVNX is a serious contender in the CEX space.", date: "Nov 2024" },
                ].map((article, i) => (
                  <div key={i} className="p-7 rounded-2xl bg-card border border-border/40 hover-border-glow transition-all">
                    <div className="flex justify-between items-center mb-5">
                      <span className="font-bold text-gradient text-sm">{article.source}</span>
                      <span className="text-xs text-muted-foreground">{article.date}</span>
                    </div>
                    <p className="text-sm text-muted-foreground italic leading-relaxed">"{article.quote}"</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ LEARNING CENTER ═══ */}
        <section className="py-20 relative">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-10 gap-4">
                <div>
                  <span className="section-badge">Learn</span>
                  <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                    Learning <span className="text-gradient">center.</span>
                  </h2>
                </div>
                <Link to="/blog">
                  <Button variant="outline" className="rounded-full hover-border-glow">Browse all resources</Button>
                </Link>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { title: "Beginner Guides", count: "24 Articles", desc: "Start your crypto journey step by step" },
                  { title: "Trading Strategies", count: "18 Lessons", desc: "Proven strategies from pro traders" },
                  { title: "Platform Tutorials", count: "12 Guides", desc: "Master every feature of VyronexVNX" },
                  { title: "Security Tips", count: "8 Resources", desc: "Protect your account and assets" },
                ].map((resource, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-card border border-border/40 hover-border-glow transition-all group">
                    <h3 className="font-bold text-sm mb-1" style={{ fontFamily: "'Space Grotesk'" }}>{resource.title}</h3>
                    <p className="text-xs text-primary font-semibold mb-3">{resource.count}</p>
                    <p className="text-sm text-muted-foreground">{resource.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ BADGES ═══ */}
        <section className="py-20 relative">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Gamification</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Earn <span className="text-gradient">badges.</span>
                </h2>
              </div>
              <div className="flex flex-wrap justify-center gap-3">
                {[
                  { badge: "First Trade", xp: "100 XP" },
                  { badge: "Diamond Hands", xp: "500 XP" },
                  { badge: "Whale", xp: "1,000 XP" },
                  { badge: "Staker", xp: "250 XP" },
                  { badge: "Referral King", xp: "750 XP" },
                  { badge: "OG Member", xp: "2,000 XP" },
                ].map((b, i) => (
                  <div key={i} className="px-6 py-4 rounded-full bg-card border border-border/40 hover-border-glow transition-all hover-scale-subtle cursor-default text-center">
                    <span className="font-bold text-sm">{b.badge}</span>
                    <span className="text-xs text-primary font-semibold ml-2">{b.xp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ COMMUNITY & SOCIAL ═══ */}
        <section className="py-20 relative">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Community</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Join the <span className="text-gradient">movement.</span>
                </h2>
                <p className="text-muted-foreground mt-3">Connect with 50,000+ traders across our social channels.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { platform: "Twitter / X", followers: "125K+", handle: "@VyronexVNX", link: "#" },
                  { platform: "Discord", followers: "42K+", handle: "VyronexVNX Community", link: "#" },
                  { platform: "Telegram", followers: "38K+", handle: "@VyronexVNX_Official", link: "#" },
                  { platform: "GitHub", followers: "2.8K+", handle: "VyronexVNX", link: "#" },
                ].map((social, i) => (
                  <a key={i} href={social.link} className="p-6 rounded-2xl bg-card border border-border/40 hover-border-glow transition-all text-center group">
                    <p className="text-3xl font-bold text-gradient mb-2" style={{ fontFamily: "'Space Grotesk'" }}>{social.followers}</p>
                    <p className="font-bold text-sm mb-1">{social.platform}</p>
                    <p className="text-xs text-muted-foreground">{social.handle}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ ROADMAP ═══ */}
        <section className="py-24 relative">
          <div className="section-container">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Roadmap</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  The road <span className="text-gradient">ahead.</span>
                </h2>
                <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                  Quarterly milestones shaping the future of VyronexVNX.
                </p>
              </div>

              <div className="relative">
                <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent md:-translate-x-1/2" />
                <div className="space-y-10">
                  {[
                    { quarter: "Q1 2025", title: "Multi-Chain Expansion", desc: "Launch native support for Solana, Fantom, and Tron with unified custody.", status: "Shipped", statusColor: "text-[hsl(var(--vnx-green))] bg-[hsl(var(--vnx-green))]/10" },
                    { quarter: "Q2 2025", title: "Futures & Margin Trading", desc: "Perpetual futures with up to 100x leverage and isolated/cross margin modes.", status: "In Progress", statusColor: "text-primary bg-primary/10" },
                    { quarter: "Q3 2025", title: "Mobile App Release", desc: "Native iOS and Android apps with biometric security and push notifications.", status: "Upcoming", statusColor: "text-accent bg-accent/10" },
                    { quarter: "Q4 2025", title: "Copy Trading Launch", desc: "Social trading with leaderboards, auto-copy, and transparent profit-sharing.", status: "Planned", statusColor: "text-muted-foreground bg-muted/30" },
                    { quarter: "Q1 2026", title: "Institutional Suite", desc: "OTC desk, prime brokerage tools, FIX protocol, and custody solutions.", status: "Planned", statusColor: "text-muted-foreground bg-muted/30" },
                  ].map((item, i) => (
                    <div key={i} className={`relative flex flex-col md:flex-row gap-6 ${i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}>
                      <div className="absolute left-4 md:left-1/2 w-3 h-3 rounded-full bg-primary shadow-glow md:-translate-x-1/2 mt-2" />
                      <div className={`pl-12 md:pl-0 md:w-1/2 ${i % 2 === 0 ? "md:pr-12 md:text-right" : "md:pl-12"}`}>
                        <div className="p-6 rounded-2xl bg-card border border-border/40 hover-border-glow transition-all w-full">
                          <div className={`flex items-center gap-2 mb-3 ${i % 2 === 0 ? "md:justify-end" : ""}`}>
                            <span className="text-xs font-bold uppercase tracking-[0.2em] text-primary">{item.quarter}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${item.statusColor}`}>{item.status}</span>
                          </div>
                          <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Space Grotesk'" }}>{item.title}</h3>
                          <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                        </div>
                      </div>
                      <div className="hidden md:block md:w-1/2" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ MEET THE TEAM ═══ */}
        <section className="py-24 relative">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Team</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Meet the <span className="text-gradient">team.</span>
                </h2>
                <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                  Veterans from traditional finance, blockchain, and cybersecurity building the next generation of crypto trading.
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { name: "Alexander Vyron", role: "CEO & Founder", bio: "Ex-Goldman Sachs. 15+ years in capital markets and fintech." },
                  { name: "Elena Cortez", role: "CTO", bio: "Former Coinbase engineer. Built matching engines processing $10B+ daily." },
                  { name: "James Nakamura", role: "Head of Security", bio: "Ex-NSA cybersecurity lead. Specializes in cryptographic infrastructure." },
                  { name: "Priya Sharma", role: "Head of Product", bio: "Former Binance PM. Shipped products used by 50M+ crypto traders." },
                  { name: "Marcus Chen", role: "VP Engineering", bio: "Built trading systems at Jane Street. Expert in low-latency infrastructure." },
                  { name: "Sarah Al-Rashid", role: "Chief Compliance", bio: "Former SEC advisor. Navigates regulatory frameworks across 120+ jurisdictions." },
                  { name: "David Park", role: "Head of Growth", bio: "Scaled three crypto startups from 0 to 1M users. Data-driven growth." },
                  { name: "Lucia Fernandez", role: "Head of Design", bio: "Apple Design Award winner. Creates intuitive trading experiences." },
                ].map((member, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-card border border-border/40 hover-border-glow transition-all text-center">
                    <div className="h-16 w-16 mx-auto rounded-full gradient-primary flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-primary-foreground">{member.name.split(' ').map(n => n[0]).join('')}</span>
                    </div>
                    <h3 className="font-bold text-sm" style={{ fontFamily: "'Space Grotesk'" }}>{member.name}</h3>
                    <p className="text-xs text-primary font-semibold mb-2">{member.role}</p>
                    <p className="text-xs text-muted-foreground">{member.bio}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ 24/7 SUPPORT CENTER ═══ */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent" />
          <div className="section-container relative">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Support</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Help when you <span className="text-gradient">need it.</span>
                </h2>
                <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
                  24/7 multilingual support from real humans. Average response time under 2 minutes.
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-4 mb-8">
                {[
                  { title: "Live Chat", desc: "Instant support from our team, available 24 hours a day, 7 days a week", stat: "<2 min", statLabel: "Avg Response" },
                  { title: "Ticket System", desc: "Detailed technical support with full audit trail and escalation paths", stat: "<4 hrs", statLabel: "Resolution" },
                  { title: "Knowledge Base", desc: "500+ articles, video tutorials, and step-by-step guides", stat: "500+", statLabel: "Articles" },
                ].map((support, i) => (
                  <div key={i} className="p-7 rounded-3xl bg-card border border-border/40 shadow-card hover-border-glow transition-all">
                    <h3 className="font-bold text-lg mb-2" style={{ fontFamily: "'Space Grotesk'" }}>{support.title}</h3>
                    <p className="text-sm text-muted-foreground mb-5">{support.desc}</p>
                    <div className="p-3 rounded-xl bg-background/50 border border-border/30 text-center">
                      <p className="text-2xl font-bold text-gradient" style={{ fontFamily: "'Space Grotesk'" }}>{support.stat}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{support.statLabel}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-6 rounded-2xl bg-card border border-border/40">
                  <h3 className="font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>VIP Support Tiers</h3>
                  <div className="space-y-3">
                    {[
                      { tier: "Standard", features: "Live chat + email support", requirement: "All users" },
                      { tier: "Silver", features: "Priority queue + phone support", requirement: "Hold 50K+ VNX" },
                      { tier: "Gold", features: "Dedicated manager + instant escalation", requirement: "Hold 500K+ VNX" },
                    ].map((vip, i) => (
                      <div key={i} className="p-4 rounded-xl bg-background/50 border border-border/30">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-sm">{vip.tier}</span>
                          <span className="text-[10px] text-primary font-semibold">{vip.requirement}</span>
                        </div>
                        <p className="text-xs text-muted-foreground">{vip.features}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 rounded-2xl bg-card border border-border/40">
                  <h3 className="font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>Support Languages</h3>
                  <div className="flex flex-wrap gap-2">
                    {["English", "中文", "Español", "العربية", "Français", "日本語", "한국어", "Português", "Deutsch", "Türkçe", "Русский", "हिन्दी"].map((lang, i) => (
                      <span key={i} className="px-3 py-1.5 rounded-full bg-background/50 border border-border/30 text-xs font-medium text-muted-foreground">{lang}</span>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <Link to="/contact">
                      <Button variant="outline" className="w-full rounded-full hover-border-glow">Contact Support</Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ FAQ ═══ */}
        <section className="py-24 relative">
          <div className="section-container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">FAQ</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Common <span className="text-gradient">questions.</span>
                </h2>
                <p className="text-muted-foreground mt-3 max-w-lg mx-auto">
                  Everything you need to know about trading, security, and rewards.
                </p>
              </div>
              <Accordion type="single" collapsible className="space-y-3">
                {[
                  { q: "What is VyronexVNX?", a: "VyronexVNX is a centralized cryptocurrency exchange supporting 6 blockchains with institutional-grade trading infrastructure, insured custody, and a native VNX utility token for fee discounts, staking, and governance." },
                  { q: "Is VyronexVNX safe?", a: "Yes. 95% of user assets are held in multi-sig cold storage, all data uses AES-256 encryption, and we maintain a $100M insurance fund. We publish monthly proof-of-reserves audited by CertiK." },
                  { q: "How do I start trading?", a: "Create an account with email or Google, complete KYC verification, deposit funds via crypto or fiat on-ramp, and start trading immediately. The whole process takes under 5 minutes." },
                  { q: "What are the trading fees?", a: "Standard taker fees are 0.1%, with maker rebates available. VNX holders receive tiered discounts up to 50% off based on holdings and trading volume." },
                  { q: "Which fiat currencies are supported?", a: "We support 15+ fiat currencies including USD, EUR, GBP, AUD, CAD, and more. Deposit via bank transfer, credit/debit card, Apple Pay, or wire transfer." },
                  { q: "How do earn programs work?", a: "Choose from Flexible Savings (8.5% APR, withdraw anytime), Fixed Staking (12.5% APR), or Launchpool (up to 24.8% APR). Rewards are calculated continuously and distributed daily." },
                  { q: "Can I withdraw at any time?", a: "Flexible savings and spot balances can be withdrawn instantly. Fixed-term stakes unlock at the end of the lock period. No withdrawal fees beyond standard network gas." },
                  { q: "Do you offer institutional services?", a: "Yes — OTC desk for large block trades, dedicated account managers, sub-accounts, custom API limits, FIX protocol support, and regulatory-compliant reporting." },
                ].map((faq, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="rounded-2xl bg-card border border-border/40 px-6 hover-border-glow transition-all"
                  >
                    <AccordionTrigger className="text-left font-bold text-sm hover:no-underline" style={{ fontFamily: "'Space Grotesk'" }}>
                      {faq.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground leading-relaxed">
                      {faq.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ═══ NEWSLETTER CTA ═══ */}
        <section className="py-24 relative">
          <div className="section-container">
            <div className="max-w-4xl mx-auto">
              <div className="p-12 md:p-16 rounded-[2rem] bg-gradient-to-br from-primary/10 via-card to-accent/5 border border-primary/20 shadow-elevated text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/5 rounded-full blur-[100px]" />
                <div className="relative">
                  <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>
                    Ready to start <span className="text-gradient">trading?</span>
                  </h2>
                  <p className="text-muted-foreground mb-10 max-w-md mx-auto">
                    Join 50,000+ traders. Create your account in under 2 minutes.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-5 py-3.5 rounded-full bg-background border border-border/40 focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/20 transition-all"
                    />
                    <Button size="lg" className="rounded-full gradient-primary shadow-glow hover:shadow-glow-lg transition-all active-press whitespace-nowrap">
                      Get Started
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Index;
