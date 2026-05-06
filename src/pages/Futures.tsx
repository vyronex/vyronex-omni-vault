import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { useDerivatives, useDerivativesExchanges } from "@/hooks/useCoinGecko";
import PageTransition from "@/components/PageTransition";
import OpenOrdersPanel from "@/components/OpenOrdersPanel";
import { useTradeNotifications } from "@/hooks/useTradeNotifications";
import { useAuth } from "@/hooks/useAuth";
import { Slider } from "@/components/ui/slider";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

const LEVERAGE_OPTIONS = [1, 2, 3, 5, 10, 20, 50, 75, 100, 125];

const Futures = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  useTradeNotifications();
  const { data: derivatives, isLoading } = useDerivatives();
  const { data: exchanges } = useDerivativesExchanges();
  const [leverage, setLeverage] = useState(10);
  const [positionSide, setPositionSide] = useState<"long" | "short">("long");
  const [marginMode, setMarginMode] = useState<"cross" | "isolated">("cross");
  const [entryPrice, setEntryPrice] = useState("");
  const [posSize, setPosSize] = useState("");
  const [selectedContract, setSelectedContract] = useState<any>(null);

  // Liquidation calculator
  const calcLiquidation = () => {
    const entry = parseFloat(entryPrice);
    const size = parseFloat(posSize);
    if (!isFinite(entry) || !isFinite(size) || entry <= 0) return null;
    const margin = (entry * size) / leverage;
    const maintenanceRate = 0.004; // 0.4% maintenance margin
    if (positionSide === "long") {
      return entry * (1 - (1 / leverage) + maintenanceRate);
    }
    return entry * (1 + (1 / leverage) - maintenanceRate);
  };

  const liqPrice = calcLiquidation();

  // Funding countdown
  const now = new Date();
  const nextFunding = new Date(now);
  const currentHour = now.getUTCHours();
  const nextFundingHour = currentHour < 8 ? 8 : currentHour < 16 ? 16 : 24;
  nextFunding.setUTCHours(nextFundingHour === 24 ? 0 : nextFundingHour, 0, 0, 0);
  if (nextFundingHour === 24) nextFunding.setUTCDate(nextFunding.getUTCDate() + 1);
  const fundingDiff = nextFunding.getTime() - now.getTime();
  const fundingH = Math.floor(fundingDiff / 3600000);
  const fundingM = Math.floor((fundingDiff % 3600000) / 60000);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Header */}
        <section className="page-header">
          <div className="absolute inset-0 gradient-hero" />
          <div className="page-header-content">
            <div className="max-w-7xl mx-auto animate-slide-up">
              <span className="section-badge">Derivatives</span>
              <h1 className="page-title">
                Futures & <span className="text-gradient">Margin</span> Trading
              </h1>
              <p className="page-subtitle">
                Up to 125x leverage · Perpetual & quarterly contracts · Institutional-grade risk engine
              </p>
            </div>
          </div>
        </section>

        <div className="section-container py-6">
          <div className="max-w-7xl mx-auto">

            {/* Trading Controls Panel */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 mb-8 animate-slide-up stagger-1">
              {/* Margin & Leverage */}
              <div className="lg:col-span-4 card-modern space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                  Margin & Leverage
                </h3>

                {/* Margin mode */}
                <div className="flex gap-2">
                  {(["cross", "isolated"] as const).map(m => (
                    <button
                      key={m}
                      onClick={() => setMarginMode(m)}
                      className={`flex-1 text-[10px] uppercase tracking-wider font-bold py-2 rounded-lg border transition-all ${
                        marginMode === m
                          ? "bg-primary/15 text-primary border-primary/30"
                          : "bg-muted/10 text-muted-foreground border-border/30"
                      }`}
                    >
                      {m} margin
                    </button>
                  ))}
                </div>

                {/* Leverage slider */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider">Leverage</Label>
                    <span className="text-lg font-bold font-mono text-primary">{leverage}x</span>
                  </div>
                  <Slider
                    value={[leverage]}
                    onValueChange={(v) => setLeverage(v[0])}
                    min={1}
                    max={125}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {LEVERAGE_OPTIONS.map(l => (
                      <button
                        key={l}
                        onClick={() => setLeverage(l)}
                        className={`text-[9px] font-bold px-2 py-1 rounded border transition-all ${
                          leverage === l
                            ? "bg-primary/15 text-primary border-primary/30"
                            : "bg-muted/10 text-muted-foreground border-border/30"
                        }`}
                      >
                        {l}x
                      </button>
                    ))}
                  </div>
                </div>

                {/* Position side */}
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setPositionSide("long")}
                    className={`h-10 text-xs font-bold ${
                      positionSide === "long"
                        ? "bg-[hsl(var(--vnx-green))]/15 text-[hsl(var(--vnx-green))] border-[hsl(var(--vnx-green))]/40"
                        : ""
                    }`}
                  >
                    LONG
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setPositionSide("short")}
                    className={`h-10 text-xs font-bold ${
                      positionSide === "short"
                        ? "bg-destructive/15 text-destructive border-destructive/40"
                        : ""
                    }`}
                  >
                    SHORT
                  </Button>
                </div>
              </div>

              {/* Liquidation Calculator */}
              <div className="lg:col-span-4 card-modern space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                  Liquidation Calculator
                </h3>

                <div>
                  <Label className="text-[10px] text-muted-foreground mb-1 block uppercase tracking-wider">Entry Price (USD)</Label>
                  <Input
                    type="number" placeholder="e.g. 68000"
                    value={entryPrice} onChange={(e) => setEntryPrice(e.target.value)}
                    className="font-mono h-9 text-sm bg-muted/10"
                  />
                </div>

                <div>
                  <Label className="text-[10px] text-muted-foreground mb-1 block uppercase tracking-wider">Position Size</Label>
                  <Input
                    type="number" placeholder="e.g. 0.5"
                    value={posSize} onChange={(e) => setPosSize(e.target.value)}
                    className="font-mono h-9 text-sm bg-muted/10"
                  />
                </div>

                <div className="p-3 rounded-lg bg-muted/10 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Leverage</span>
                    <span className="font-mono font-bold">{leverage}x</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Direction</span>
                    <span className={`font-bold ${positionSide === "long" ? "text-[hsl(var(--vnx-green))]" : "text-destructive"}`}>
                      {positionSide.toUpperCase()}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">Margin Required</span>
                    <span className="font-mono font-bold">
                      {entryPrice && posSize
                        ? `$${((parseFloat(entryPrice) * parseFloat(posSize)) / leverage).toFixed(2)}`
                        : "—"
                      }
                    </span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-border/30 pt-2">
                    <span className="text-muted-foreground">Est. Liquidation</span>
                    <span className="font-mono font-bold text-destructive">
                      {liqPrice ? `$${liqPrice.toFixed(2)}` : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Funding & Stats */}
              <div className="lg:col-span-4 card-modern space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                  Market Overview
                </h3>

                {/* Funding countdown */}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                  <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-1">Next Funding</p>
                  <p className="text-xl font-bold font-mono text-primary">
                    {String(fundingH).padStart(2, "0")}:{String(fundingM).padStart(2, "0")}
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-1">Funding every 8h (00:00, 08:00, 16:00 UTC)</p>
                </div>

                {/* Quick stats from top derivative */}
                {derivatives && derivatives.length > 0 && (
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { label: "BTC Perp", value: `$${Number(derivatives[0]?.price || 0).toLocaleString()}`, sub: derivatives[0]?.funding_rate ? `FR: ${Number(derivatives[0].funding_rate).toFixed(4)}%` : "" },
                      { label: "ETH Perp", value: `$${Number(derivatives.find((d: any) => d.symbol?.includes("ETH"))?.price || 0).toLocaleString()}`, sub: "" },
                      { label: "24h Volume", value: derivatives[0]?.volume_24h ? `$${(Number(derivatives[0].volume_24h) / 1e9).toFixed(2)}B` : "—" },
                      { label: "Open Interest", value: derivatives[0]?.open_interest ? `$${(Number(derivatives[0].open_interest) / 1e9).toFixed(2)}B` : "—" },
                    ].map((s, i) => (
                      <div key={i} className="p-2.5 rounded-lg bg-muted/20">
                        <p className="text-[9px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
                        <p className="text-sm font-bold font-mono">{s.value}</p>
                        {s.sub && <p className="text-[9px] text-muted-foreground">{s.sub}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Exchanges */}
            {exchanges && exchanges.length > 0 && (
              <div className="mb-8 animate-slide-up stagger-2">
                <h2 className="text-xl font-bold mb-4" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                  Top <span className="text-gradient">Exchanges</span>
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {exchanges.slice(0, 10).map((ex: any) => (
                    <Card key={ex.id} className="card-modern !p-3 text-center">
                      <CardContent className="p-0">
                        {ex.image && <img src={ex.image} alt={ex.name} className="w-8 h-8 rounded-full mx-auto mb-1.5" />}
                        <p className="font-semibold text-xs">{ex.name}</p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          OI: ${((ex.open_interest_btc || 0) * 69000 / 1e9).toFixed(2)}B
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          Vol: {(ex.trade_volume_24h_btc || 0).toLocaleString()} BTC
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Perpetual Contracts Table */}
            <div className="rounded-2xl bg-card border border-border/40 shadow-elevated overflow-hidden animate-slide-up stagger-3">
              <div className="p-4 border-b border-border/40 flex items-center justify-between">
                <h2 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                  Perpetual & <span className="text-gradient">Futures</span> Contracts
                </h2>
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--vnx-green))] animate-pulse" />
                  Live Feed
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="table-modern">
                  <thead>
                    <tr>
                      <th>Market</th>
                      <th>Symbol</th>
                      <th>Last Price</th>
                      <th>24h %</th>
                      <th className="hidden md:table-cell">Index</th>
                      <th className="hidden md:table-cell">Basis</th>
                      <th className="hidden lg:table-cell">Spread</th>
                      <th className="hidden lg:table-cell">Funding</th>
                      <th className="hidden xl:table-cell">OI</th>
                      <th className="hidden xl:table-cell">24h Vol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr><td colSpan={10} className="p-12 text-center">
                        <div className="h-6 w-6 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                      </td></tr>
                    ) : !derivatives || derivatives.length === 0 ? (
                      <tr><td colSpan={10} className="p-12 text-center text-muted-foreground">No data</td></tr>
                    ) : (
                      derivatives.slice(0, 50).map((d: any, i: number) => {
                        const pct = d.price_percentage_change_24h;
                        const isPos = (pct || 0) >= 0;
                        return (
                          <tr
                            key={i}
                            className="animate-fade-in cursor-pointer hover:bg-muted/10"
                            style={{ animationDelay: `${i * 15}ms`, animationFillMode: "both" }}
                            onClick={() => setSelectedContract(d)}
                          >
                            <td className="text-xs font-semibold">{d.market || "—"}</td>
                            <td className="text-xs font-mono">{d.symbol || "—"}</td>
                            <td className="text-xs font-mono font-bold">${Number(d.price || 0).toLocaleString()}</td>
                            <td>
                              <span className={`text-xs font-bold ${isPos ? "text-[hsl(var(--vnx-green))]" : "text-destructive"}`}>
                                {isPos ? "+" : ""}{Math.abs(pct || 0).toFixed(2)}%
                              </span>
                            </td>
                            <td className="hidden md:table-cell text-xs text-muted-foreground font-mono">
                              ${Number(d.index || 0).toLocaleString()}
                            </td>
                            <td className="hidden md:table-cell text-xs text-muted-foreground font-mono">
                              {d.basis != null ? `${Number(d.basis).toFixed(4)}%` : "—"}
                            </td>
                            <td className="hidden lg:table-cell text-xs text-muted-foreground font-mono">
                              {d.spread != null ? `${Number(d.spread).toFixed(4)}%` : "—"}
                            </td>
                            <td className="hidden lg:table-cell text-xs font-mono">
                              <span className={`${Number(d.funding_rate || 0) >= 0 ? "text-[hsl(var(--vnx-green))]" : "text-destructive"}`}>
                                {d.funding_rate != null ? `${Number(d.funding_rate).toFixed(4)}%` : "—"}
                              </span>
                            </td>
                            <td className="hidden xl:table-cell text-xs text-muted-foreground font-mono">
                              {d.open_interest ? `$${(Number(d.open_interest) / 1e6).toFixed(1)}M` : "—"}
                            </td>
                            <td className="hidden xl:table-cell text-xs text-muted-foreground font-mono">
                              {d.volume_24h ? `$${(Number(d.volume_24h) / 1e6).toFixed(1)}M` : "—"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Positions / Open Orders */}
            {user && (
              <div className="mt-6 animate-slide-up stagger-4">
                <div className="rounded-2xl bg-card border border-border/40 shadow-card overflow-hidden">
                  <div className="p-4 border-b border-border/40">
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                      Open Positions & Orders
                    </h3>
                  </div>
                  <div className="p-4">
                    <OpenOrdersPanel />
                  </div>
                </div>
              </div>
            )}

            {/* Risk Warning */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-xs text-muted-foreground"
            >
              <span className="font-bold text-destructive mr-1">RISK WARNING:</span>
              Futures and margin trading involves substantial risk of loss and is not suitable for every investor. Leverage amplifies both gains and losses. 
              Only trade with funds you can afford to lose. Past performance does not guarantee future results.
            </motion.div>
          </div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Futures;
