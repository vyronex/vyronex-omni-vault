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
          {/* Animated orb background */}
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
                  Multi-Chain DeFi Protocol
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
                One platform. Six blockchains. Enterprise-grade security meets permissionless finance.
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

          {/* Bottom fade line */}
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
        </section>

        {/* ═══ MARQUEE — Scrolling chain logos ═══ */}
        <section className="py-6 border-y border-border/20 overflow-hidden">
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
                {/* Tall left card */}
                <div className="md:row-span-2 p-8 rounded-3xl bg-gradient-to-br from-primary/10 to-primary/[0.02] border border-primary/20 flex flex-col justify-between min-h-[360px] hover-border-glow transition-all group">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-4">Multi-Chain</p>
                    <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Space Grotesk'" }}>6 blockchains,<br />one platform.</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      Seamlessly trade across Ethereum, BNB, Tron, Bitcoin, Fantom, and Solana without switching apps.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-6">
                    {["ETH", "BNB", "TRX", "BTC", "FTM", "SOL"].map(c => (
                      <span key={c} className="px-3 py-1.5 rounded-full bg-card/80 border border-border/40 text-xs font-bold text-muted-foreground group-hover:border-primary/30 transition-all">{c}</span>
                    ))}
                  </div>
                </div>

                {/* Top right cards */}
                <div className="p-7 rounded-3xl bg-card border border-border/40 shadow-card hover-border-glow transition-all">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent mb-3">Security</p>
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Space Grotesk'" }}>Bank-grade protection</h3>
                  <p className="text-sm text-muted-foreground">AES-256 encryption, cold storage for 95% of assets, and $100M insurance fund.</p>
                </div>

                <div className="p-7 rounded-3xl bg-card border border-border/40 shadow-card hover-border-glow transition-all">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--vnx-green))] mb-3">Speed</p>
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Space Grotesk'" }}>Sub-second execution</h3>
                  <p className="text-sm text-muted-foreground">Real-time market data with less than 50ms latency for instant order execution.</p>
                </div>

                {/* Bottom right wide card */}
                <div className="md:col-span-2 p-7 rounded-3xl bg-card border border-border/40 shadow-card hover-border-glow transition-all">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[hsl(var(--vnx-gold))] mb-3">DeFi Suite</p>
                  <h3 className="text-lg font-bold mb-2" style={{ fontFamily: "'Space Grotesk'" }}>Stake, Farm, Earn — all in one place</h3>
                  <p className="text-sm text-muted-foreground mb-4">Earn up to 24.8% APR through staking, liquidity mining, and yield farming with automated strategies.</p>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: "Staking", apr: "12.5%" },
                      { label: "LP Mining", apr: "18.2%" },
                      { label: "Yield Farm", apr: "24.8%" },
                    ].map((e, i) => (
                      <div key={i} className="p-3 rounded-xl bg-background/50 border border-border/30 text-center">
                        <p className="text-xs text-muted-foreground">{e.label}</p>
                        <p className="text-lg font-bold text-gradient" style={{ fontFamily: "'Space Grotesk'" }}>{e.apr}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ HOW IT WORKS — Horizontal numbered strip ═══ */}
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
                {/* Connecting line */}
                <div className="hidden md:block absolute top-10 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary/30 via-primary/20 to-primary/30" />
                {[
                  { step: "01", title: "Create Account", desc: "Sign up with email and verify your identity" },
                  { step: "02", title: "Connect Wallet", desc: "Link your crypto wallet or use ours" },
                  { step: "03", title: "Deposit Funds", desc: "Add crypto or fiat currency" },
                  { step: "04", title: "Start Trading", desc: "Trade, stake, and earn rewards" },
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
                <p className="text-muted-foreground mt-3 max-w-lg mx-auto">Spot, futures, or margin — trade however you want.</p>
              </div>
              <TradingModes />
            </div>
          </div>
        </section>

        {/* ═══ QUICK SWAP — Left-aligned with large text ═══ */}
        <section className="py-24 relative">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                <div>
                  <span className="section-badge">Instant</span>
                  <h2 className="mt-4 text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>
                    Swap tokens<br />
                    <span className="text-gradient">instantly.</span>
                  </h2>
                  <p className="text-muted-foreground mt-4 text-lg leading-relaxed max-w-md">
                    Cross-chain swaps with the best rates aggregated from multiple DEXs. Zero slippage on stablecoins.
                  </p>
                  <div className="mt-8 grid grid-cols-3 gap-4">
                    {[
                      { label: "Swap Fee", value: "0.1%" },
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

        {/* ═══ TOKENOMICS — Magazine-style split ═══ */}
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
                    { title: "Governance Rights", desc: "Vote on platform decisions", highlight: "DAO" },
                    { title: "Premium Features", desc: "Advanced trading tools", highlight: "Pro" },
                    { title: "Launchpad Access", desc: "Early access to new tokens", highlight: "IDO" },
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

        {/* ═══ COMPARISON — Horizontal card stack ═══ */}
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

        {/* ═══ SUPPORTED ASSETS — Compact pill grid ═══ */}
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

        {/* ═══ EARNING SECTION — Three dramatic cards ═══ */}
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
                  { title: "Staking", apr: "12.5%", desc: "Lock VNX and earn daily rewards with flexible or fixed terms", tag: "Popular", tagColor: "bg-primary/10 text-primary" },
                  { title: "LP Mining", apr: "18.2%", desc: "Provide liquidity to earn a share of trading fees", tag: "High Yield", tagColor: "bg-accent/10 text-accent" },
                  { title: "Yield Farm", apr: "24.8%", desc: "Automated DeFi strategies for maximum returns", tag: "Advanced", tagColor: "bg-[hsl(var(--vnx-gold))]/10 text-[hsl(var(--vnx-gold))]" },
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

        {/* ═══ GOVERNANCE ═══ */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/[0.02] to-transparent" />
          <div className="section-container relative">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-8">
                <div>
                  <span className="section-badge">DAO</span>
                  <h2 className="mt-4 text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>
                    Your voice<br />
                    <span className="text-gradient">matters.</span>
                  </h2>
                  <p className="text-muted-foreground mt-4 mb-8 max-w-md">Shape the future of VyronexVNX through community governance. Hold VNX to propose and vote.</p>
                  <div className="space-y-4">
                    {[
                      { step: "01", title: "Hold VNX", desc: "Stake tokens to gain voting power" },
                      { step: "02", title: "Propose", desc: "Submit platform improvement proposals" },
                      { step: "03", title: "Vote", desc: "Cast your vote on active proposals" },
                      { step: "04", title: "Execute", desc: "Approved changes are implemented" },
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
                      { title: "Launch NFT Marketplace", votes: "6,100", status: "Voting" },
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
                  { title: "REST API", desc: "Full-featured endpoints for trading and market data" },
                  { title: "WebSocket", desc: "Real-time streams with sub-millisecond latency" },
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
                  <code>{`// Fetch VNX price
const res = await fetch('https://api.vyronexvnx.com/v1/market/VNX-USDT');
const { price } = await res.json();
console.log(price); // 0.000542`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ═══ MOBILE APP — Reverse split ═══ */}
        <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-l from-primary/[0.04] to-transparent" />
          <div className="section-container relative">
            <div className="max-w-6xl mx-auto">
              <div className="grid lg:grid-cols-2 gap-16 items-center">
                {/* Phone mockup */}
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
                </div>

                {/* Text */}
                <div className="order-1 lg:order-2">
                  <span className="section-badge">Mobile</span>
                  <h2 className="mt-4 text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>
                    Trade from<br />
                    <span className="text-gradient">anywhere.</span>
                  </h2>
                  <p className="text-muted-foreground mt-4 mb-8 text-lg max-w-md leading-relaxed">
                    Access your portfolio and execute trades from any device with our mobile-optimized platform.
                  </p>
                  <div className="space-y-3 mb-8">
                    {[
                      "Real-time price alerts and notifications",
                      "Biometric authentication for secure access",
                      "One-tap trading with customizable shortcuts",
                      "Offline portfolio tracking and analytics",
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

        {/* ═══ TESTIMONIALS — Oversized quote style ═══ */}
        <section className="py-24 relative">
          <div className="section-container">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Testimonials</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Loved by <span className="text-gradient">traders.</span>
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  { name: "Alex Chen", role: "Day Trader", text: "Best multi-chain platform I've used. Lightning fast trades and great UI!" },
                  { name: "Sarah Johnson", role: "Crypto Investor", text: "The staking rewards are incredible. I've earned 15% more with VNX staking." },
                  { name: "Michael Rodriguez", role: "DeFi Enthusiast", text: "Finally a platform that supports all my favorite chains in one place!" },
                ].map((t, i) => (
                  <div key={i} className="p-8 rounded-3xl bg-card border border-border/40 shadow-card hover-border-glow transition-all">
                    <p className="text-lg font-medium leading-relaxed mb-8 text-foreground/90">"{t.text}"</p>
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

        {/* ═══ REFERRAL — Tiered horizontal ═══ */}
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

        {/* ═══ LAUNCHPAD ═══ */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.02] via-transparent to-transparent" />
          <div className="section-container relative">
            <div className="max-w-6xl mx-auto">
              <div className="mb-14">
                <span className="section-badge">IDO</span>
                <h2 className="mt-4 text-4xl md:text-5xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>
                  VNX <span className="text-gradient">Launchpad.</span>
                </h2>
                <p className="text-muted-foreground mt-3 max-w-md">Be early to the next big project — exclusive token launches for VNX holders.</p>
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

        {/* ═══ ROADMAP — Timeline vertical ═══ */}
        <section className="py-24 relative">
          <div className="section-container">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Vision</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Our <span className="text-gradient">roadmap.</span>
                </h2>
              </div>
              <div className="relative">
                {/* Vertical line */}
                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/40 via-primary/20 to-transparent" />
                <div className="space-y-8">
                  {[
                    { quarter: "Q4 2024", title: "Platform Launch", items: ["Multi-chain wallet", "VNX token launch", "Basic trading"], active: true },
                    { quarter: "Q1 2025", title: "DeFi Expansion", items: ["Staking pools", "Liquidity farming", "Governance"], active: true },
                    { quarter: "Q2 2025", title: "Advanced Trading", items: ["Margin trading", "Futures contracts", "Options"], active: false },
                    { quarter: "Q3 2025", title: "Enterprise", items: ["API access", "White-label", "Institutional"], active: false },
                  ].map((phase, i) => (
                    <div key={i} className={`relative flex items-start gap-8 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} flex-row`}>
                      {/* Dot */}
                      <div className="absolute left-6 md:left-1/2 -translate-x-1/2 top-2">
                        <div className={`h-3 w-3 rounded-full border-2 ${phase.active ? 'bg-primary border-primary shadow-glow' : 'bg-card border-border'}`} />
                      </div>
                      {/* Spacer for left side */}
                      <div className="hidden md:block md:w-1/2" />
                      {/* Card */}
                      <div className="ml-14 md:ml-0 md:w-1/2 p-6 rounded-2xl bg-card border border-border/40 shadow-card hover-border-glow transition-all">
                        <span className="text-xs font-bold text-primary">{phase.quarter}</span>
                        <h3 className="font-bold mt-1 mb-3" style={{ fontFamily: "'Space Grotesk'" }}>{phase.title}</h3>
                        <ul className="space-y-1.5">
                          {phase.items.map((item, j) => (
                            <li key={j} className="text-sm text-muted-foreground flex items-center gap-2">
                              <div className="h-1 w-1 rounded-full bg-primary/40 shrink-0" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
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
                <p className="text-muted-foreground mt-3">120+ countries. 24/7 uptime.</p>
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
                {["English", "中文", "Español", "العربية", "Français", "日本語"].map((lang, i) => (
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
                  { source: "CoinTelegraph", quote: "VyronexVNX is redefining multi-chain DeFi with its seamless user experience and robust security.", date: "Jan 2025" },
                  { source: "CryptoSlate", quote: "The VNX token has shown impressive utility in the crowded DeFi landscape.", date: "Dec 2024" },
                  { source: "The Block", quote: "With 50K+ active users, VyronexVNX is one to watch in the multi-chain DEX space.", date: "Nov 2024" },
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
                  { title: "DeFi Deep Dives", count: "12 Guides", desc: "Yield farming, liquidity, and more" },
                  { title: "Security Tips", count: "8 Resources", desc: "Protect your assets effectively" },
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

        {/* ═══ BADGES — Gamification strip ═══ */}
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

        {/* ═══ FAQ ═══ */}
        <section className="py-24 relative">
          <div className="section-container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">FAQ</span>
                <h2 className="mt-4" style={{ fontFamily: "'Space Grotesk'" }}>
                  Common <span className="text-gradient">questions.</span>
                </h2>
              </div>
              <div className="space-y-3">
                {[
                  { q: "What is VNX token?", a: "VNX is the native utility token used for trading fees, staking rewards, and governance." },
                  { q: "Which chains are supported?", a: "Ethereum, BNB Chain, Tron, Bitcoin, Fantom, and Solana." },
                  { q: "How do I start trading?", a: "Connect your wallet, deposit funds, and start trading with our intuitive interface." },
                  { q: "What are the trading fees?", a: "0.1% standard, with discounts for VNX holders." },
                  { q: "Is my money safe?", a: "Yes — cold storage, 2FA, AES-256 encryption, and $100M insurance fund." },
                  { q: "How do staking rewards work?", a: "Stake VNX to earn up to 12.5% APR. Rewards distributed daily." },
                ].map((faq, i) => (
                  <div key={i} className="p-6 rounded-2xl bg-card border border-border/40 hover-border-glow transition-all">
                    <h3 className="font-bold text-sm mb-2" style={{ fontFamily: "'Space Grotesk'" }}>{faq.q}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══ NEWSLETTER — Full-width dramatic CTA ═══ */}
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
                    Join 50,000+ traders. Get the latest updates and exclusive offers.
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
