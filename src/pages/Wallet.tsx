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
import { DepositDialog, TransferDialog } from "@/components/wallet/WalletActionDialogs";
import { WithdrawDialogV2 } from "@/components/wallet/WithdrawDialogV2";
import { WithdrawalHistory } from "@/components/wallet/WithdrawalHistory";
import { ChainAccountCard } from "@/components/wallet/ChainAccountCard";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { VaultPanel } from "@/components/wallet/VaultPanel";
import { ConnectExternalWallet } from "@/components/wallet/ConnectExternalWallet";
import { VIPSupportEscalation } from "@/components/wallet/VIPSupportEscalation";
import { NotificationCenter } from "@/components/wallet/NotificationCenter";
import { useListingPrices } from "@/hooks/useListingPrices";
import { useMarketData } from "@/hooks/useCoinGecko";


const CHAIN_ORDER = ["BNB Chain", "Ethereum", "Fantom", "Bitcoin", "Solana", "Tron"];
const EVM_CHAINS = new Set(["BNB Chain", "Ethereum", "Fantom"]);

type SectionKey = "overview" | "chains" | "tokens" | "custodial" | "vault" | "activity" | "connect";

const Wallet = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { data: vnxPrice } = useVNXPrice();
  const { wallets, balances, loading: walletsLoading, flashedBalanceIds, updateWalletAddress } = useWallets();
  const { transactions, loading: transactionsLoading, flashedIds } = useTransactions();
  const setPrimary = useSetPrimaryWallet();
  const { data: chainPrices } = useChainPrices();
  const { data: listingPrices } = useListingPrices();

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

  // Auto-provision real on-chain addresses for any wallet still showing "pending..."
  const queryClient = useQueryClient();
  const [provisioning, setProvisioning] = useState(false);
  useEffect(() => {
    if (!user || !wallets) return;
    const hasPending = wallets.some((w) => w.address?.startsWith("pending"));
    if (!hasPending || provisioning) return;
    setProvisioning(true);
    supabase.functions
      .invoke("provision-addresses", { body: {} })
      .then(({ data, error }) => {
        if (error) {
          toast.error("Could not provision addresses");
          return;
        }
        const count = data?.provisioned?.length ?? 0;
        if (count > 0) {
          toast.success(`Provisioned ${count} on-chain address${count === 1 ? "" : "es"}`);
          queryClient.invalidateQueries({ queryKey: ["wallets", user.id] });
          queryClient.invalidateQueries({ queryKey: ["onchain-balances"] });
        }
      })
      .finally(() => setProvisioning(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, wallets]);

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
    { key: "overview", label: "Tokens" },
    { key: "chains", label: "Chains", count: sortedWallets.length },
    { key: "tokens", label: "Token List", count: listingPrices?.length ?? 0 },
    { key: "activity", label: "Activity", count: transactions?.length ?? 0 },
    { key: "vault", label: "Vault" },
    { key: "custodial", label: "Exchange", count: balances?.length ?? 0 },
    { key: "connect", label: "Connect" },
  ];

  // Unified asset list: custodial balances + on-chain native + on-chain tokens
  type AssetRow = {
    key: string;
    symbol: string;
    source: "Exchange" | string;
    amount: number;
    usd: number;
    flashId?: string;
  };
  const assets: AssetRow[] = [];
  (balances ?? []).forEach((b) => {
    assets.push({
      key: `cust-${b.id}`,
      symbol: b.token_symbol,
      source: "Exchange",
      amount: Number(b.balance),
      usd: Number(b.usd_value),
      flashId: b.id,
    });
  });
  (onChainBalances ?? []).forEach((b) => {
    if (b.placeholder) return;
    if (b.native.balance > 0) {
      assets.push({
        key: `${b.chain}-native`,
        symbol: b.native.symbol,
        source: b.chain,
        amount: b.native.balance,
        usd: chainPrices ? chainPrices.usdValue(b.native.symbol, b.native.balance) : 0,
      });
    }
    b.tokens.forEach((t) => {
      if (t.balance <= 0) return;
      assets.push({
        key: `${b.chain}-${t.address}`,
        symbol: t.symbol,
        source: b.chain,
        amount: t.balance,
        usd: chainPrices ? chainPrices.usdValue(t.symbol, t.balance) : 0,
      });
    });
  });
  assets.sort((a, b) => b.usd - a.usd);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />

        {/* ═══════════ WALLET HEADER (centered balance + actions) ═══════════ */}
        <section className="border-b border-border/30 bg-gradient-to-b from-card/40 to-background">
          <div className="section-container py-8">
            <div className="max-w-2xl mx-auto text-center">
              {primaryWallet && (
                <button
                  onClick={copyAddress}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/40 border border-border/40 hover:border-primary/40 transition-colors mb-5"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-[hsl(var(--vnx-green))]" />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
                    {primaryWallet.chain}
                  </span>
                  <span className="font-mono text-xs text-foreground">{shortAddress}</span>
                  <span className="text-[9px] uppercase tracking-wider text-primary">Copy</span>
                </button>
              )}

              <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2">
                Total Balance
              </p>
              <h1
                className="text-5xl md:text-6xl font-bold font-mono leading-none"
                style={{ fontFamily: "'Space Grotesk', system-ui" }}
              >
                ${portfolioTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h1>
              <div className="mt-3 inline-flex items-center gap-2 flex-wrap justify-center text-[11px] text-muted-foreground">
                <span>Exchange <span className="font-mono text-foreground">${custodialTotal.toFixed(2)}</span></span>
                <span>·</span>
                <span>On-chain <span className="font-mono text-foreground">${onChainTotalUsd.toFixed(2)}</span></span>
                <span>·</span>
                <span className={`font-mono ${(vnxPrice?.change24h ?? 0) >= 0 ? "text-[hsl(var(--vnx-green))]" : "text-destructive"}`}>
                  VNX {(vnxPrice?.change24h ?? 0) >= 0 ? "+" : ""}{vnxPrice?.change24h?.toFixed(2) ?? "0.00"}%
                </span>
              </div>

              <div className="mt-6 grid grid-cols-4 gap-3 max-w-md mx-auto">
                {[
                  { label: "Send", onClick: () => setWithdrawOpen(true), primary: true },
                  { label: "Receive", onClick: () => setDepositOpen(true) },
                  { label: "Swap", onClick: () => navigate("/swap") },
                  { label: "Transfer", onClick: () => setTransferOpen(true) },
                ].map((a) => (
                  <button
                    key={a.label}
                    onClick={a.onClick}
                    className="flex flex-col items-center gap-2 group active-press"
                  >
                    <span
                      className={`h-12 w-12 rounded-full flex items-center justify-center text-[10px] font-bold uppercase tracking-wider transition-all ${
                        a.primary
                          ? "gradient-primary text-primary-foreground shadow-glow"
                          : "bg-muted/40 border border-border/40 text-foreground group-hover:border-primary/40 group-hover:bg-primary/10"
                      }`}
                      style={{ fontFamily: "'Space Grotesk', system-ui" }}
                    >
                      {a.label.slice(0, 4)}
                    </span>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground group-hover:text-foreground">
                      {a.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════ SECTION TABS ═══════════ */}
        <div className="sticky top-[57px] z-30 border-b border-border/30 bg-background/85 backdrop-blur-xl">
          <div className="section-container">
            <div className="max-w-3xl mx-auto overflow-x-auto">
              <div className="flex gap-1 py-2 min-w-max justify-center">
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

        {/* ═══════════ BODY ═══════════ */}
        <div className="section-container py-6">
          <div className="max-w-3xl mx-auto">

            {/* ─── TOKENS: unified asset list ─── */}
            {section === "overview" && (
              <div className="animate-slide-up space-y-3">
                <div className="flex items-center justify-between px-1">
                  <div>
                    <h2 className="text-base font-bold" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                      My Assets
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      {assets.length} {assets.length === 1 ? "holding" : "holdings"} · Exchange + on-chain
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => refetchOnChain()} disabled={onChainLoading} className="h-8 text-xs">
                    {onChainLoading ? "Refreshing…" : "Refresh"}
                  </Button>
                </div>


                {assets.length === 0 ? (
                  <div className="data-card text-center py-16">
                    <p className="font-bold mb-1">No assets yet</p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Deposit to the Exchange or fund any on-chain account to get started.
                    </p>
                    <div className="flex justify-center gap-2">
                      <Button size="sm" onClick={() => setDepositOpen(true)} className="gradient-primary">Receive</Button>
                      <Button size="sm" variant="outline" onClick={() => setSection("chains")}>View Chains</Button>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border/40 bg-card/30 divide-y divide-border/30 overflow-hidden">
                    {assets.map((a) => (
                      <div
                        key={a.key}
                        className={`flex items-center justify-between px-4 py-3.5 hover:bg-muted/20 transition-colors ${
                          a.flashId && flashedBalanceIds.has(a.flashId) ? "row-flash" : ""
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-[10px] font-bold text-primary">{a.symbol.slice(0, 4)}</span>
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-bold truncate">{a.symbol}</p>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground truncate">
                              {a.source}
                            </p>
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm font-mono font-bold">
                            {a.amount.toLocaleString(undefined, { maximumFractionDigits: 6 })}
                          </p>
                          <p className="text-[11px] font-mono text-muted-foreground">
                            ${a.usd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {transactions && transactions.length > 0 && (
                  <div className="pt-2">
                    <div className="flex items-center justify-between px-1 mb-2">
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
                    <div className="rounded-2xl border border-border/40 bg-card/30 divide-y divide-border/30 overflow-hidden">
                      {transactions.slice(0, 4).map((tx) => {
                        const sign = tx.tx_type === "deposit" ? "+" : tx.tx_type === "withdraw" ? "−" : "";
                        const toneTx =
                          tx.tx_type === "deposit" ? "text-[hsl(var(--vnx-green))]" :
                          tx.tx_type === "withdraw" ? "text-destructive" : "text-accent";
                        return (
                          <div key={tx.id} className={`flex items-center justify-between px-4 py-3 ${flashedIds.has(tx.id) ? "row-flash" : ""}`}>
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
                  </div>
                )}
              </div>
            )}

            {/* ─── TOKEN LIST (approved listings) ─── */}
            {section === "tokens" && (
              <div className="data-card animate-slide-up">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                      Listed Tokens
                    </h2>
                    <p className="text-[11px] text-muted-foreground">
                      {listingPrices?.length ?? 0} approved · live prices · per-chain contracts
                    </p>
                  </div>
                </div>
                {!listingPrices || listingPrices.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground text-sm">
                    No approved listings yet.
                  </div>
                ) : (
                  <div className="rounded-2xl border border-border/40 bg-card/30 divide-y divide-border/30 overflow-hidden">
                    {listingPrices.map((row) => {
                      const addr = row.listing.contract_address;
                      const short = addr ? `${addr.slice(0, 6)}…${addr.slice(-4)}` : "—";
                      const tone = row.change24h >= 0 ? "text-[hsl(var(--vnx-green))]" : "text-destructive";
                      const srcStyle =
                        row.source === "coingecko"
                          ? "border-[hsl(var(--vnx-green))]/40 text-[hsl(var(--vnx-green))]"
                          : row.source === "dexscreener"
                          ? "border-accent/40 text-accent"
                          : "border-border/40 text-muted-foreground";
                      return (
                        <div
                          key={row.listing.id}
                          className="flex items-center justify-between px-4 py-3 hover:bg-muted/20 transition-colors gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {row.listing.logo_url ? (
                              <img src={row.listing.logo_url} alt={row.listing.token_symbol} className="h-9 w-9 rounded-full" />
                            ) : (
                              <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
                                <span className="text-[10px] font-bold text-primary">{row.listing.token_symbol.slice(0, 4)}</span>
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="text-sm font-bold">{row.listing.token_symbol}</p>
                              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                                <span className="uppercase tracking-wider">{row.listing.chain}</span>
                                <span>·</span>
                                <button
                                  className="font-mono hover:text-primary truncate max-w-[140px]"
                                  title={addr}
                                  onClick={() => {
                                    if (!addr) return;
                                    navigator.clipboard.writeText(addr);
                                    toast.success("Contract copied");
                                  }}
                                >
                                  {short}
                                </button>
                              </div>
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-mono font-bold">
                              {row.price > 0
                                ? `$${row.price < 1 ? row.price.toPrecision(4) : row.price.toLocaleString()}`
                                : "—"}
                            </p>
                            <div className="flex items-center justify-end gap-1.5 mt-0.5">
                              <span className={`text-[10px] font-mono font-bold ${tone}`}>
                                {row.change24h >= 0 ? "+" : ""}{row.change24h?.toFixed(2)}%
                              </span>
                              <span className={`text-[8px] uppercase tracking-wider font-bold px-1 py-0.5 rounded border ${srcStyle}`}>
                                {row.source === "none" ? "—" : row.source}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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
                <div className="mt-6 pt-6 border-t border-border/30">
                  <h3 className="text-sm font-bold mb-3 uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Withdrawal Requests</h3>
                  <WithdrawalHistory />
                </div>
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
        <WithdrawDialogV2 open={withdrawOpen} onOpenChange={setWithdrawOpen} />
        <TransferDialog open={transferOpen} onOpenChange={setTransferOpen} />
      </div>
    </PageTransition>
  );
};

export default Wallet;
