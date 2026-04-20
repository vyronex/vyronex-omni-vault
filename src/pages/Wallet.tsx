import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import { useVNXPrice } from "@/hooks/useVNXPrice";
import { useAuth } from "@/hooks/useAuth";
import { useWallets } from "@/hooks/useWallets";
import { useTransactions } from "@/hooks/useTransactions";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { DepositDialog, WithdrawDialog, TransferDialog } from "@/components/wallet/WalletActionDialogs";

const WalletReal = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: vnxPrice } = useVNXPrice();
  const { wallets, balances, loading: walletsLoading } = useWallets();
  const { transactions, loading: transactionsLoading, flashedIds } = useTransactions();
  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  if (authLoading || walletsLoading) {
    return (
      <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    </PageTransition>
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

  const totalValue = balances?.reduce((sum, balance) => sum + Number(balance.usd_value), 0) || 0;
  const vnxBalance = balances?.find(b => b.token_symbol === "VNX");

  return (
    <PageTransition>
    <div className="min-h-screen bg-background">
      <Navigation />

      {/* Page Header */}
      <section className="page-header">
        <div className="absolute inset-0 gradient-hero" />
        <div className="page-header-content">
          <div className="max-w-6xl mx-auto animate-slide-up">
            <span className="section-badge">Portfolio</span>
            <h1 className="page-title">
              My <span className="text-gradient">Wallet</span>
            </h1>
            <p className="page-subtitle">Manage your multi-chain assets in one place</p>
          </div>
        </div>
      </section>

      <div className="section-container py-8">
        <div className="max-w-6xl mx-auto">

          {/* Wallet Overview Card */}
          <div className="card-modern mb-8 animate-slide-up stagger-1">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                  <span className="text-primary-foreground font-bold text-xl">W</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Balance</p>
                  <p className="text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', system-ui" }}>${totalValue.toFixed(2)}</p>
                </div>
              </div>
              {primaryWallet && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={copyAddress}
                  className="rounded-xl hover-border-glow active-press font-mono text-xs"
                >
                  {shortAddress}
                </Button>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Button onClick={() => setWithdrawOpen(true)} className="rounded-xl gradient-primary shadow-glow hover:shadow-glow-lg active-press transition-all h-12">
                Send
              </Button>
              <Button onClick={() => setDepositOpen(true)} className="rounded-xl active-press h-12" variant="outline">
                Receive
              </Button>
              <Button onClick={() => setTransferOpen(true)} className="rounded-xl active-press h-12" variant="outline">
                Transfer
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            {[
              { label: "Assets", value: (balances?.length || 0).toString(), change: `Across ${wallets?.length || 0} wallets` },
              { label: "VNX Holdings", value: vnxBalance ? Number(vnxBalance.balance).toLocaleString() : "0", change: `$${vnxBalance ? Number(vnxBalance.usd_value).toFixed(2) : "0.00"}` },
              { label: "24h Change", value: `+${vnxPrice?.change24h.toFixed(2) || '2.45'}%`, change: "Portfolio value" },
            ].map((stat, i) => (
              <div key={i} className={`animate-slide-up stagger-${i + 2}`}>
                <StatsCard label={stat.label} value={stat.value} change={stat.change} />
              </div>
            ))}
          </div>

          {/* Assets List */}
          <div className="data-card mb-6 animate-slide-up stagger-4">
            <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Assets</h2>
            {balances && balances.length > 0 ? (
              <div className="space-y-3">
                {balances.map((balance, i) => (
                  <div
                    key={balance.id}
                    className="data-row hover-scale-subtle"
                    style={{ animationDelay: `${i * 50}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <span className="font-bold text-primary text-sm">{balance.token_symbol.substring(0, 3)}</span>
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
              <div className="text-center py-12 text-muted-foreground">
                <p className="mb-1 font-medium">No assets found</p>
                <p className="text-sm">Connect a wallet to get started.</p>
              </div>
            )}
          </div>

          {/* Transaction History */}
          <div className="data-card mb-6 animate-slide-up stagger-5">
            <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Recent Transactions</h2>
            {transactionsLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-3">
                {transactions.map((tx) => {
                  const statusStyles: Record<string, string> = {
                    confirmed: "bg-[hsl(var(--vnx-green))]/15 text-[hsl(var(--vnx-green))] border-[hsl(var(--vnx-green))]/30",
                    pending: "bg-[hsl(var(--vnx-gold))]/15 text-[hsl(var(--vnx-gold))] border-[hsl(var(--vnx-gold))]/30",
                    failed: "bg-destructive/15 text-destructive border-destructive/30",
                  };
                  const typeBadge: Record<string, string> = {
                    deposit: "text-[hsl(var(--vnx-green))]",
                    withdraw: "text-destructive",
                    transfer: "text-accent",
                  };
                  const sign = tx.tx_type === "deposit" ? "+" : tx.tx_type === "withdraw" ? "−" : "";
                  return (
                    <div key={tx.id} className={`data-row ${flashedIds.has(tx.id) ? "row-flash" : ""}`}>
                      <div>
                        <p className={`font-semibold capitalize ${typeBadge[tx.tx_type] || ""}`}>{tx.tx_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(tx.created_at).toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold font-mono">
                          {sign}{Number(tx.amount).toFixed(4)} {tx.token_symbol}
                        </p>
                        <span className={`inline-block mt-1 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${statusStyles[tx.status] || "bg-muted/30 text-muted-foreground border-border/40"}`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p>No transactions yet</p>
              </div>
            )}
          </div>

          {/* Networks */}
          <div className="data-card mb-6 animate-slide-up stagger-6">
            <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Networks</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {["BNB Chain", "Ethereum", "Tron", "Bitcoin", "Fantom", "Solana"].map((network) => (
                <Button
                  key={network}
                  variant="outline"
                  className="justify-start rounded-xl hover-border-glow active-press h-12"
                >
                  {network}
                </Button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="data-card animate-slide-up">
            <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { label: "Trade Crypto", path: "/trade" },
                { label: "Stake VNX", path: "/stake" },
                { label: "View Markets", path: "/markets" },
                { label: "Swap Tokens", path: "/swap" },
              ].map((action) => (
                <Link key={action.path} to={action.path}>
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl hover-border-glow active-press h-12"
                  >
                    {action.label}
                  </Button>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />

      <DepositDialog
        open={depositOpen}
        onOpenChange={setDepositOpen}
        walletAddress={primaryWallet?.address || ""}
        walletChain={primaryWallet?.chain || "BNB Chain"}
      />
      <WithdrawDialog open={withdrawOpen} onOpenChange={setWithdrawOpen} />
      <TransferDialog open={transferOpen} onOpenChange={setTransferOpen} />
    </div>
    </PageTransition>
  );
};

export default WalletReal;
