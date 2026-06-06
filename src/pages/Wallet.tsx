import { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
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

type SectionKey = "overview" | "chains" | "custodial" | "vault" | "activity" | "connect";

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
  const [section, setSection] = useState<SectionKey>("overview");

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

  const primaryWallet = sortedWallets.find((w) => w.is_primary) ?? sortedWallets[0];

  const custodialTotal = balances?.reduce((s, b) => s + Number(b.usd_value), 0) || 0;
  const vnxBalance = balances?.find((b) => b.token_symbol === "VNX");
  const vnxAmount = vnxBalance ? Number(vnxBalance.balance) : 0;

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

  const copyAddress = () => {
    if (primaryWallet) {
      navigator.clipboard.writeText(primaryWallet.address);
      toast.success("Address copied");
    }
  };

  const shortAddress = primaryWallet
    ? primaryWallet.address.length > 16
      ? `${primaryWallet.address.slice(0, 6)}…${primaryWallet.address.slice(-4)}`
      : primaryWallet.address
    : "No wallet";

  const sections: { key: SectionKey; label: string; count?: number | string }[] = [
    { key: "overview", label: "Overview" },
    { key: "chains", label: "Chains", count: sortedWallets.length },
    { key: "custodial", label: "Custodial", count: balances?.length ?? 0 },
    { key: "vault", label: "Vault" },
    { key: "activity", label: "Activity", count: transactions?.length ?? 0 },
    { key: "connect", label: "Connect" },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />

        {/* ═══════════ HERO BAR ═══════════ */}
        <section className="border-b border-border/30 bg-card/20">
          <div className="section-container py-5">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col lg:flex-row lg:items-center gap-5">
                {/* Balance hero */}
                <div className="flex-1 min-w-0">
                  <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-1">
                    Total Portfolio · Live
                  </p>
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <h1
                      className="text-4xl md:text-5xl font-bold font-mono leading-none"
                      style={{ fontFamily: "'Space Grotesk', system-ui" }}
                    >
                      ${portfolioTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h1>
                    <span
                      className={`text-sm font-bold font-mono px-2 py-0.5 rounded-md ${
                        (vnxPrice?.change24h ?? 0) >= 0
                          ? "bg-[hsl(var(--vnx-green))]/15 text-[hsl(var(--vnx-green))]"
                          : "bg-destructive/15 text-destructive"
                      }`}
                    >
                      VNX {(vnxPrice?.change24h ?? 0) >= 0 ? "+" : ""}{vnxPrice?.change24h?.toFixed(2) ?? "0.00"}%
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
                    <span>Custodial <span className="font-mono text-foreground">${custodialTotal.toFixed(2)}</span></span>
                    <span>·</span>
                    <span>On-chain <span className="font-mono text-foreground">${onChainTotalUsd.toFixed(2)}</span></span>
                    <span>·</span>
                    <span>VNX <span className="font-mono text-foreground">{vnxAmount.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span></span>
                  </div>
                </div>

                {/* Primary address pill */}
                {primaryWallet && (
                  <button
                    onClick={copyAddress}
                    className="text-left px-4 py-2.5 rounded-xl bg-muted/30 border border-border/40 hover:border-primary/40 transition-colors"
                  >
                    <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
                      Primary · {primaryWallet.chain}
                    </p>
                    <p className="font-mono text-xs mt-0.5">{shortAddress}</p>
                    <p className="text-[9px] uppercase tracking-wider text-primary mt-0.5">Tap to copy</p>
                  </button>
                )}

                {/* Quick actions */}
                <div className="grid grid-cols-3 gap-2 lg:w-[280px]">
                  <Button
                    onClick={() => setWithdrawOpen(true)}
                    className="rounded-xl gradient-primary shadow-glow active-press h-11 text-xs font-bold"
                  >
                    Send
                  </Button>
                  <Button
                    onClick={() => setDepositOpen(true)}
                    variant="outline"
                    className="rounded-xl active-press h-11 text-xs font-bold"
                  >
                    Receive
                  </Button>
                  <Button
                    onClick={() => setTransferOpen(true)}
                    variant="outline"
                    className="rounded-xl active-press h-11 text-xs font-bold"
                  >
                    Transfer
                  </Button>
                </div>
              </div>

              {/* Stat strip */}
              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="px-3 py-2 rounded-lg bg-background/60 border border-border/40">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Networks</p>
                  <p className="text-base font-bold font-mono mt-0.5">{sortedWallets.length}</p>
                </div>
                <div className="px-3 py-2 rounded-lg bg-background/60 border border-border/40">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Active</p>
                  <p className="text-base font-bold font-mono mt-0.5 text-[hsl(var(--vnx-green))]">{activeChains}</p>
                </div>
                <div className="px-3 py-2 rounded-lg bg-background/60 border border-border/40">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">VNX Price</p>
                  <p className="text-base font-bold font-mono mt-0.5">${vnxPrice?.priceUsd?.toFixed(4) ?? "—"}</p>
                </div>
                <div className="px-3 py-2 rounded-lg bg-background/60 border border-border/40">
                  <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">Recent Tx</p>
                  <p className="text-base font-bold font-mono mt-0.5">{transactions?.length ?? 0}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ SECTION TABS (text pills, no icons) ═══════════ */}
        <div className="sticky top-[57px] z-30 border-b border-border/30 bg-background/85 backdrop-blur-xl">
          <div className="section-container">
            <div className="max-w-7xl mx-auto overflow-x-auto">
              <div className="flex gap-1 py-2 min-w-max">
                {sections.map((s) => (
                  <button
                    key={s.key}
                    onClick={() => setSection(s.key)}
                    className={`px-3.5 h-8 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                      section === s.key
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/40"
                    }`}
                    style={{ fontFamily: "'Space Grotesk', system-ui" }}
                  >
                    {s.label}
                    {s.count !== undefined && (
                      <span className="ml-1.5 opacity-70 font-mono">{s.count}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════ BENTO BODY ═══════════ */}
        <div className="section-container py-6">
          <div className="max-w-7xl mx-auto">

            {/* ─── OVERVIEW: bento grid ─── */}
            {section === "overview" && (
              <div className="grid grid-cols-12 gap-4 animate-slide-up">
                {/* Top chains by USD (large tile) */}
                <div className="col-span-12 lg:col-span-8 data-card">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                        Chain Snapshot
                      </h2>
                      <p className="text-[11px] text-muted-foreground">Live on-chain reads · refresh every 60s</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => refetchOnChain()} disabled={onChainLoading} className="h-8 text-xs">
                      {onChainLoading ? "Refreshing…" : "Refresh"}
                    </Button>
                  </div>
                  <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
                    {sortedWallets.slice(0, 6).map((w) => (
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
                </div>

                {/* VIP escalation tile */}
                <div className="col-span-12 lg:col-span-4">
                  <VIPSupportEscalation vnxBalance={vnxAmount} userEmail={user.email} />
                </div>

                {/* Custodial mini */}
                <div className="col-span-12 md:col-span-6 lg:col-span-5 data-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                      Custodial
                    </h3>
                    <button
                      onClick={() => setSection("custodial")}
                      className="text-[10px] uppercase tracking-wider font-bold text-primary"
                    >
                      View all
                    </button>
                  </div>
                  {balances && balances.length > 0 ? (
                    <div className="space-y-2">
                      {balances.slice(0, 4).map((b) => (
                        <div
                          key={b.id}
                          className={`flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20 border border-border/30 ${
                            flashedBalanceIds.has(b.id) ? "row-flash" : ""
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {b.token_symbol.slice(0, 3)}
                            </span>
                            <span className="text-xs font-semibold">{b.token_symbol}</span>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-mono font-bold">{Number(b.balance).toLocaleString(undefined, { maximumFractionDigits: 4 })}</p>
                            <p className="text-[10px] font-mono text-muted-foreground">${Number(b.usd_value).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-6 text-center">No custodial balances yet.</p>
                  )}
                </div>

                {/* Recent activity mini */}
                <div className="col-span-12 md:col-span-6 lg:col-span-7 data-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                      Recent Activity
                    </h3>
                    <button
                      onClick={() => setSection("activity")}
                      className="text-[10px] uppercase tracking-wider font-bold text-primary"
                    >
                      View all
                    </button>
                  </div>
                  {transactionsLoading ? (
                    <div className="flex justify-center py-8"><div className="h-6 w-6 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
                  ) : transactions && transactions.length > 0 ? (
                    <div className="space-y-2">
                      {transactions.slice(0, 5).map((tx) => {
                        const sign = tx.tx_type === "deposit" ? "+" : tx.tx_type === "withdraw" ? "−" : "";
                        const toneTx =
                          tx.tx_type === "deposit" ? "text-[hsl(var(--vnx-green))]" :
                          tx.tx_type === "withdraw" ? "text-destructive" : "text-accent";
                        return (
                          <div key={tx.id} className={`flex items-center justify-between px-3 py-2 rounded-lg bg-muted/20 border border-border/30 ${flashedIds.has(tx.id) ? "row-flash" : ""}`}>
                            <div>
                              <p className={`text-xs font-bold capitalize ${toneTx}`}>{tx.tx_type}</p>
                              <p className="text-[10px] text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-mono font-bold">{sign}{Number(tx.amount).toFixed(4)} {tx.token_symbol}</p>
                              <span className={`text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded border ${
                                tx.status === "confirmed" ? "border-[hsl(var(--vnx-green))]/40 text-[hsl(var(--vnx-green))]" :
                                tx.status === "pending" ? "border-[hsl(var(--vnx-gold))]/40 text-[hsl(var(--vnx-gold))]" :
                                "border-destructive/40 text-destructive"
                              }`}>{tx.status}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-muted-foreground py-6 text-center">No transactions yet.</p>
                  )}
                </div>

                {/* Notifications */}
                <div className="col-span-12 lg:col-span-6">
                  <NotificationCenter />
                </div>

                {/* Connect external wallet */}
                <div className="col-span-12 lg:col-span-6">
                  <ConnectExternalWallet
                    evmWallets={evmWallets}
                    solanaWallet={solanaWallet}
                    tronWallet={tronWallet}
                    onApply={async (walletId, address) => {
                      await updateWalletAddress.mutateAsync({ walletId, address });
                    }}
                  />
                </div>

                {/* Quick links */}
                <div className="col-span-12 data-card">
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground mb-2">Jump to</p>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {[
                      { label: "Trade", path: "/trade" },
                      { label: "Spot", path: "/spot" },
                      { label: "Futures", path: "/futures" },
                      { label: "Stake", path: "/stake" },
                      { label: "Markets", path: "/markets" },
                      { label: "Listings", path: "/listings" },
                    ].map((a) => (
                      <Link key={a.path} to={a.path}>
                        <Button variant="outline" size="sm" className="w-full h-9 text-xs font-bold rounded-lg hover:bg-primary/10 hover:border-primary/40">
                          {a.label}
                        </Button>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ─── CHAINS ─── */}
            {section === "chains" && (
              <div className="data-card animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                      Multi-Chain Accounts
                    </h2>
                    <p className="text-[11px] text-muted-foreground">Live on-chain balances · {sortedWallets.length} networks</p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => refetchOnChain()} disabled={onChainLoading} className="h-8 text-xs">
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
                    Some chain addresses are still being provisioned. Use the Connect tab to auto-fill EVM accounts from your external wallet.
                  </div>
                )}
              </div>
            )}

            {/* ─── CUSTODIAL ─── */}
            {section === "custodial" && (
              <div className="data-card animate-slide-up">
                <h2 className="text-lg font-bold mb-1" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Custodial Balances</h2>
                <p className="text-[11px] text-muted-foreground mb-4">
                  Held in the VyronexVNX exchange · used for trading, staking, and instant transfers
                </p>
                {balances && balances.length > 0 ? (
                  <div className="space-y-2.5">
                    {balances.map((balance) => (
                      <div
                        key={balance.id}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl bg-muted/20 border border-border/30 hover-scale-subtle ${
                          flashedBalanceIds.has(balance.id) ? "row-flash" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                            <span className="font-bold text-primary text-xs">{balance.token_symbol.slice(0, 3)}</span>
                          </div>
                          <div>
                            <p className="text-sm font-bold">{balance.token_symbol}</p>
                            <p className="text-[11px] text-muted-foreground">Custodial</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono font-bold">{Number(balance.balance).toLocaleString(undefined, { maximumFractionDigits: 6 })}</p>
                          <p className="text-[11px] font-mono text-muted-foreground">${Number(balance.usd_value).toFixed(2)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="mb-1 font-bold">No custodial balances</p>
                    <p className="text-xs">Deposit funds or receive an internal transfer to get started.</p>
                  </div>
                )}
              </div>
            )}

            {/* ─── VAULT ─── */}
            {section === "vault" && (
              <div className="animate-slide-up">
                <VaultPanel prices={chainPrices} />
              </div>
            )}

            {/* ─── ACTIVITY ─── */}
            {section === "activity" && (
              <div className="data-card animate-slide-up">
                <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Recent Activity</h2>
                {transactionsLoading ? (
                  <div className="flex justify-center py-12"><div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" /></div>
                ) : transactions && transactions.length > 0 ? (
                  <div className="space-y-2.5">
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
                        <div key={tx.id} className={`flex items-center justify-between px-4 py-3 rounded-xl bg-muted/20 border border-border/30 ${flashedIds.has(tx.id) ? "row-flash" : ""}`}>
                          <div>
                            <p className={`text-sm font-bold capitalize ${typeBadge[tx.tx_type] || ""}`}>{tx.tx_type}</p>
                            <p className="text-[11px] text-muted-foreground">{new Date(tx.created_at).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-mono font-bold">{sign}{Number(tx.amount).toFixed(4)} {tx.token_symbol}</p>
                            {chainPrices && (
                              <p className="text-[10px] text-muted-foreground font-mono">
                                ≈ ${chainPrices.usdValue(tx.token_symbol, Number(tx.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </p>
                            )}
                            <span className={`inline-block mt-1 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${statusStyles[tx.status] || "bg-muted/30 text-muted-foreground border-border/40"}`}>
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
            )}

            {/* ─── CONNECT ─── */}
            {section === "connect" && (
              <div className="grid lg:grid-cols-2 gap-4 animate-slide-up">
                <ConnectExternalWallet
                  evmWallets={evmWallets}
                  solanaWallet={solanaWallet}
                  tronWallet={tronWallet}
                  onApply={async (walletId, address) => {
                    await updateWalletAddress.mutateAsync({ walletId, address });
                  }}
                />
                <div className="space-y-4">
                  <NotificationCenter />
                  <VIPSupportEscalation vnxBalance={vnxAmount} userEmail={user.email} />
                </div>
              </div>
            )}

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
