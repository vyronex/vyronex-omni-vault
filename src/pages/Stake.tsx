import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/StatsCard";
import { useState } from "react";
import { toast } from "sonner";

const Stake = () => {
  const [stakeAmount, setStakeAmount] = useState("");
  const [unstakeAmount, setUnstakeAmount] = useState("");

  // Demo data (in production, fetch from blockchain)
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
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">Stake VNX</h1>
            <p className="text-muted-foreground">Earn rewards by staking your VNX tokens</p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <StatsCard
              label="APR"
              value={`${stakingData.apr}%`}
              change="Annual Percentage Rate"
            />
            <StatsCard
              label="Total Staked"
              value={`${(stakingData.totalStaked / 1000).toFixed(0)}K`}
              change="VNX Tokens"
            />
            <StatsCard
              label="My Staked"
              value={stakingData.myStaked.toLocaleString()}
              change="VNX Tokens"
            />
            <StatsCard
              label="Rewards"
              value={stakingData.rewards.toLocaleString()}
              change="VNX Earned"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Staking Interface */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Stake / Unstake</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="stake">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="stake">Stake</TabsTrigger>
                    <TabsTrigger value="unstake">Unstake</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="stake" className="space-y-4">
                    <div>
                      <Label htmlFor="stake-amount">Amount to Stake</Label>
                      <Input
                        id="stake-amount"
                        type="number"
                        placeholder="0.00"
                        value={stakeAmount}
                        onChange={(e) => setStakeAmount(e.target.value)}
                        className="mt-2"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Available: 1,000,000 VNX
                      </p>
                    </div>
                    <Button onClick={handleStake} className="w-full">
                      Stake VNX
                    </Button>
                  </TabsContent>
                  
                  <TabsContent value="unstake" className="space-y-4">
                    <div>
                      <Label htmlFor="unstake-amount">Amount to Unstake</Label>
                      <Input
                        id="unstake-amount"
                        type="number"
                        placeholder="0.00"
                        value={unstakeAmount}
                        onChange={(e) => setUnstakeAmount(e.target.value)}
                        className="mt-2"
                      />
                      <p className="text-sm text-muted-foreground mt-2">
                        Staked: {stakingData.myStaked.toLocaleString()} VNX
                      </p>
                    </div>
                    <Button onClick={handleUnstake} variant="outline" className="w-full">
                      Unstake VNX
                    </Button>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Rewards */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Your Rewards</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center p-6 rounded-lg bg-gradient-primary">
                  <p className="text-primary-foreground/80 mb-2">Available Rewards</p>
                  <p className="text-4xl font-bold text-primary-foreground mb-4">
                    {stakingData.rewards.toLocaleString()} VNX
                  </p>
                  <Button 
                    onClick={handleClaim} 
                    variant="secondary"
                    className="w-full"
                  >
                    Claim Rewards
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 rounded-lg border border-border">
                    <span className="text-muted-foreground">Daily Rewards</span>
                    <span className="font-semibold">~34.25 VNX</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg border border-border">
                    <span className="text-muted-foreground">Monthly Rewards</span>
                    <span className="font-semibold">~1,028 VNX</span>
                  </div>
                  <div className="flex justify-between items-center p-4 rounded-lg border border-border">
                    <span className="text-muted-foreground">Annual Rewards</span>
                    <span className="font-semibold">~12,500 VNX</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Staking Info */}
          <Card className="shadow-card mt-6">
            <CardHeader>
              <CardTitle>How Staking Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h3 className="font-semibold mb-2">1. Stake Your VNX</h3>
                  <p className="text-sm text-muted-foreground">
                    Lock your VNX tokens in the staking contract to start earning rewards.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">2. Earn Rewards</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive {stakingData.apr}% APR in VNX tokens distributed continuously.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">3. Claim Anytime</h3>
                  <p className="text-sm text-muted-foreground">
                    Claim your rewards and unstake your tokens whenever you want.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Staking History */}
          <Card className="shadow-card mt-6">
            <CardHeader>
              <CardTitle>Staking History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { action: "Staked", amount: "100,000 VNX", date: "Oct 10, 2024", status: "Active" },
                  { action: "Claimed Rewards", amount: "1,250 VNX", date: "Oct 14, 2024", status: "Completed" },
                  { action: "Staked", amount: "50,000 VNX", date: "Oct 1, 2024", status: "Active" },
                ].map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="font-semibold">{entry.action}</p>
                      <p className="text-sm text-muted-foreground">{entry.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{entry.amount}</p>
                      <p className="text-sm text-green-500">{entry.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Staking Pools */}
          <Card className="shadow-card mt-6">
            <CardHeader>
              <CardTitle>Other Staking Pools</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  { name: "VNX Standard Pool", apr: "12.5%", lockup: "Flexible", tvl: "$5.4M" },
                  { name: "VNX Premium Pool", apr: "18.0%", lockup: "30 days", tvl: "$2.1M" },
                  { name: "VNX-BNB LP Pool", apr: "25.5%", lockup: "Flexible", tvl: "$1.8M" },
                  { name: "VNX Elite Pool", apr: "30.0%", lockup: "90 days", tvl: "$890K" },
                ].map((pool, i) => (
                  <div key={i} className="p-4 rounded-lg border border-border hover:border-primary transition-smooth">
                    <h3 className="font-bold mb-2">{pool.name}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">APR</p>
                        <p className="font-semibold text-green-500">{pool.apr}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Lock-up</p>
                        <p className="font-semibold">{pool.lockup}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">TVL</p>
                        <p className="font-semibold">{pool.tvl}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Staking Calculator */}
          <Card className="shadow-card mt-6">
            <CardHeader>
              <CardTitle>Staking Calculator</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Amount to Stake</Label>
                  <Input type="number" placeholder="100000" className="mt-2" />
                </div>
                <div>
                  <Label>Staking Period</Label>
                  <select className="w-full mt-2 px-3 py-2 rounded-lg bg-background border border-border">
                    <option>30 days (12.5% APR)</option>
                    <option>90 days (18.0% APR)</option>
                    <option>180 days (25.0% APR)</option>
                    <option>365 days (30.0% APR)</option>
                  </select>
                </div>
                <div className="p-4 rounded-lg bg-gradient-primary">
                  <div className="text-primary-foreground/80 mb-2">Estimated Earnings</div>
                  <div className="text-3xl font-bold text-primary-foreground">12,500 VNX</div>
                  <div className="text-sm text-primary-foreground/80 mt-1">≈ $6.78 at current price</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Leaderboard */}
          <Card className="shadow-card mt-6">
            <CardHeader>
              <CardTitle>Top Stakers</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { rank: 1, address: "0x742d...2Ab4", amount: "5,000,000 VNX", rewards: "62,500 VNX" },
                  { rank: 2, address: "0x893f...8Cd2", amount: "3,200,000 VNX", rewards: "40,000 VNX" },
                  { rank: 3, address: "0x456a...9Ef7", amount: "2,800,000 VNX", rewards: "35,000 VNX" },
                  { rank: 4, address: "0x123b...4Gh8", amount: "1,900,000 VNX", rewards: "23,750 VNX" },
                  { rank: 5, address: "0x789c...5Jk9", amount: "1,500,000 VNX", rewards: "18,750 VNX" },
                ].map((entry, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gradient-primary flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-foreground">{entry.rank}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{entry.address}</p>
                        <p className="text-sm text-muted-foreground">Rewards: {entry.rewards}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{entry.amount}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Stake;
