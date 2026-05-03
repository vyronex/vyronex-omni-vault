import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useVault, type VaultDeposit } from "@/hooks/useVault";
import type { ChainPrices } from "@/hooks/useChainPrices";

interface VaultPanelProps {
  prices?: ChainPrices;
}

const RISK_COLOR: Record<string, string> = {
  "Stable Vault": "text-[hsl(var(--vnx-green))]",
  "Growth Vault": "text-[hsl(var(--vnx-gold))]",
  "High-Yield Vault": "text-primary",
};

const RISK_BG: Record<string, string> = {
  "Stable Vault": "bg-[hsl(var(--vnx-green))]/10 border-[hsl(var(--vnx-green))]/30",
  "Growth Vault": "bg-[hsl(var(--vnx-gold))]/10 border-[hsl(var(--vnx-gold))]/30",
  "High-Yield Vault": "bg-primary/10 border-primary/30",
};

// Mini bar chart — renders 12 bars representing simulated monthly performance
const MiniPerformanceChart = ({ apr, months = 12 }: { apr: number; months?: number }) => {
  const bars = useMemo(() => {
    const result: number[] = [];
    for (let i = 0; i < months; i++) {
      // Simulate slight variance around monthly rate
      const monthlyRate = apr / 12;
      const variance = (Math.sin(i * 1.7 + apr) * 0.3 + 1) * monthlyRate;
      result.push(Math.max(0.1, variance));
    }
    return result;
  }, [apr, months]);

  const max = Math.max(...bars);

  return (
    <div className="flex items-end gap-[3px] h-10">
      {bars.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm bg-primary/60 hover:bg-primary transition-colors"
          style={{ height: `${(v / max) * 100}%` }}
          title={`Month ${i + 1}: ${v.toFixed(2)}%`}
        />
      ))}
    </div>
  );
};

// Earnings projection breakdown
const EarningsProjectionCard = ({
  deposits,
  prices,
}: {
  deposits: VaultDeposit[];
  prices?: ChainPrices;
}) => {
  const activeDeposits = deposits.filter((d) => d.status === "active");

  // Projected earnings over next 30, 90, 365 days based on current active deposits
  const projections = useMemo(() => {
    const periods = [
      { label: "30D", days: 30 },
      { label: "90D", days: 90 },
      { label: "1Y", days: 365 },
    ];

    return periods.map(({ label, days }) => {
      let totalTokenEarnings = 0;
      let totalVnxBonus = 0;

      activeDeposits.forEach((dep) => {
        const apr = dep.strategy?.apr_percent ?? 0;
        const bonusApr = dep.strategy?.vnx_bonus_apr ?? 0;
        const remainDays = Math.max(0, (new Date(dep.unlock_at).getTime() - Date.now()) / 86400000);
        const effectiveDays = Math.min(days, remainDays);

        totalTokenEarnings += dep.amount * (apr / 100) * (effectiveDays / 365);
        totalVnxBonus += dep.amount * (bonusApr / 100) * (effectiveDays / 365);
      });

      const usd = prices
        ? activeDeposits.reduce((s, d) => s + (prices.usdValue(d.token_symbol, d.amount * ((d.strategy?.apr_percent ?? 0) / 100) * (Math.min(days, Math.max(0, (new Date(d.unlock_at).getTime() - Date.now()) / 86400000)) / 365))), 0)
        : 0;

      return { label, tokenEarnings: totalTokenEarnings, vnxBonus: totalVnxBonus, usd };
    });
  }, [activeDeposits, prices]);

  if (activeDeposits.length === 0) return null;

  return (
    <div className="p-4 rounded-2xl border border-border/40 bg-card mb-4">
      <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3"
        style={{ fontFamily: "'Space Grotesk', system-ui" }}>
        Projected Earnings
      </p>
      <div className="grid grid-cols-3 gap-3">
        {projections.map((p) => (
          <div key={p.label} className="text-center">
            <p className="text-[10px] text-muted-foreground uppercase">{p.label}</p>
            <p className="text-sm font-bold font-mono text-[hsl(var(--vnx-green))]">
              +{p.tokenEarnings.toFixed(2)}
            </p>
            <p className="text-[10px] font-mono text-primary">
              +{p.vnxBonus.toFixed(2)} VNX
            </p>
            {p.usd > 0 && (
              <p className="text-[10px] text-muted-foreground font-mono">${p.usd.toFixed(2)}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const VaultPanel = ({ prices }: VaultPanelProps) => {
  const {
    strategies, deposits, strategiesLoading, depositsLoading,
    createDeposit, withdrawDeposit,
    totalDeposited, totalEarnings, totalVnxRewards, activeCount,
    platformTvl, weightedApy,
  } = useVault();

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState<VaultDeposit | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [lockDays, setLockDays] = useState(30);
  const [tab, setTab] = useState<"dashboard" | "strategies" | "active" | "history">("dashboard");

  const activeStrategy = useMemo(
    () => strategies?.find((s) => s.id === selectedStrategy),
    [strategies, selectedStrategy],
  );

  const projectedEarnings = useMemo(() => {
    if (!activeStrategy || !amount || isNaN(Number(amount))) return 0;
    return Number(amount) * (activeStrategy.apr_percent / 100) * (lockDays / 365);
  }, [activeStrategy, amount, lockDays]);

  const projectedVnxBonus = useMemo(() => {
    if (!activeStrategy || !amount || isNaN(Number(amount))) return 0;
    return Number(amount) * (activeStrategy.vnx_bonus_apr / 100) * (lockDays / 365);
  }, [activeStrategy, amount, lockDays]);

  const projectedUsd = prices && activeStrategy
    ? prices.usdValue(activeStrategy.token_symbol, projectedEarnings)
    : 0;

  const totalDepositedUsd = prices
    ? (deposits?.filter((d) => d.status === "active") ?? []).reduce(
        (s, d) => s + prices.usdValue(d.token_symbol, d.amount), 0)
    : 0;
  const totalEarningsUsd = prices
    ? (deposits ?? []).reduce((s, d) => s + prices.usdValue(d.token_symbol, d.earned_amount), 0)
    : 0;
  const totalVnxRewardsUsd = prices ? prices.usdValue("VNX", totalVnxRewards) : 0;
  const platformTvlUsd = prices ? prices.usdValue("VNX", platformTvl) : 0;

  const activeDeposits = deposits?.filter((d) => d.status === "active") ?? [];
  const historyDeposits = deposits?.filter((d) => d.status !== "active") ?? [];

  const handleDeposit = async () => {
    if (!activeStrategy || !amount) return;
    await createDeposit.mutateAsync({
      strategyId: activeStrategy.id,
      amount: Number(amount),
      lockDays,
      tokenSymbol: activeStrategy.token_symbol,
    });
    setDepositOpen(false);
    setAmount("");
    setSelectedStrategy("");
    setTab("active");
  };

  const getDepositProgress = (dep: VaultDeposit) => {
    const start = new Date(dep.locked_at).getTime();
    const end = new Date(dep.unlock_at).getTime();
    const now = Date.now();
    if (now >= end) return 100;
    return Math.min(100, Math.max(0, ((now - start) / (end - start)) * 100));
  };

  const daysRemaining = (dep: VaultDeposit) => {
    const diff = new Date(dep.unlock_at).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  if (strategiesLoading || depositsLoading) {
    return (
      <div className="data-card flex justify-center py-12">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="data-card">
        {/* Vault Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
              Vault
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Lock tokens · Earn yield + VNX bonus rewards
            </p>
          </div>
          <Button
            size="sm"
            className="rounded-xl gradient-primary shadow-glow active-press text-xs h-8"
            onClick={() => setDepositOpen(true)}
          >
            New Deposit
          </Button>
        </div>

        {/* Sub-tabs */}
        <div className="flex gap-1 mb-5 p-1 rounded-xl bg-muted/20 border border-border/30">
          {(["dashboard", "strategies", "active", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${
                tab === t
                  ? "bg-primary text-primary-foreground shadow-glow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "active" ? `Active (${activeDeposits.length})` : t === "history" ? `History (${historyDeposits.length})` : t === "dashboard" ? "Dashboard" : "Strategies"}
            </button>
          ))}
        </div>

        {/* ─── DASHBOARD TAB ─────────────────────────── */}
        {tab === "dashboard" && (
          <div className="space-y-4">
            {/* Platform-level metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: "Platform TVL", value: `$${platformTvlUsd > 0 ? platformTvlUsd.toLocaleString(undefined, { maximumFractionDigits: 0 }) : platformTvl.toLocaleString()}`, accent: false },
                { label: "Avg APY", value: `${weightedApy.toFixed(1)}%`, accent: true },
                { label: "Your Locked", value: `$${totalDepositedUsd > 0 ? totalDepositedUsd.toFixed(2) : totalDeposited.toLocaleString()}`, accent: false },
                { label: "VNX Rewards", value: totalVnxRewards.toFixed(2), accent: true },
              ].map((s, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center">
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
                  <p className={`text-base font-bold font-mono mt-1 ${s.accent ? "text-primary" : ""}`}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Detailed user stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Earnings</p>
                <p className="text-lg font-bold font-mono mt-1 text-[hsl(var(--vnx-green))]">
                  {totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </p>
                {totalEarningsUsd > 0 && <p className="text-[10px] text-muted-foreground">${totalEarningsUsd.toFixed(2)}</p>}
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">VNX Bonus Earned</p>
                <p className="text-lg font-bold font-mono mt-1 text-primary">
                  {totalVnxRewards.toFixed(4)}
                </p>
                {totalVnxRewardsUsd > 0 && <p className="text-[10px] text-muted-foreground">${totalVnxRewardsUsd.toFixed(2)}</p>}
              </div>
              <div className="p-3 rounded-xl bg-muted/30 border border-border/40 text-center">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Active Vaults</p>
                <p className="text-lg font-bold font-mono mt-1">{activeCount}</p>
                <p className="text-[10px] text-muted-foreground">{strategies?.length ?? 0} strategies</p>
              </div>
            </div>

            {/* Projected Earnings Card */}
            <EarningsProjectionCard deposits={deposits ?? []} prices={prices} />

            {/* Historical Performance per strategy */}
            <div className="p-4 rounded-2xl border border-border/40 bg-card">
              <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3"
                style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                Strategy Performance (12-Month)
              </p>
              <div className="space-y-4">
                {strategies?.map((s) => (
                  <div key={s.id}>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold ${RISK_COLOR[s.name] ?? ""}`}>{s.name}</span>
                        <span className="text-[10px] font-mono text-muted-foreground">{s.token_symbol}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-muted-foreground">
                          TVL: ${prices ? prices.usdValue(s.token_symbol, s.tvl).toLocaleString(undefined, { maximumFractionDigits: 0 }) : s.tvl.toLocaleString()}
                        </span>
                        <span className="text-xs font-bold font-mono text-[hsl(var(--vnx-green))]">{s.apr_percent}% APR</span>
                        {s.vnx_bonus_apr > 0 && (
                          <span className="text-[10px] font-bold font-mono text-primary">+{s.vnx_bonus_apr}% VNX</span>
                        )}
                      </div>
                    </div>
                    <MiniPerformanceChart apr={s.apr_percent} />
                  </div>
                ))}
              </div>
            </div>

            {/* VNX Rewards Explainer */}
            <div className="p-4 rounded-2xl border border-primary/30 bg-primary/5">
              <p className="text-sm font-bold text-primary mb-1" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                VNX Bonus Rewards
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                Every vault deposit earns bonus VNX tokens on top of the base APR. The longer you lock, the more VNX you earn. Early withdrawals reduce both base earnings and VNX rewards by the strategy's penalty rate.
              </p>
              <div className="grid grid-cols-3 gap-2">
                {strategies?.filter((s) => s.vnx_bonus_apr > 0).slice(0, 3).map((s) => (
                  <div key={s.id} className="p-2 rounded-lg bg-background/50 border border-border/30 text-center">
                    <p className="text-[10px] text-muted-foreground">{s.name}</p>
                    <p className="text-sm font-bold font-mono text-primary">+{s.vnx_bonus_apr}%</p>
                    <p className="text-[10px] text-muted-foreground">{s.token_symbol}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ─── STRATEGIES TAB ───────────────────────── */}
        {tab === "strategies" && (
          <div className="space-y-3">
            {strategies?.map((s) => (
              <div
                key={s.id}
                className={`p-4 rounded-2xl border transition-all hover:shadow-md ${RISK_BG[s.name] ?? "bg-muted/20 border-border/40"}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className={`font-bold text-sm ${RISK_COLOR[s.name] ?? "text-foreground"}`}
                      style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                      {s.name}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.description}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full border border-border/40 bg-background/50">
                    {s.token_symbol}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mt-3">
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Base APR</p>
                    <p className={`text-sm font-bold font-mono ${RISK_COLOR[s.name] ?? ""}`}>{s.apr_percent}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">VNX Bonus</p>
                    <p className="text-sm font-bold font-mono text-primary">+{s.vnx_bonus_apr}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">TVL</p>
                    <p className="text-sm font-mono">{s.tvl > 1000 ? `${(s.tvl / 1000).toFixed(0)}K` : s.tvl.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Lock</p>
                    <p className="text-sm font-mono">{s.min_lock_days}–{s.max_lock_days}d</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Penalty</p>
                    <p className="text-sm font-mono">{s.penalty_percent}%</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full mt-3 text-xs h-8 rounded-lg"
                  onClick={() => {
                    setSelectedStrategy(s.id);
                    setLockDays(s.min_lock_days);
                    setDepositOpen(true);
                  }}
                >
                  Deposit {s.token_symbol}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* ─── ACTIVE DEPOSITS TAB ──────────────────── */}
        {tab === "active" && (
          activeDeposits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="font-medium mb-1">No active deposits</p>
              <p className="text-sm">Select a strategy and lock tokens to start earning.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {activeDeposits.map((dep) => {
                const progress = getDepositProgress(dep);
                const remaining = daysRemaining(dep);
                const matured = remaining === 0;
                const usdAmount = prices ? prices.usdValue(dep.token_symbol, dep.amount) : 0;
                const usdEarned = prices ? prices.usdValue(dep.token_symbol, dep.earned_amount) : 0;
                const vnxRewardUsd = prices ? prices.usdValue("VNX", dep.vnx_reward) : 0;

                return (
                  <div key={dep.id} className="p-4 rounded-2xl border border-border/40 bg-card">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-bold text-sm" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                          {dep.strategy?.name ?? "Vault Deposit"}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Locked {new Date(dep.locked_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                        matured
                          ? "bg-[hsl(var(--vnx-green))]/15 text-[hsl(var(--vnx-green))] border-[hsl(var(--vnx-green))]/30"
                          : "bg-[hsl(var(--vnx-gold))]/15 text-[hsl(var(--vnx-gold))] border-[hsl(var(--vnx-gold))]/30"
                      }`}>
                        {matured ? "Matured" : `${remaining}d left`}
                      </span>
                    </div>

                    <div className="mb-3">
                      <Progress value={progress} className="h-1.5" />
                      <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                        <span>{new Date(dep.locked_at).toLocaleDateString()}</span>
                        <span>{new Date(dep.unlock_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Deposited</p>
                        <p className="font-bold font-mono text-sm">{dep.amount.toLocaleString()} {dep.token_symbol}</p>
                        {usdAmount > 0 && <p className="text-[10px] text-muted-foreground font-mono">${usdAmount.toFixed(2)}</p>}
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">Earnings</p>
                        <p className="font-bold font-mono text-sm text-[hsl(var(--vnx-green))]">
                          +{dep.earned_amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {dep.token_symbol}
                        </p>
                        {usdEarned > 0 && <p className="text-[10px] text-muted-foreground font-mono">${usdEarned.toFixed(2)}</p>}
                      </div>
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase">VNX Bonus</p>
                        <p className="font-bold font-mono text-sm text-primary">
                          +{dep.vnx_reward.toFixed(4)} VNX
                        </p>
                        {vnxRewardUsd > 0 && <p className="text-[10px] text-muted-foreground font-mono">${vnxRewardUsd.toFixed(2)}</p>}
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant={matured ? "default" : "outline"}
                      className={`w-full text-xs h-8 rounded-lg ${matured ? "gradient-primary shadow-glow" : ""}`}
                      onClick={() => setWithdrawTarget(dep)}
                    >
                      {matured ? "Withdraw + Earnings + VNX" : "Early Withdraw (Penalty)"}
                    </Button>
                  </div>
                );
              })}
            </div>
          )
        )}

        {/* ─── HISTORY TAB ──────────────────────────── */}
        {tab === "history" && (
          historyDeposits.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No withdrawal history yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {historyDeposits.map((dep) => {
                const usdAmount = prices ? prices.usdValue(dep.token_symbol, dep.amount) : 0;
                const usdEarned = prices ? prices.usdValue(dep.token_symbol, dep.earned_amount) : 0;
                const isEarly = dep.status === "early_withdrawn";

                return (
                  <div key={dep.id} className="data-row">
                    <div>
                      <p className="font-semibold text-sm">{dep.strategy?.name ?? "Vault"}</p>
                      <p className="text-[11px] text-muted-foreground">
                        {new Date(dep.locked_at).toLocaleDateString()} → {dep.withdrawn_at ? new Date(dep.withdrawn_at).toLocaleDateString() : "—"}
                      </p>
                      <span className={`inline-block mt-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${
                        isEarly
                          ? "bg-[hsl(var(--vnx-gold))]/15 text-[hsl(var(--vnx-gold))] border-[hsl(var(--vnx-gold))]/30"
                          : "bg-[hsl(var(--vnx-green))]/15 text-[hsl(var(--vnx-green))] border-[hsl(var(--vnx-green))]/30"
                      }`}>
                        {isEarly ? "Early Withdrawn" : "Withdrawn"}
                      </span>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold">{dep.amount.toLocaleString()} {dep.token_symbol}</p>
                      {usdAmount > 0 && <p className="text-[10px] text-muted-foreground font-mono">${usdAmount.toFixed(2)}</p>}
                      <p className={`text-xs font-mono mt-1 ${isEarly ? "text-[hsl(var(--vnx-gold))]" : "text-[hsl(var(--vnx-green))]"}`}>
                        +{dep.earned_amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} earned
                      </p>
                      {usdEarned > 0 && <p className="text-[10px] text-muted-foreground font-mono">${usdEarned.toFixed(2)}</p>}
                      {dep.vnx_reward > 0 && (
                        <p className="text-xs font-mono text-primary mt-0.5">+{dep.vnx_reward.toFixed(4)} VNX</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}
      </div>

      {/* ─── DEPOSIT DIALOG ────────────────────────── */}
      <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>New Vault Deposit</DialogTitle>
            <DialogDescription>
              Lock tokens to earn yield + VNX bonus rewards. Early withdrawal incurs a penalty.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Strategy</label>
              <Select value={selectedStrategy} onValueChange={setSelectedStrategy}>
                <SelectTrigger className="rounded-lg">
                  <SelectValue placeholder="Select a vault strategy" />
                </SelectTrigger>
                <SelectContent>
                  {strategies?.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name} — {s.token_symbol} @ {s.apr_percent}% + {s.vnx_bonus_apr}% VNX
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wider mb-1.5 block">Amount</label>
              <Input
                type="number"
                placeholder={`Enter ${activeStrategy?.token_symbol ?? "token"} amount`}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="font-mono rounded-lg"
                min={0}
                step="any"
              />
            </div>

            {activeStrategy && (
              <div>
                <div className="flex justify-between mb-1.5">
                  <label className="text-xs text-muted-foreground uppercase tracking-wider">Lock Duration</label>
                  <span className="text-xs font-bold font-mono">{lockDays} days</span>
                </div>
                <Slider
                  value={[lockDays]}
                  onValueChange={([v]) => setLockDays(v)}
                  min={activeStrategy.min_lock_days}
                  max={activeStrategy.max_lock_days}
                  step={1}
                />
                <div className="flex justify-between mt-1 text-[10px] text-muted-foreground">
                  <span>{activeStrategy.min_lock_days}d min</span>
                  <span>{activeStrategy.max_lock_days}d max</span>
                </div>
              </div>
            )}

            {activeStrategy && Number(amount) > 0 && (
              <div className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Base APR</span>
                  <span className="font-bold font-mono">{activeStrategy.apr_percent}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">VNX Bonus APR</span>
                  <span className="font-bold font-mono text-primary">+{activeStrategy.vnx_bonus_apr}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Early Penalty</span>
                  <span className="font-mono">{activeStrategy.penalty_percent}%</span>
                </div>
                <div className="flex justify-between text-xs pt-2 border-t border-border/30">
                  <span className="text-muted-foreground">Projected Earnings</span>
                  <div className="text-right">
                    <span className="font-bold font-mono text-[hsl(var(--vnx-green))]">
                      +{projectedEarnings.toFixed(4)} {activeStrategy.token_symbol}
                    </span>
                    {projectedUsd > 0 && (
                      <p className="text-[10px] text-muted-foreground font-mono">${projectedUsd.toFixed(2)}</p>
                    )}
                  </div>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">VNX Bonus</span>
                  <span className="font-bold font-mono text-primary">+{projectedVnxBonus.toFixed(4)} VNX</span>
                </div>
              </div>
            )}

            <Button
              className="w-full rounded-xl gradient-primary shadow-glow"
              disabled={!selectedStrategy || !amount || Number(amount) <= 0 || createDeposit.isPending}
              onClick={handleDeposit}
            >
              {createDeposit.isPending ? "Depositing…" : "Lock Tokens + Earn VNX"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* ─── WITHDRAW DIALOG ───────────────────────── */}
      <Dialog open={!!withdrawTarget} onOpenChange={() => setWithdrawTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Withdraw from Vault</DialogTitle>
            <DialogDescription>
              {withdrawTarget && daysRemaining(withdrawTarget) > 0
                ? `Early withdrawal — a ${withdrawTarget.strategy?.penalty_percent ?? 10}% penalty applies to earnings and VNX rewards.`
                : "Your deposit has matured. Withdraw your principal, full earnings, and VNX bonus."
              }
            </DialogDescription>
          </DialogHeader>
          {withdrawTarget && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-muted/30 border border-border/40 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Principal</span>
                  <span className="font-mono font-bold">{withdrawTarget.amount.toLocaleString()} {withdrawTarget.token_symbol}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Earnings</span>
                  <span className="font-mono text-[hsl(var(--vnx-green))]">
                    +{withdrawTarget.earned_amount.toLocaleString(undefined, { maximumFractionDigits: 4 })} {withdrawTarget.token_symbol}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">VNX Bonus</span>
                  <span className="font-mono text-primary">+{withdrawTarget.vnx_reward.toFixed(4)} VNX</span>
                </div>
                {daysRemaining(withdrawTarget) > 0 && (
                  <>
                    <div className="flex justify-between text-xs pt-1 border-t border-border/30">
                      <span className="text-destructive">Earnings Penalty</span>
                      <span className="font-mono text-destructive">
                        −{(withdrawTarget.earned_amount * (withdrawTarget.strategy?.penalty_percent ?? 10) / 100).toFixed(4)} {withdrawTarget.token_symbol}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-destructive">VNX Penalty</span>
                      <span className="font-mono text-destructive">
                        −{(withdrawTarget.vnx_reward * (withdrawTarget.strategy?.penalty_percent ?? 10) / 100).toFixed(4)} VNX
                      </span>
                    </div>
                  </>
                )}
              </div>
              <Button
                className="w-full rounded-xl"
                variant={daysRemaining(withdrawTarget) > 0 ? "destructive" : "default"}
                disabled={withdrawDeposit.isPending}
                onClick={async () => {
                  await withdrawDeposit.mutateAsync(withdrawTarget.id);
                  setWithdrawTarget(null);
                }}
              >
                {withdrawDeposit.isPending ? "Processing…" : "Confirm Withdrawal"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
