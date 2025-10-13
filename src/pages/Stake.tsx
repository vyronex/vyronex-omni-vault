import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/StatsCard";
import { TrendingUp, Wallet, Clock } from "lucide-react";
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
              icon={TrendingUp}
              label="APR"
              value={`${stakingData.apr}%`}
              change="Annual Percentage Rate"
            />
            <StatsCard
              icon={Wallet}
              label="Total Staked"
              value={`${(stakingData.totalStaked / 1000).toFixed(0)}K`}
              change="VNX Tokens"
            />
            <StatsCard
              icon={Wallet}
              label="My Staked"
              value={stakingData.myStaked.toLocaleString()}
              change="VNX Tokens"
            />
            <StatsCard
              icon={Clock}
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
        </div>
      </div>
    </div>
  );
};

export default Stake;
