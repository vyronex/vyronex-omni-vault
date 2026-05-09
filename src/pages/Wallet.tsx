import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { VaultPanel } from "@/components/wallet/VaultPanel";
import { ConnectExternalWallet } from "@/components/wallet/ConnectExternalWallet";
import { VIPSupportEscalation } from "@/components/wallet/VIPSupportEscalation";
import { NotificationCenter } from "@/components/wallet/NotificationCenter";

const CHAIN_ORDER = ["BNB Chain", "Ethereum", "Fantom", "Bitcoin", "Solana", "Tron"];
const EVM_CHAINS = new Set(["BNB Chain", "Ethereum", "Fantom"]);

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

  const addressEntries = useMemo(
    () => wallets?.map((w) => ({ chain: w.chain, address: w.address })) ?? [],
    [wallets],
  );
  const { data: onChainBalances, isLoading: onChainLoading, refetch: refetchOnChain } =
    useOnChainBalances(addressEntries);

  const onChainByChain = useMemo(() => {
    const map = new Map<string, OnChainBalance>();
    (onChainBalances ?? []).forEach((b) => map.set(b.chain, b));
    return map;
  }, [onChainBalances]);

  const sortedWallets = useMemo(() => {
    if (!wallets) return [];
    return [...wallets].sort(
      (a, b) => CHAIN_ORDER.indexOf(a.chain) - CHAIN_ORDER.indexOf(b.chain),
    );
  }, [wallets]);

  const evmWallets = useMemo(
    () => sortedWallets.filter((w) => EVM_CHAINS.has(w.chain)),
    [sortedWallets],
  );
  const solanaWallet = useMemo(() => sortedWallets.find((w) => w.chain === "Solana"), [sortedWallets]);
  const tronWallet = useMemo(() => sortedWallets.find((w) => w.chain === "Tron"), [sortedWallets]);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
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
      toast.success("Address copied");
    }
  };

  const shortAddress = primaryWallet
    ? primaryWallet.address.length > 16
      ? `${primaryWallet.address.slice(0, 6)}...${primaryWallet.address.slice(-4)}`
      : primaryWallet.address
    : "No wallet";

  const custodialTotal = balances?.reduce((s, b) => s + Number(b.usd_value), 0) || 0;
  const vnxBalance = balances?.find((b) => b.token_symbol === "VNX");
  const vnxAmount = vnxBalance ? Number(vnxBalance.balance) : 0;

  // Aggregate on-chain USD across chains
  const onChainTotalUsd = useMemo(() => {
    if (!chainPrices || !onChainBalances) return 0;
    return onChainBalances.reduce((sum, b) => {
      if (b.placeholder) return sum;
      const native = chainPrices.usdValue(b.native.symbol, b.native.balance);
      const tokens = b.tokens.reduce((s, t) => s + chainPrices.usdValue(t.symbol, t.balance), 0);
      return sum + native + tokens;
    }, 0);
  }, [onChainBalances, chainPrices]);

  const portfolioTotal = custodialTotal + onChainTotalUsd;

  const activeChains = (onChainBalances ?? []).filter(
    (b) => !b.placeholder && (b.native.balance > 0 || b.tokens.some((t) => t.balance > 0)),
  ).length;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />

        {/* ─── Compact Header ─── */}
        <section className="page-header">
          <div className="absolute inset-0 gradient-hero" />
          <div className="page-header-content">
            <div className="max-w-7xl mx-auto animate-slide-up">
              <span className="section-badge">Portfolio</span>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
                <div>
                  <h1 className="page-title">
                    My <span className="text-gradient">Wallet</span>
                  </h1>
                  <p className="page-subtitle">Custodial + On-chain · 6 networks · Live RPC reads</p>
                </div>
                <div className="flex items-end gap-6">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Total Portfolio</p>
                    <p className="text-3xl font-bold font-mono" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                      ${portfolioTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="hidden sm:block">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">VNX 24h</p>
                    <p className={`text-lg font-bold font-mono ${(vnxPrice?.change24h ?? 0) >= 0 ? "text-[hsl(var(--vnx-green))]" : "text-destructive"}`}>
                      {(vnxPrice?.change24h ?? 0) >= 0 ? "+" : ""}{vnxPrice?.change24h.toFixed(2) ?? "0.00"}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="section-container py-8">
          <div className="max-w-7xl mx-auto grid lg:grid-cols-[340px_1fr] gap-6">

            {/* ════════ LEFT RAIL ════════ */}
            <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              {/* Portfolio breakdown */}
              <div className="card-modern animate-slide-up">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                  Balance Breakdown
                </p>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground">Custodial</span>
                    <span className="text-sm font-bold font-mono">${custodialTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-muted-foreground">On-chain</span>
                    <span className="text-sm font-bold font-mono">${onChainTotalUsd.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-border/30 pt-2 flex justify-between items-baseline">
                    <span className="text-xs font-bold">Total</span>
                    <span className="text-base font-bold font-mono text-primary">${portfolioTotal.toFixed(2)}</span>
                  </div>
                </div>

                {primaryWallet && (
                  <button
                    onClick={copyAddress}
                    className="w-full p-2 rounded-lg bg-muted/30 border border-border/30 text-left hover:bg-muted/50 transition-colors mb-3"
                  >
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Primary · {primaryWallet.chain}</p>
                    <p className="font-mono text-xs truncate">{shortAddress}</p>
                  </button>
                )}

                <div className="grid grid-cols-3 gap-2">
                  <Button onClick={() => setWithdrawOpen(true)} className="rounded-xl gradient-primary shadow-glow active-press h-9 text-xs">Send</Button>
                  <Button onClick={() => setDepositOpen(true)} variant="outline" className="rounded-xl active-press h-9 text-xs">Receive</Button>
                  <Button onClick={() => setTransferOpen(true)} variant="outline" className="rounded-xl active-press h-9 text-xs">Transfer</Button>
                </div>
              </div>

              {/* Quick stats */}
              <div className="grid grid-cols-3 gap-2 animate-slide-up stagger-1">
                <div className="p-3 rounded-xl bg-card border border-border/40 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Networks</p>
                  <p className="text-base font-bold font-mono mt-0.5">{sortedWallets.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/40 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Active</p>
                  <p className="text-base font-bold font-mono mt-0.5 text-[hsl(var(--vnx-green))]">{activeChains}</p>
                </div>
                <div className="p-3 rounded-xl bg-card border border-border/40 text-center">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground">VNX</p>
                  <p className="text-base font-bold font-mono mt-0.5 text-primary">{vnxAmount > 999 ? `${(vnxAmount / 1000).toFixed(1)}K` : vnxAmount.toFixed(0)}</p>
                </div>
              </div>

              {/* Real wallet connect */}
              <div className="animate-slide-up stagger-2">
                <ConnectExternalWallet
                  evmWallets={evmWallets}
                  solanaWallet={solanaWallet}
                  tronWallet={tronWallet}
                  onApply={async (walletId, address) => {
                    await updateWalletAddress.mutateAsync({ walletId, address });
                  }}
                />
              </div>

              {/* VIP escalation */}
              <div className="animate-slide-up stagger-3">
                <VIPSupportEscalation vnxBalance={vnxAmount} userEmail={user.email} />
              </div>

              {/* Quick links */}
              <div className="p-3 rounded-2xl bg-card border border-border/40 animate-slide-up stagger-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-2">Quick Links</p>
                <div className="grid grid-cols-2 gap-1">
                  {[
                    { label: "Trade", path: "/trade" },
                    { label: "Spot", path: "/spot" },
                    { label: "Stake", path: "/stake" },
                    { label: "Markets", path: "/markets" },
                  ].map((a) => (
                    <Link key={a.path} to={a.path}>
                      <Button variant="ghost" size="sm" className="w-full justify-start h-8 text-xs hover:text-primary">
                        {a.label}
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </aside>

            {/* ════════ RIGHT MAIN ════════ */}
            <main>
              <Tabs defaultValue="accounts" className="w-full">
                <TabsList className="grid grid-cols-4 w-full mb-5 rounded-xl">
                  <TabsTrigger value="accounts" className="rounded-lg">Accounts</TabsTrigger>
                  <TabsTrigger value="vault" className="rounded-lg">Vault</TabsTrigger>
                  <TabsTrigger value="custodial" className="rounded-lg">Custodial</TabsTrigger>
                  <TabsTrigger value="activity" className="rounded-lg">Activity</TabsTrigger>
                </TabsList>

                {/* ─── ACCOUNTS ─── */}
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

                    <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
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
                        Some chain addresses are still being provisioned. Connect your external wallet from the side panel to auto-fill EVM accounts.
                      </div>
                    )}
                  </div>
                </TabsContent>

                {/* ─── VAULT ─── */}
                <TabsContent value="vault" className="mt-0">
                  <VaultPanel prices={chainPrices} />
                </TabsContent>

                {/* ─── CUSTODIAL ─── */}
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

                {/* ─── ACTIVITY ─── */}
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
                                {chainPrices && (
                                  <p className="text-[10px] text-muted-foreground font-mono">
                                    ≈ ${chainPrices.usdValue(tx.token_symbol, Number(tx.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                  </p>
                                )}
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
            </main>

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
