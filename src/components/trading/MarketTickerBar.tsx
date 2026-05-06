import { useCoinDetail } from "@/hooks/useCoinGecko";
import { motion } from "framer-motion";

interface MarketTickerBarProps {
  coinId: string;
  baseToken: string;
  quoteToken: string;
}

const MarketTickerBar = ({ coinId, baseToken, quoteToken }: MarketTickerBarProps) => {
  const { data: coin } = useCoinDetail(coinId);
  const md = coin?.market_data;

  const price = md?.current_price?.usd ?? 0;
  const change24h = md?.price_change_percentage_24h ?? 0;
  const high24h = md?.high_24h?.usd ?? 0;
  const low24h = md?.low_24h?.usd ?? 0;
  const vol24h = md?.total_volume?.usd ?? 0;
  const marketCap = md?.market_cap?.usd ?? 0;
  const isPositive = change24h >= 0;

  const fmt = (v: number) => {
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
    if (v >= 1) return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    return `$${v.toPrecision(4)}`;
  };

  const stats = [
    { label: "Last Price", value: fmt(price), highlight: true, color: isPositive ? "text-[hsl(var(--vnx-green))]" : "text-destructive" },
    { label: "24h Change", value: `${isPositive ? "+" : ""}${change24h.toFixed(2)}%`, color: isPositive ? "text-[hsl(var(--vnx-green))]" : "text-destructive" },
    { label: "24h High", value: fmt(high24h) },
    { label: "24h Low", value: fmt(low24h) },
    { label: "24h Volume", value: fmt(vol24h) },
    { label: "Market Cap", value: fmt(marketCap) },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 overflow-x-auto scrollbar-none py-2 px-3 rounded-xl bg-card border border-border/40"
    >
      <div className="flex items-center gap-2 pr-4 border-r border-border/40 mr-2 shrink-0">
        <span className="text-base font-bold" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
          {baseToken}/{quoteToken}
        </span>
      </div>
      {stats.map((s, i) => (
        <div key={i} className="flex flex-col px-3 shrink-0">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground whitespace-nowrap">{s.label}</span>
          <span className={`text-xs font-mono font-bold whitespace-nowrap ${s.color || "text-foreground"}`}>
            {s.value}
          </span>
        </div>
      ))}
    </motion.div>
  );
};

export default MarketTickerBar;
