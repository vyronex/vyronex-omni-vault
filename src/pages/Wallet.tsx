import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet as WalletIcon, Copy, Send, Download, TrendingUp, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import StatsCard from "@/components/StatsCard";
import { useVNXPrice } from "@/hooks/useVNXPrice";
import { useAuth } from "@/hooks/useAuth";
import { useWallets } from "@/hooks/useWallets";
import { useTransactions } from "@/hooks/useTransactions";
import { toast } from "sonner";

const WalletReal = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: vnxPrice } = useVNXPrice();
  const { wallets, balances, loading: walletsLoading } = useWallets();
  const { transactions, loading: transactionsLoading } = useTransactions();

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || walletsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) return null;

  const primaryWallet = wallets?.find(w => w.is_primary);
  const walletAddress = primaryWallet?.address || "No wallet connected";
  const shortAddress = walletAddress.length > 16 
    ? `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`
    : walletAddress;

  const copyAddress = () => {
    if (primaryWallet) {
      navigator.clipboard.writeText(primaryWallet.address);
      toast.success("Address copied to clipboard!");
    }
  };

  // Calculate total value from balances
  const totalValue = balances?.reduce((sum, balance) => sum + Number(balance.usd_value), 0) || 0;

  // Get VNX balance
  const vnxBalance = balances?.find(b => b.token_symbol === "VNX");

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
          <Card className="shadow-card mb-8 glass-card">
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
                {primaryWallet && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={copyAddress}>
                      <Copy className="h-4 w-4 mr-2" />
                      {shortAddress}
                    </Button>
                  </div>
                )}
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
              value={(balances?.length || 0).toString()}
              change={`Across ${wallets?.length || 0} wallets`}
            />
            <StatsCard
              icon={WalletIcon}
              label="VNX Holdings"
              value={vnxBalance ? Number(vnxBalance.balance).toLocaleString() : "0"}
              change={`$${vnxBalance ? Number(vnxBalance.usd_value).toFixed(2) : "0.00"}`}
            />
            <StatsCard
              icon={WalletIcon}
              label="24h Change"
              value={`+${vnxPrice?.change24h.toFixed(2) || '2.45'}%`}
              change="Portfolio value"
            />
          </div>

          {/* Assets List */}
          <Card className="shadow-card glass-card">
            <CardHeader>
              <CardTitle>Assets</CardTitle>
            </CardHeader>
            <CardContent>
              {balances && balances.length > 0 ? (
                <div className="space-y-4">
                  {balances.map((balance) => (
                    <div
                      key={balance.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border hover:border-primary transition-smooth"
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                          <span className="font-bold text-primary">{balance.token_symbol[0]}</span>
                        </div>
                        <div>
                          <p className="font-semibold">{balance.token_symbol}</p>
                          <p className="text-sm text-muted-foreground">Balance</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{Number(balance.balance).toLocaleString()} {balance.token_symbol}</p>
                        <p className="text-sm text-muted-foreground">${Number(balance.usd_value).toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No assets found. Connect a wallet to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card className="shadow-card glass-card mt-6">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactionsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : transactions && transactions.length > 0 ? (
                <div className="space-y-4">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between p-4 rounded-lg border border-border">
                      <div>
                        <p className="font-semibold">{tx.tx_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {Number(tx.amount).toFixed(4)} {tx.token_symbol}
                        </p>
                        <p className={`text-sm ${tx.status === 'confirmed' ? 'text-green-500' : 'text-yellow-500'}`}>
                          {tx.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No transactions yet</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Network Switcher */}
          <Card className="shadow-card glass-card mt-6">
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

          {/* Quick Actions */}
          <Card className="shadow-card glass-card mt-6">
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
                <Link to="/swap">
                  <Button variant="outline" className="w-full justify-start gap-2">
                    <Download className="h-4 w-4" />
                    Swap Tokens
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default WalletReal;
