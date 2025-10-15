import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon, Copy, Send, Download, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import StatsCard from "@/components/StatsCard";
import { useVNXPrice } from "@/hooks/useVNXPrice";
import { toast } from "sonner";

const Wallet = () => {
  const { data: vnxPrice } = useVNXPrice();

  // Demo wallet address (in production, this would come from actual wallet)
  const walletAddress = "0x742d35...2Ab4";
  const fullAddress = "0x742d35Cc6634C0532925a3b844Bc9e7595f2Ab4";

  const copyAddress = () => {
    navigator.clipboard.writeText(fullAddress);
    toast.success("Address copied to clipboard!");
  };

  // Demo balances (in production, these would be fetched from blockchain)
  const balances = [
    { chain: "BNB Chain", symbol: "VNX", balance: 1000000, value: 542 },
    { chain: "BNB Chain", symbol: "BNB", balance: 0.5, value: 315 },
    { chain: "Ethereum", symbol: "ETH", balance: 0.1, value: 230 },
    { chain: "Tron", symbol: "TRX", balance: 1000, value: 150 },
  ];

  const totalValue = balances.reduce((sum, asset) => sum + asset.value, 0);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">My Wallet</h1>
            <p className="text-muted-foreground">Manage your multi-chain assets</p>
          </div>

          {/* Wallet Overview */}
          <Card className="shadow-card mb-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center">
                    <WalletIcon className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Balance</p>
                    <p className="text-3xl font-bold">${totalValue.toFixed(2)}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={copyAddress}>
                    <Copy className="h-4 w-4 mr-2" />
                    {walletAddress}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 gap-2">
                  <Send className="h-4 w-4" />
                  Send
                </Button>
                <Button className="flex-1 gap-2" variant="outline">
                  <Download className="h-4 w-4" />
                  Receive
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <StatsCard
              icon={WalletIcon}
              label="Assets"
              value={balances.length.toString()}
              change="Across 4 chains"
            />
            <StatsCard
              icon={WalletIcon}
              label="VNX Holdings"
              value="1,000,000"
              change={`$${(vnxPrice?.price || 0.000542 * 1000000).toFixed(2)}`}
            />
            <StatsCard
              icon={WalletIcon}
              label="24h Change"
              value={`+${vnxPrice?.change24h.toFixed(2) || '2.45'}%`}
              change="Portfolio value"
            />
          </div>

          {/* Assets List */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle>Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {balances.map((asset, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary transition-smooth"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary">{asset.symbol[0]}</span>
                      </div>
                      <div>
                        <p className="font-semibold">{asset.symbol}</p>
                        <p className="text-sm text-muted-foreground">{asset.chain}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{asset.balance.toLocaleString()} {asset.symbol}</p>
                      <p className="text-sm text-muted-foreground">${asset.value.toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="shadow-card mt-6">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: "Received", amount: "+1,000 VNX", time: "2 hours ago", status: "Confirmed" },
                  { type: "Sent", amount: "-0.1 ETH", time: "5 hours ago", status: "Confirmed" },
                  { type: "Swap", amount: "500 VNX → 0.3 BNB", time: "1 day ago", status: "Confirmed" },
                  { type: "Stake", amount: "+100,000 VNX", time: "2 days ago", status: "Confirmed" },
                ].map((tx, i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div>
                      <p className="font-semibold">{tx.type}</p>
                      <p className="text-sm text-muted-foreground">{tx.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{tx.amount}</p>
                      <p className="text-sm text-green-500">{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Network Switcher */}
          <Card className="shadow-card mt-6">
            <CardHeader>
              <CardTitle>Networks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {["BNB Chain", "Ethereum", "Tron", "Bitcoin", "Fantom", "Solana"].map((network) => (
                  <Button key={network} variant="outline" className="justify-start">
                    {network}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card className="shadow-card mt-6">
            <CardHeader>
              <CardTitle>Security</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-semibold">Two-Factor Authentication</p>
                    <p className="text-sm text-muted-foreground">Extra security for your account</p>
                  </div>
                  <Button size="sm">Enable</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-semibold">Biometric Login</p>
                    <p className="text-sm text-muted-foreground">Use fingerprint or face ID</p>
                  </div>
                  <Button size="sm" variant="outline">Setup</Button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                  <div>
                    <p className="font-semibold">Hardware Wallet</p>
                    <p className="text-sm text-muted-foreground">Connect Ledger or Trezor</p>
                  </div>
                  <Button size="sm" variant="outline">Connect</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="shadow-card mt-6">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <Link to="/trade">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Trade Crypto
                  </Button>
                </Link>
                <Link to="/stake">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <WalletIcon className="h-4 w-4" />
                    Stake VNX
                  </Button>
                </Link>
                <Link to="/markets">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <TrendingUp className="h-4 w-4" />
                    View Markets
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start gap-2">
                  <Download className="h-4 w-4" />
                  Export History
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Wallet;
