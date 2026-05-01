import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatsCard from "@/components/StatsCard";
import { useVNXPrice } from "@/hooks/useVNXPrice";
import { useAuth } from "@/hooks/useAuth";
import { useWallets } from "@/hooks/useWallets";
import { useTransactions } from "@/hooks/useTransactions";
import { useOnChainBalances, type OnChainBalance } from "@/hooks/useOnChainBalances";
import { useSetPrimaryWallet } from "@/hooks/useSetPrimaryWallet";
import { useChainPrices } from "@/hooks/useChainPrices";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { DepositDialog, WithdrawDialog, TransferDialog } from "@/components/wallet/WalletActionDialogs";
import { ChainAccountCard } from "@/components/wallet/ChainAccountCard";

const CHAIN_ORDER = ["BNB Chain", "Ethereum", "Fantom", "Bitcoin", "Solana", "Tron"];

const Wallet = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: vnxPrice } = useVNXPrice();
  const { wallets, balances, loading: walletsLoading, flashedBalanceIds, updateWalletAddress } = useWallets();
  const { transactions, loading: transactionsLoading, flashedIds } = useTransactions();
  const setPrimary = useSetPrimaryWallet();
  const { data: chainPrices } = useChainPrices();

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [transferOpen, setTransferOpen] = useState(false);

  // On-chain balances (live RPC reads)
  const addressEntries = useMemo(
    () => wallets?.map((w) => ({ chain: w.chain, address: w.address })) ?? [],
    [wallets],
  );
  const { data: onChainBalances, isLoading: onChainLoading, refetch: refetchOnChain } =
    useOnChainBalances(addressEntries);

  // Index on-chain balances by chain for quick lookup
  const onChainByChain = useMemo(() => {
    const map = new Map<string, OnChainBalance>();
    (onChainBalances ?? []).forEach((b) => map.set(b.chain, b));
    return map;
  }, [onChainBalances]);

  // Sort wallets in fixed chain order
  const sortedWallets = useMemo(() => {
    if (!wallets) return [];
    return [...wallets].sort(
      (a, b) => CHAIN_ORDER.indexOf(a.chain) - CHAIN_ORDER.indexOf(b.chain),
    );
  }, [wallets]);

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

  const primaryWallet = sortedWallets.find((w) => w.is_primary) ?? sortedWallets[0];

  const copyAddress = () => {
    if (primaryWallet) {
      navigator.clipboard.writeText(primaryWallet.address);
      toast.success("Address copied to clipboard!");
    }
  };

  const shortAddress = primaryWallet
    ? primaryWallet.address.length > 16
      ? `${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`
      : primaryWallet.address
    : "No wallet";

  // Custodial DB total
  const custodialTotal = balances?.reduce((sum, b) => sum + Number(b.usd_value), 0) || 0;
  const vnxBalance = balances?.find((b) => b.token_symbol === "VNX");

  // Count of chains with non-zero on-chain balance
  const activeChains = (onChainBalances ?? []).filter(
    (b) => !b.placeholder && (b.native.balance > 0 || b.tokens.some((t) => t.balance > 0)),
  ).length;

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
              <p className="page-subtitle">Multi-chain wallet · 6 networks · Live on-chain balances</p>
            </div>
          </div>
        </section>

        <div className="section-container py-8">
          <div className="max-w-6xl mx-auto">

            {/* Wallet Overview Card */}
            <div className="card-modern mb-6 animate-slide-up stagger-1">
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl gradient-primary flex items-center justify-center shadow-glow">
                    <span className="text-primary-foreground font-bold text-xl">W</span>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Custodial Balance</p>
                    <p className="text-4xl font-bold" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                      ${custodialTotal.toFixed(2)}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {activeChains} active on-chain {activeChains === 1 ? "account" : "accounts"} · {sortedWallets.length} total
                    </p>
                  </div>
                </div>
                {primaryWallet && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyAddress}
                    className="rounded-xl hover-border-glow active-press font-mono text-xs"
                    title={`Primary: ${primaryWallet.chain}`}
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
            <div className="grid md:grid-cols-3 gap-5 mb-6">
              {[
                { label: "Networks", value: sortedWallets.length.toString(), change: `${activeChains} active` },
                { label: "VNX Holdings", value: vnxBalance ? Number(vnxBalance.balance).toLocaleString() : "0", change: `$${vnxBalance ? Number(vnxBalance.usd_value).toFixed(2) : "0.00"}` },
                { label: "VNX 24h", value: `+${vnxPrice?.change24h.toFixed(2) || "0.00"}%`, change: "Token price" },
              ].map((stat, i) => (
                <div key={i} className={`animate-slide-up stagger-${i + 2}`}>
                  <StatsCard label={stat.label} value={stat.value} change={stat.change} />
                </div>
              ))}
            </div>

            {/* Tabbed Content */}
            <Tabs defaultValue="accounts" className="w-full">
              <TabsList className="grid grid-cols-3 w-full mb-6 rounded-xl">
                <TabsTrigger value="accounts" className="rounded-lg">Accounts</TabsTrigger>
                <TabsTrigger value="custodial" className="rounded-lg">Custodial</TabsTrigger>
                <TabsTrigger value="activity" className="rounded-lg">Activity</TabsTrigger>
              </TabsList>

              {/* ─── ACCOUNTS: per-chain on-chain wallets ─────────────────── */}
              <TabsContent value="accounts" className="mt-0">
                <div className="data-card">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h2 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                        Multi-Chain Accounts
                      </h2>
                      <p className="text-xs text-muted-foreground mt-0.5">Live on-chain balances · refreshes every 60s</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => refetchOnChain()}
                      disabled={onChainLoading}
                      className="text-xs h-8"
                    >
                      {onChainLoading ? "Refreshing…" : "Refresh"}
                    </Button>
                  </div>

                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sortedWallets.map((w) => (
                      <ChainAccountCard
                        key={w.id}
                        walletId={w.id}
                        chain={w.chain}
                        address={w.address}
                        isPrimary={!!w.is_primary}
                        onChain={onChainByChain.get(w.chain)}
                        loading={onChainLoading}
                        prices={chainPrices}
                        onSetPrimary={() => setPrimary.mutate(w.id)}
                        onUpdateAddress={async (id, addr) => {
                          await updateWalletAddress.mutateAsync({ walletId: id, address: addr });
                        }}
                      />
                    ))}
                  </div>

                  {sortedWallets.some((w) => w.address.startsWith("pending")) && (
                    <div className="mt-5 p-3 rounded-xl bg-muted/30 border border-border/40 text-xs text-muted-foreground">
                      Some chain addresses are still being provisioned. Once an address is set, balances will appear automatically.
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ─── CUSTODIAL: VyronexVNX-managed balances ────────────────── */}
              <TabsContent value="custodial" className="mt-0">
                <div className="data-card">
                  <h2 className="text-xl font-bold mb-1" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                    Custodial Balances
                  </h2>
                  <p className="text-xs text-muted-foreground mb-5">
                    Held in the VyronexVNX exchange · used for trading, staking, and instant transfers
                  </p>

                  {balances && balances.length > 0 ? (
                    <div className="space-y-3">
                      {balances.map((balance, i) => (
                        <div
                          key={balance.id}
                          className={`data-row hover-scale-subtle ${flashedBalanceIds.has(balance.id) ? "row-flash" : ""}`}
                          style={{ animationDelay: `${i * 50}ms` }}
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                              <span className="font-bold text-primary text-sm">{balance.token_symbol.substring(0, 3)}</span>
                            </div>
                            <div>
                              <p className="font-semibold">{balance.token_symbol}</p>
                              <p className="text-sm text-muted-foreground">Custodial</p>
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
                      <p className="mb-1 font-medium">No custodial balances</p>
                      <p className="text-sm">Deposit funds or receive an internal transfer to get started.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              {/* ─── ACTIVITY: transaction history ─────────────────────────── */}
              <TabsContent value="activity" className="mt-0">
                <div className="data-card">
                  <h2 className="text-xl font-bold mb-5" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                    Recent Activity
                  </h2>
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
              </TabsContent>
            </Tabs>

            {/* Quick Actions */}
            <div className="data-card mt-6 animate-slide-up">
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

export default Wallet;
