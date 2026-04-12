import { useParams, useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PriceChart from "@/components/PriceChart";
import { useCoinDetail } from "@/hooks/useCoinGecko";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

const fmt = (n: number | undefined | null, decimals = 2) => {
  if (n == null) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(decimals)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(decimals)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(decimals)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(decimals)}K`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 6 })}`;
};

const StatBlock = ({ label, value, sub }: { label: string; value: string; sub?: string }) => (
  <div className="p-5 rounded-2xl bg-card border border-border/40 shadow-card hover-border-glow transition-all">
    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">{label}</p>
    <p className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk'" }}>{value}</p>
    {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
  </div>
);

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.05 } } };

const CoinDetail = () => {
  const { coinId } = useParams<{ coinId: string }>();
  const navigate = useNavigate();
  const { data: coin, isLoading } = useCoinDetail(coinId || "");

  if (isLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="section-container py-12 max-w-6xl mx-auto space-y-6">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-[300px] w-full rounded-2xl" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  if (!coin || coin.error) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="section-container py-24 text-center">
            <h1 className="text-3xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>Coin not found</h1>
            <Button onClick={() => navigate("/markets")} variant="outline" className="rounded-xl active-press">
              Back to Markets
            </Button>
          </div>
        </div>
      </PageTransition>
    );
  }

  const md = coin.market_data;
  const pct24h = md?.price_change_percentage_24h;
  const isPositive = (pct24h || 0) >= 0;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Header */}
        <section className="py-8 border-b border-border/30">
          <div className="section-container max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <button onClick={() => navigate("/markets")} className="text-muted-foreground hover:text-foreground transition-colors text-sm">
                  Markets /
                </button>
                <img src={coin.image?.large || coin.image?.small} alt={coin.name} className="w-10 h-10 rounded-full" />
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>{coin.name}</h1>
                    <span className="text-sm text-muted-foreground uppercase">{coin.symbol}</span>
                    {coin.market_cap_rank && (
                      <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                        #{coin.market_cap_rank}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-2xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>{fmt(md?.current_price?.usd)}</span>
                    {pct24h != null && (
                      <span className={`text-sm font-bold px-2.5 py-0.5 rounded-full ${isPositive ? 'bg-[hsl(var(--vnx-green))]/10 text-[hsl(var(--vnx-green))]' : 'bg-destructive/10 text-destructive'}`}>
                        {isPositive ? '+' : ''}{pct24h.toFixed(2)}%
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {coin.links?.homepage?.[0] && (
                  <Button variant="outline" size="sm" className="rounded-xl" asChild>
                    <a href={coin.links.homepage[0]} target="_blank" rel="noopener noreferrer">Website</a>
                  </Button>
                )}
                {coin.links?.blockchain_site?.[0] && (
                  <Button variant="outline" size="sm" className="rounded-xl" asChild>
                    <a href={coin.links.blockchain_site[0]} target="_blank" rel="noopener noreferrer">Explorer</a>
                  </Button>
                )}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Chart */}
        <section className="py-8">
          <div className="section-container max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
              <PriceChart coinId={coinId || ""} coinName={coin.name} />
            </motion.div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-8">
          <div className="section-container max-w-6xl mx-auto">
            <motion.div initial="hidden" animate="visible" variants={stagger} className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Market Cap", value: fmt(md?.market_cap?.usd) },
                { label: "24h Volume", value: fmt(md?.total_volume?.usd) },
                { label: "Circulating", value: md?.circulating_supply ? `${(md.circulating_supply / 1e6).toFixed(2)}M` : "—", sub: coin.symbol?.toUpperCase() },
                { label: "Total Supply", value: md?.total_supply ? `${(md.total_supply / 1e6).toFixed(2)}M` : "∞" },
                { label: "24h High", value: fmt(md?.high_24h?.usd) },
                { label: "24h Low", value: fmt(md?.low_24h?.usd) },
                { label: "ATH", value: fmt(md?.ath?.usd), sub: md?.ath_date?.usd ? new Date(md.ath_date.usd).toLocaleDateString() : undefined },
                { label: "ATL", value: fmt(md?.atl?.usd), sub: md?.atl_date?.usd ? new Date(md.atl_date.usd).toLocaleDateString() : undefined },
              ].map((s, i) => (
                <motion.div key={s.label} variants={fadeUp} custom={i}>
                  <StatBlock label={s.label} value={s.value} sub={s.sub} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Price Changes */}
        <section className="py-8">
          <div className="section-container max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="p-6 rounded-2xl bg-card border border-border/40 shadow-card"
            >
              <h3 className="font-bold mb-5" style={{ fontFamily: "'Space Grotesk'" }}>Price Change</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                {[
                  { label: "1h", val: md?.price_change_percentage_1h_in_currency?.usd },
                  { label: "24h", val: md?.price_change_percentage_24h },
                  { label: "7d", val: md?.price_change_percentage_7d },
                  { label: "30d", val: md?.price_change_percentage_30d },
                  { label: "1y", val: md?.price_change_percentage_1y },
                ].map(({ label, val }) => (
                  <div key={label} className="text-center p-4 rounded-xl bg-background border border-border/30">
                    <p className="text-xs text-muted-foreground mb-1">{label}</p>
                    {val != null ? (
                      <p className={`font-bold ${val >= 0 ? 'text-[hsl(var(--vnx-green))]' : 'text-destructive'}`}>
                        {val >= 0 ? "+" : ""}{val.toFixed(2)}%
                      </p>
                    ) : (
                      <p className="text-muted-foreground">—</p>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Description */}
        {coin.description?.en && (
          <section className="py-8 pb-16">
            <div className="section-container max-w-6xl mx-auto">
              <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                className="p-6 rounded-2xl bg-card border border-border/40 shadow-card"
              >
                <h3 className="font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>About {coin.name}</h3>
                <div
                  className="prose prose-sm max-w-none text-muted-foreground leading-relaxed [&_a]:text-primary [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: coin.description.en.split(". ").slice(0, 8).join(". ") + "." }}
                />
              </motion.div>
            </div>
          </section>
        )}

        <Footer />
      </div>
    </PageTransition>
  );
};

export default CoinDetail;
