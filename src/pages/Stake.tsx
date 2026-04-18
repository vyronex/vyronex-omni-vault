import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/StatsCard";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { useAuth } from "@/hooks/useAuth";
import { useWallets } from "@/hooks/useWallets";
import { useVNXPrice } from "@/hooks/useVNXPrice";
import {
  useStaking,
  STAKING_POOLS,
  calculateAccruedRewards,
  isUnlocked,
  type StakingRecord,
} from "@/hooks/useStaking";

const Stake = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { balances } = useWallets();
  const { data: vnxPrice } = useVNXPrice();
  const {
    records,
    activeStakes,
    totalStaked,
    totalAccruedRewards,
    isLoading,
    stake,
    claimRewards,
    unstake,
  } = useStaking();

  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeId, setUnstakeId] = useState<string>("");
  const [selectedPoolId, setSelectedPoolId] = useState(STAKING_POOLS[0].id);
  const [calcAmount, setCalcAmount] = useState("100000");
  const [calcPoolId, setCalcPoolId] = useState(STAKING_POOLS[1].id);

  // Tick every second so accrual numbers update live
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick(x => x + 1), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [authLoading, user, navigate]);

  const vnxBalance = Number(balances?.find(b => b.token_symbol === "VNX")?.balance ?? 0);
  const selectedPool = STAKING_POOLS.find(p => p.id === selectedPoolId) ?? STAKING_POOLS[0];
  const calcPool = STAKING_POOLS.find(p => p.id === calcPoolId) ?? STAKING_POOLS[0];
  const priceUsd = Number(vnxPrice?.price ?? 0);

  const calcEarnings = useMemo(() => {
    const amt = parseFloat(calcAmount);
    if (!isFinite(amt) || amt <= 0) return 0;
    const days = calcPool.lockup_days || 365;
    return amt * (calcPool.apr / 100) * (days / 365);
  }, [calcAmount, calcPool]);

  const handleStake = async () => {
    const amt = parseFloat(stakeAmount);
    if (!isFinite(amt) || amt <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    try {
      await stake.mutateAsync({
        amount: amt,
        lock_period_days: selectedPool.lockup_days,
        apr: selectedPool.apr,
      });
      setStakeAmount("");
    } catch { /* handled */ }
  };

  const unstakeRecord = activeStakes.find(r => r.id === unstakeId);

  const handleUnstake = async () => {
    if (!unstakeId) {
      toast.error("Select a stake to unstake");
      return;
    }
    try {
      await unstake.mutateAsync(unstakeId);
      setUnstakeId("");
    } catch { /* handled */ }
  };

  const formatTimeLeft = (endDate: string | null): string => {
    if (!endDate) return "Flexible";
    const ms = new Date(endDate).getTime() - Date.now();
    if (ms <= 0) return "Unlocked";
    const days = Math.floor(ms / (24 * 60 * 60 * 1000));
    const hours = Math.floor((ms % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    if (days > 0) return `${days}d ${hours}h`;
    const mins = Math.floor((ms % (60 * 60 * 1000)) / (60 * 1000));
    return `${hours}h ${mins}m`;
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Page Header */}
        <section className="page-header">
          <div className="absolute inset-0 gradient-hero" />
          <div className="page-header-content">
            <div className="max-w-6xl mx-auto animate-slide-up">
              <span className="section-badge">Earn</span>
              <h1 className="page-title">
                Stake <span className="text-gradient">VNX</span>
              </h1>
              <p className="page-subtitle">Lock VNX, earn continuously, claim or unstake anytime after the lockup</p>
            </div>
          </div>
        </section>

        <div className="section-container py-8">
          <div className="max-w-6xl mx-auto">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {[
                { label: "Available VNX", value: vnxBalance.toLocaleString(undefined, { maximumFractionDigits: 2 }), change: "Wallet balance" },
                { label: "Total Staked", value: totalStaked.toLocaleString(undefined, { maximumFractionDigits: 2 }), change: `${activeStakes.length} active` },
                { label: "Pending Rewards", value: totalAccruedRewards.toFixed(4), change: "VNX accrued" },
                { label: "Est. Value (USD)", value: priceUsd > 0 ? `$${(totalStaked * priceUsd).toFixed(2)}` : "—", change: "At current price" },
              ].map((stat, i) => (
                <div key={i} className={`animate-slide-up stagger-${i + 1}`}>
                  <StatsCard label={stat.label} value={stat.value} change={stat.change} />
                </div>
              ))}
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Stake / Unstake */}
              <div className="card-modern animate-slide-up stagger-2">
                <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Stake / Unstake</h2>
                <Tabs defaultValue="stake">
                  <TabsList className="grid w-full grid-cols-2 rounded-xl">
                    <TabsTrigger value="stake" className="rounded-lg">Stake</TabsTrigger>
                    <TabsTrigger value="unstake" className="rounded-lg">Unstake</TabsTrigger>
                  </TabsList>

                  {/* STAKE */}
                  <TabsContent value="stake" className="space-y-4 mt-5">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Lock period</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {STAKING_POOLS.map(pool => (
                          <button
                            key={pool.id}
                            type="button"
                            onClick={() => setSelectedPoolId(pool.id)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              selectedPoolId === pool.id
                                ? "border-primary bg-primary/10 shadow-soft"
                                : "border-border/40 hover:border-primary/40"
                            }`}
                          >
                            <p className="text-xs text-muted-foreground">{pool.lockup_label}</p>
                            <p className="font-bold text-[hsl(var(--vnx-green))] mt-0.5">{pool.apr}% APR</p>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="stake-amount" className="text-xs uppercase tracking-wider text-muted-foreground">Amount</Label>
                      <Input
                        id="stake-amount" type="number" placeholder="0.00"
                        value={stakeAmount} onChange={(e) => setStakeAmount(e.target.value)}
                        className="mt-2 rounded-xl h-12 text-lg font-mono"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-muted-foreground">
                          Available: <span className="font-mono font-semibold">{vnxBalance.toFixed(4)}</span> VNX
                        </p>
                        <div className="flex gap-1">
                          {[0.25, 0.5, 1].map(pct => (
                            <button
                              key={pct} type="button"
                              onClick={() => setStakeAmount((vnxBalance * pct).toFixed(4))}
                              className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-muted/30 hover:bg-primary/20 hover:text-primary transition-colors"
                            >
                              {pct === 1 ? "MAX" : `${pct * 100}%`}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {stakeAmount && parseFloat(stakeAmount) > 0 && (
                      <div className="p-3 rounded-xl bg-muted/30 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Est. annual rewards</span>
                          <span className="font-mono font-semibold">
                            {(parseFloat(stakeAmount) * selectedPool.apr / 100).toFixed(4)} VNX
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Unlock date</span>
                          <span className="font-semibold">
                            {selectedPool.lockup_days === 0
                              ? "Anytime"
                              : new Date(Date.now() + selectedPool.lockup_days * 86400000).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleStake}
                      disabled={stake.isPending}
                      className="w-full rounded-xl gradient-primary shadow-glow hover:shadow-glow-lg active-press h-12 transition-all"
                    >
                      {stake.isPending ? "Staking..." : `Stake ${selectedPool.lockup_label}`}
                    </Button>
                  </TabsContent>

                  {/* UNSTAKE */}
                  <TabsContent value="unstake" className="space-y-4 mt-5">
                    <div>
                      <Label className="text-xs uppercase tracking-wider text-muted-foreground">Select stake</Label>
                      {activeStakes.length === 0 ? (
                        <p className="mt-3 text-sm text-muted-foreground p-4 rounded-xl bg-muted/20 text-center">
                          No active stakes
                        </p>
                      ) : (
                        <div className="mt-2 space-y-2 max-h-64 overflow-y-auto">
                          {activeStakes.map(rec => {
                            const unlocked = isUnlocked(rec);
                            return (
                              <button
                                key={rec.id} type="button"
                                onClick={() => setUnstakeId(rec.id)}
                                className={`w-full p-3 rounded-xl border text-left transition-all ${
                                  unstakeId === rec.id
                                    ? "border-primary bg-primary/10"
                                    : "border-border/40 hover:border-primary/40"
                                }`}
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-semibold font-mono">{Number(rec.amount).toFixed(2)} VNX</p>
                                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                                      {rec.apr}% APR · {rec.lock_period_days === 0 ? "Flexible" : `${rec.lock_period_days}d`}
                                    </p>
                                  </div>
                                  <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                                    unlocked
                                      ? "bg-[hsl(var(--vnx-green))]/15 text-[hsl(var(--vnx-green))] border-[hsl(var(--vnx-green))]/30"
                                      : "bg-[hsl(var(--vnx-gold))]/15 text-[hsl(var(--vnx-gold))] border-[hsl(var(--vnx-gold))]/30"
                                  }`}>
                                    {unlocked ? "Unlocked" : formatTimeLeft(rec.end_date)}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {unstakeRecord && (
                      <div className="p-3 rounded-xl bg-muted/30 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Principal</span>
                          <span className="font-mono font-semibold">{Number(unstakeRecord.amount).toFixed(4)} VNX</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Accrued rewards</span>
                          <span className="font-mono font-semibold text-[hsl(var(--vnx-green))]">
                            {calculateAccruedRewards(unstakeRecord).toFixed(4)} VNX
                          </span>
                        </div>
                      </div>
                    )}

                    <Button
                      onClick={handleUnstake}
                      disabled={unstake.isPending || !unstakeId}
                      variant="outline"
                      className="w-full rounded-xl active-press h-12"
                    >
                      {unstake.isPending ? "Processing..." : "Unstake & Withdraw"}
                    </Button>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Rewards summary */}
              <div className="card-modern animate-slide-up stagger-3">
                <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Live Rewards</h2>
                <div className="text-center p-6 rounded-2xl gradient-primary shadow-glow mb-5">
                  <p className="text-primary-foreground/80 text-xs uppercase tracking-wider mb-2">Total Pending</p>
                  <p className="text-4xl font-bold text-primary-foreground font-mono" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                    {totalAccruedRewards.toFixed(4)}
                  </p>
                  <p className="text-primary-foreground/80 text-xs mt-1">VNX</p>
                  {priceUsd > 0 && (
                    <p className="text-primary-foreground/70 text-xs mt-2">
                      ≈ ${(totalAccruedRewards * priceUsd).toFixed(4)}
                    </p>
                  )}
                </div>

                {activeStakes.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    No active stakes — start earning by staking VNX
                  </p>
                ) : (
                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {activeStakes.map(rec => {
                      const accrued = calculateAccruedRewards(rec);
                      const previously = Number(rec.rewards_earned ?? 0);
                      const claimable = accrued - previously;
                      return (
                        <div key={rec.id} className="data-row">
                          <div>
                            <p className="font-semibold text-sm font-mono">{Number(rec.amount).toFixed(2)} VNX</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground mt-0.5">
                              {rec.apr}% APR
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="font-mono font-semibold text-[hsl(var(--vnx-green))] text-sm">
                                +{accrued.toFixed(4)}
                              </p>
                              <p className="text-[10px] text-muted-foreground">pending</p>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={claimRewards.isPending || claimable < 0.0001}
                              onClick={() => claimRewards.mutate(rec.id)}
                              className="h-8 text-xs"
                            >
                              Claim
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Active Stakes Detail */}
            <div className="data-card mb-8 animate-slide-up stagger-4">
              <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Active Stakes</h2>
              {isLoading ? (
                <div className="space-y-2">
                  {[...Array(3)].map((_, i) => <div key={i} className="h-14 rounded-xl bg-muted/20 animate-pulse" />)}
                </div>
              ) : activeStakes.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No active stakes yet</p>
              ) : (
                <div className="space-y-3">
                  {activeStakes.map(rec => {
                    const unlocked = isUnlocked(rec);
                    const accrued = calculateAccruedRewards(rec);
                    return (
                      <div key={rec.id} className="data-row">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold font-mono">{Number(rec.amount).toFixed(2)} VNX</p>
                            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-muted/40">
                              {rec.apr}% APR
                            </span>
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                              unlocked
                                ? "bg-[hsl(var(--vnx-green))]/15 text-[hsl(var(--vnx-green))] border-[hsl(var(--vnx-green))]/30"
                                : "bg-[hsl(var(--vnx-gold))]/15 text-[hsl(var(--vnx-gold))] border-[hsl(var(--vnx-gold))]/30"
                            }`}>
                              {unlocked ? "Unlocked" : formatTimeLeft(rec.end_date)}
                            </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            Started {rec.start_date ? new Date(rec.start_date).toLocaleDateString() : "—"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-semibold text-[hsl(var(--vnx-green))] text-sm">
                            +{accrued.toFixed(4)} VNX
                          </p>
                          <p className="text-[10px] text-muted-foreground">accrued</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* How It Works */}
            <div className="mb-8 animate-slide-up stagger-5">
              <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                How It <span className="text-gradient">Works</span>
              </h2>
              <div className="grid md:grid-cols-3 gap-5">
                {[
                  { step: "01", title: "Choose a Pool", desc: "Pick flexible or locked staking — longer locks earn higher APR." },
                  { step: "02", title: "Earn Continuously", desc: "Rewards accrue every second based on your stake's APR." },
                  { step: "03", title: "Claim or Unstake", desc: "Claim rewards anytime; unstake principal once the lock ends." },
                ].map((item, i) => (
                  <div key={i} className="card-modern text-center">
                    <div className="text-3xl font-bold text-primary/15 mb-2" style={{ fontFamily: "'Space Grotesk', system-ui" }}>{item.step}</div>
                    <h3 className="font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Pools */}
            <div className="mb-8 animate-slide-up stagger-6">
              <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                Staking <span className="text-gradient">Pools</span>
              </h2>
              <div className="grid md:grid-cols-2 gap-5">
                {STAKING_POOLS.map(pool => (
                  <div key={pool.id} className="card-modern">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold">{pool.name}</h3>
                      <button
                        onClick={() => setSelectedPoolId(pool.id)}
                        className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                      >
                        Select
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">APR</p>
                        <p className="font-bold text-[hsl(var(--vnx-green))] mt-1">{pool.apr}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Lock-up</p>
                        <p className="font-semibold mt-1">{pool.lockup_label}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Calculator */}
            <div className="card-modern mb-8 animate-slide-up">
              <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Earnings Calculator</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Amount</Label>
                    <Input
                      type="number" placeholder="100000"
                      value={calcAmount} onChange={(e) => setCalcAmount(e.target.value)}
                      className="mt-2 rounded-xl h-12 font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider text-muted-foreground">Pool</Label>
                    <select
                      value={calcPoolId}
                      onChange={(e) => setCalcPoolId(e.target.value)}
                      className="w-full mt-2 px-4 py-3 rounded-xl bg-background border border-border/40 text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                    >
                      {STAKING_POOLS.map(p => (
                        <option key={p.id} value={p.id}>{p.lockup_label} ({p.apr}% APR)</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="p-6 rounded-2xl gradient-primary shadow-glow flex flex-col justify-center">
                  <p className="text-primary-foreground/80 text-xs uppercase tracking-wider mb-1">Estimated Earnings</p>
                  <p className="text-4xl font-bold text-primary-foreground font-mono" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                    {calcEarnings.toFixed(2)} VNX
                  </p>
                  {priceUsd > 0 && (
                    <p className="text-sm text-primary-foreground/80 mt-2">
                      ≈ ${(calcEarnings * priceUsd).toFixed(4)} at current price
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* History */}
            <div className="data-card animate-slide-up">
              <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Staking History</h2>
              {records.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No staking history yet</p>
              ) : (
                <div className="space-y-3">
                  {records.map((rec: StakingRecord) => (
                    <div key={rec.id} className="data-row">
                      <div>
                        <p className="font-semibold text-sm font-mono">
                          {Number(rec.amount).toFixed(2)} VNX
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {rec.created_at ? new Date(rec.created_at).toLocaleString() : "—"} · {rec.lock_period_days === 0 ? "Flexible" : `${rec.lock_period_days}d`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-semibold text-[hsl(var(--vnx-green))] text-sm">
                          +{Number(rec.rewards_earned ?? 0).toFixed(4)} VNX
                        </p>
                        <span className={`inline-block mt-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                          rec.status === "active"
                            ? "bg-[hsl(var(--vnx-green))]/15 text-[hsl(var(--vnx-green))] border-[hsl(var(--vnx-green))]/30"
                            : "bg-muted/30 text-muted-foreground border-border/40"
                        }`}>
                          {rec.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Stake;
