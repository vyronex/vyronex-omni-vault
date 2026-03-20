import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/StatsCard";
import { useState } from "react";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";

const Stake = () => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  const stakingData = {
    totalStaked: 500000,
    myStaked: 100000,
    rewards: 1250,
    apr: 12.5,
  };

  const handleStake = () => {
    if (!stakeAmount || parseFloat(stakeAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    toast.success(`Staking ${stakeAmount} VNX...`);
    setStakeAmount("");
  };

  const handleUnstake = () => {
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }
    toast.success(`Unstaking ${unstakeAmount} VNX...`);
    setUnstakeAmount("");
  };

  const handleClaim = () => {
    toast.success("Claiming rewards...");
  };

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
            <p className="page-subtitle">Earn rewards by staking your VNX tokens</p>
          </div>
        </div>
      </section>

      <div className="section-container py-8">
        <div className="max-w-6xl mx-auto">

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
            {[
              { label: "APR", value: `${stakingData.apr}%`, change: "Annual Percentage Rate" },
              { label: "Total Staked", value: `${(stakingData.totalStaked / 1000).toFixed(0)}K`, change: "VNX Tokens" },
              { label: "My Staked", value: stakingData.myStaked.toLocaleString(), change: "VNX Tokens" },
              { label: "Rewards", value: stakingData.rewards.toLocaleString(), change: "VNX Earned" },
            ].map((stat, i) => (
              <div key={i} className={`animate-slide-up stagger-${i + 1}`}>
                <StatsCard label={stat.label} value={stat.value} change={stat.change} />
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-8">
            {/* Staking Interface */}
            <div className="card-modern animate-slide-up stagger-2">
              <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Stake / Unstake</h2>
              <Tabs defaultValue="stake">
                <TabsList className="grid w-full grid-cols-2 rounded-xl">
                  <TabsTrigger value="stake" className="rounded-lg">Stake</TabsTrigger>
                  <TabsTrigger value="unstake" className="rounded-lg">Unstake</TabsTrigger>
                </TabsList>

                <TabsContent value="stake" className="space-y-5 mt-5">
                  <div>
                    <Label htmlFor="stake-amount" className="text-xs uppercase tracking-wider text-muted-foreground">Amount to Stake</Label>
                    <Input
                      id="stake-amount"
                      type="number"
                      placeholder="0.00"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      className="mt-2 rounded-xl h-12 text-lg"
                    />
                    <p className="text-sm text-muted-foreground mt-2">Available: 1,000,000 VNX</p>
                  </div>
                  <Button onClick={handleStake} className="w-full rounded-xl gradient-primary shadow-glow hover:shadow-glow-lg active-press h-12 transition-all">
                    Stake VNX
                  </Button>
                </TabsContent>

                <TabsContent value="unstake" className="space-y-5 mt-5">
                  <div>
                    <Label htmlFor="unstake-amount" className="text-xs uppercase tracking-wider text-muted-foreground">Amount to Unstake</Label>
                    <Input
                      id="unstake-amount"
                      type="number"
                      placeholder="0.00"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      className="mt-2 rounded-xl h-12 text-lg"
                    />
                    <p className="text-sm text-muted-foreground mt-2">Staked: {stakingData.myStaked.toLocaleString()} VNX</p>
                  </div>
                  <Button onClick={handleUnstake} variant="outline" className="w-full rounded-xl active-press h-12">
                    Unstake VNX
                  </Button>
                </TabsContent>
              </Tabs>
            </div>

            {/* Rewards */}
            <div className="card-modern animate-slide-up stagger-3">
              <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Your Rewards</h2>
              <div className="text-center p-8 rounded-2xl gradient-primary shadow-glow mb-6">
                <p className="text-primary-foreground/80 text-sm mb-2">Available Rewards</p>
                <p className="text-4xl font-bold text-primary-foreground mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                  {stakingData.rewards.toLocaleString()} VNX
                </p>
                <Button
                  onClick={handleClaim}
                  variant="secondary"
                  className="w-full rounded-xl active-press h-12"
                >
                  Claim Rewards
                </Button>
              </div>

              <div className="space-y-3">
                {[
                  { label: "Daily Rewards", value: "~34.25 VNX" },
                  { label: "Monthly Rewards", value: "~1,028 VNX" },
                  { label: "Annual Rewards", value: "~12,500 VNX" },
                ].map((row, i) => (
                  <div key={i} className="data-row">
                    <span className="text-muted-foreground text-sm">{row.label}</span>
                    <span className="font-semibold text-sm">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How Staking Works */}
          <div className="mb-8 animate-slide-up stagger-4">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
              How It <span className="text-gradient">Works</span>
            </h2>
            <div className="grid md:grid-cols-3 gap-5">
              {[
                { step: "01", title: "Stake Your VNX", desc: "Lock your VNX tokens in the staking contract to start earning rewards." },
                { step: "02", title: "Earn Rewards", desc: `Receive ${stakingData.apr}% APR in VNX tokens distributed continuously.` },
                { step: "03", title: "Claim Anytime", desc: "Claim your rewards and unstake your tokens whenever you want." },
              ].map((item, i) => (
                <div key={i} className="card-modern text-center">
                  <div className="text-3xl font-bold text-primary/15 mb-2" style={{ fontFamily: "'Space Grotesk', system-ui" }}>{item.step}</div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Staking History */}
          <div className="data-card mb-8 animate-slide-up stagger-5">
            <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Staking History</h2>
            <div className="space-y-3">
              {[
                { action: "Staked", amount: "100,000 VNX", date: "Oct 10, 2024", status: "Active" },
                { action: "Claimed Rewards", amount: "1,250 VNX", date: "Oct 14, 2024", status: "Completed" },
                { action: "Staked", amount: "50,000 VNX", date: "Oct 1, 2024", status: "Active" },
              ].map((entry, i) => (
                <div key={i} className="data-row">
                  <div>
                    <p className="font-semibold text-sm">{entry.action}</p>
                    <p className="text-xs text-muted-foreground">{entry.date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{entry.amount}</p>
                    <p className={`text-xs font-medium ${entry.status === 'Active' ? 'text-[hsl(var(--vnx-green))]' : 'text-muted-foreground'}`}>{entry.status}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Staking Pools */}
          <div className="mb-8 animate-slide-up stagger-6">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
              Staking <span className="text-gradient">Pools</span>
            </h2>
            <div className="grid md:grid-cols-2 gap-5">
              {[
                { name: "VNX Standard Pool", apr: "12.5%", lockup: "Flexible", tvl: "$5.4M" },
                { name: "VNX Premium Pool", apr: "18.0%", lockup: "30 days", tvl: "$2.1M" },
                { name: "VNX-BNB LP Pool", apr: "25.5%", lockup: "Flexible", tvl: "$1.8M" },
                { name: "VNX Elite Pool", apr: "30.0%", lockup: "90 days", tvl: "$890K" },
              ].map((pool, i) => (
                <div key={i} className="card-modern">
                  <h3 className="font-bold mb-4">{pool.name}</h3>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">APR</p>
                      <p className="font-bold text-[hsl(var(--vnx-green))] mt-1">{pool.apr}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">Lock-up</p>
                      <p className="font-semibold mt-1">{pool.lockup}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">TVL</p>
                      <p className="font-semibold mt-1">{pool.tvl}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Staking Calculator */}
          <div className="card-modern mb-8 animate-slide-up">
            <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Staking Calculator</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Amount to Stake</Label>
                  <Input type="number" placeholder="100000" className="mt-2 rounded-xl h-12" />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Staking Period</Label>
                  <select className="w-full mt-2 px-4 py-3 rounded-xl bg-background border border-border/40 text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all">
                    <option>30 days (12.5% APR)</option>
                    <option>90 days (18.0% APR)</option>
                    <option>180 days (25.0% APR)</option>
                    <option>365 days (30.0% APR)</option>
                  </select>
                </div>
              </div>
              <div className="p-6 rounded-2xl gradient-primary shadow-glow flex flex-col justify-center">
                <p className="text-primary-foreground/80 text-sm mb-1">Estimated Earnings</p>
                <p className="text-4xl font-bold text-primary-foreground" style={{ fontFamily: "'Space Grotesk', system-ui" }}>12,500 VNX</p>
                <p className="text-sm text-primary-foreground/80 mt-2">≈ $6.78 at current price</p>
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="data-card animate-slide-up">
            <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Top Stakers</h2>
            <div className="space-y-3">
              {[
                { rank: 1, address: "0x742d...2Ab4", amount: "5,000,000 VNX", rewards: "62,500 VNX" },
                { rank: 2, address: "0x893f...8Cd2", amount: "3,200,000 VNX", rewards: "40,000 VNX" },
                { rank: 3, address: "0x456a...9Ef7", amount: "2,800,000 VNX", rewards: "35,000 VNX" },
                { rank: 4, address: "0x123b...4Gh8", amount: "1,900,000 VNX", rewards: "23,750 VNX" },
                { rank: 5, address: "0x789c...5Jk9", amount: "1,500,000 VNX", rewards: "18,750 VNX" },
              ].map((entry, i) => (
                <div key={i} className="data-row">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-soft">
                      <span className="text-sm font-bold text-primary-foreground">{entry.rank}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-sm font-mono">{entry.address}</p>
                      <p className="text-xs text-muted-foreground">Rewards: {entry.rewards}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-sm">{entry.amount}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
    </PageTransition>
  );
};

export default Stake;
