import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { SWAP_CHAINS, getChain } from "@/lib/swapTokens";
import { useSwapQuote, useInternalSwap } from "@/hooks/useSwapQuote";
import { useWalletConnect } from "@/hooks/useWalletConnect";
import { useWallets } from "@/hooks/useWallets";
import { useChainPrices } from "@/hooks/useChainPrices";
import { useAuth } from "@/hooks/useAuth";
import { useQueryClient } from "@tanstack/react-query";
import {
  insertSwapRecord,
  updateSwapRecord,
  pollTxStatus,
  type SwapRecord,
} from "@/hooks/useSwapHistory";
import { SwapReceiptDialog } from "@/components/swap/SwapReceiptDialog";
import { SwapHistoryList } from "@/components/swap/SwapHistoryList";

const HEADING = { fontFamily: "'Space Grotesk', system-ui" };
const CUSTODIAL_TOKENS = ["BNB", "ETH", "BTC", "SOL", "USDT", "USDC", "VNX", "MATIC", "TRX", "FTM"];
const SLIPPAGE_PRESETS = [0.5, 1, 2, 5];

type ImpactLevel = "low" | "medium" | "high" | "severe";
const impactLevel = (impactPct: number): ImpactLevel => {
  const a = Math.abs(impactPct);
  if (a < 1) return "low";
  if (a < 3) return "medium";
  if (a < 5) return "high";
  return "severe";
};

const IMPACT_META: Record<ImpactLevel, { label: string; cls: string }> = {
  low: { label: "Low impact", cls: "border-emerald-400/30 bg-emerald-400/5 text-emerald-300" },
  medium: { label: "Moderate impact — review carefully", cls: "border-amber-400/30 bg-amber-400/5 text-amber-300" },
  high: { label: "High price impact — you may lose value", cls: "border-orange-400/40 bg-orange-400/10 text-orange-300" },
  severe: { label: "Severe price impact — likely loss, confirm twice", cls: "border-red-500/40 bg-red-500/10 text-red-300" },
};

const SlippageControl = ({ value, onChange }: { value: number; onChange: (v: number) => void }) => {
  const [custom, setCustom] = useState("");
  const isPreset = SLIPPAGE_PRESETS.includes(value);
  return (
    <div className="flex items-center justify-between text-xs gap-2 flex-wrap">
      <span className="text-muted-foreground uppercase tracking-wider">Slippage</span>
      <div className="flex gap-1 items-center">
        {SLIPPAGE_PRESETS.map((s) => (
          <button
            key={s}
            onClick={() => { onChange(s); setCustom(""); }}
            className={`px-2.5 py-1 rounded-md border text-xs ${value === s && isPreset ? "border-primary text-primary bg-primary/10" : "border-border/40 text-muted-foreground hover:text-foreground"}`}
          >
            {s}%
          </button>
        ))}
        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-md border ${!isPreset ? "border-primary text-primary bg-primary/10" : "border-border/40"}`}>
          <input
            type="number"
            inputMode="decimal"
            placeholder="custom"
            value={custom}
            onChange={(e) => {
              setCustom(e.target.value);
              const n = Number(e.target.value);
              if (Number.isFinite(n) && n > 0 && n <= 50) onChange(n);
            }}
            className="w-14 bg-transparent text-xs outline-none text-right"
          />
          <span className="text-[10px] text-muted-foreground">%</span>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// DEX (on-chain) swap panel
// ─────────────────────────────────────────────────────────────────────────────
function DexSwap() {
  const { user } = useAuth();
  const wc = useWalletConnect();
  const [chainId, setChainId] = useState<number>(56);
  const chain = useMemo(() => getChain(chainId), [chainId]);
  const [fromAddr, setFromAddr] = useState(chain.tokens[0].address);
  const [toAddr, setToAddr] = useState(chain.tokens[1].address);
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(1);
  const [executing, setExecuting] = useState(false);
  const [confirmHighImpact, setConfirmHighImpact] = useState(false);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receipt, setReceipt] = useState<SwapRecord | null>(null);
  const [timeline, setTimeline] = useState<Array<{ label: string; at: number }>>([]);

  useEffect(() => {
    setFromAddr(chain.tokens[0].address);
    setToAddr(chain.tokens[1].address);
    setConfirmHighImpact(false);
  }, [chainId]);

  useEffect(() => { setConfirmHighImpact(false); }, [fromAddr, toAddr, amount]);

  const fromTok = chain.tokens.find((t) => t.address === fromAddr) ?? chain.tokens[0];
  const toTok = chain.tokens.find((t) => t.address === toAddr) ?? chain.tokens[1];

  const quote = useSwapQuote({
    chainId,
    inTokenAddress: fromAddr,
    outTokenAddress: toAddr,
    amount: amount || "0",
    slippage,
  });

  const outAmount = useMemo(() => {
    const out = quote.data?.outAmount;
    if (!out) return "";
    return (Number(out) / Math.pow(10, toTok.decimals)).toFixed(6);
  }, [quote.data, toTok.decimals]);

  const minReceived = useMemo(() => {
    if (!outAmount) return "";
    return (Number(outAmount) * (1 - slippage / 100)).toFixed(6);
  }, [outAmount, slippage]);

  const priceImpact = quote.data?.priceImpact != null ? Number(quote.data.priceImpact) : null;
  const level: ImpactLevel | null = priceImpact != null ? impactLevel(priceImpact) : null;
  const requiresConfirm = level === "high" || level === "severe";
  const route = quote.data?.dexes?.slice(0, 3).map((d) => d.dexCode).filter(Boolean) ?? [];

  const flip = () => { setFromAddr(toAddr); setToAddr(fromAddr); };

  const pushTimeline = (label: string) =>
    setTimeline((t) => [...t, { label, at: Date.now() }]);

  const execute = async () => {
    if (!wc.account) { toast.error("Connect a wallet via Wallet → Connect"); return; }
    if (!amount || Number(amount) <= 0) { toast.error("Enter an amount"); return; }
    if (requiresConfirm && !confirmHighImpact) {
      toast.error("Acknowledge the price-impact warning to continue");
      return;
    }
    setExecuting(true);
    setTimeline([]);
    pushTimeline("Quote locked");

    // Pre-insert pending record so user has a history entry even if they abandon
    let recordId: string | null = null;
    try {
      if (user) {
        const r = await insertSwapRecord({
          user_id: user.id,
          mode: "dex",
          chain_id: chainId,
          chain_name: chain.name,
          from_symbol: fromTok.symbol,
          to_symbol: toTok.symbol,
          from_address: fromAddr,
          to_address: toAddr,
          amount_in: Number(amount),
          amount_out: Number(outAmount || 0),
          rate: outAmount && amount ? Number(outAmount) / Number(amount) : null,
          slippage,
          price_impact: priceImpact,
          route: route.join(" → ") || null,
          signer_address: wc.account,
          status: "pending",
        });
        recordId = r.id;
        setReceipt(r);
        setReceiptOpen(true);
      }

      if (wc.chainId !== chainId) {
        try { await wc.switchChain(chainId); } catch { /* user may reject */ }
      }
      pushTimeline("Building transaction");

      const params = new URLSearchParams({
        chainId: String(chainId),
        inTokenAddress: fromAddr,
        outTokenAddress: toAddr,
        amount,
        slippage: String(slippage),
        account: wc.account,
        build: "1",
      });
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/swap-quote?${params.toString()}`,
        { headers: {
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        } },
      );
      const json = await res.json();
      const tx = json?.data ?? json;
      if (!tx?.to || !tx?.data) throw new Error(tx?.error ?? "Failed to build swap tx");
      pushTimeline("Awaiting wallet signature");

      const hash = await wc.sendTransaction({
        to: tx.to,
        valueWei: tx.value && tx.value !== "0" ? `0x${BigInt(tx.value).toString(16)}` : "0x0",
        data: tx.data,
      });
      pushTimeline(`Broadcast — ${hash.slice(0, 10)}…`);

      if (recordId) {
        await updateSwapRecord(recordId, { tx_hash: hash, status: "pending" });
        setReceipt((r) => r ? { ...r, tx_hash: hash } : r);
      }
      toast.success("Swap submitted — tracking confirmation");

      // Poll for receipt
      pollTxStatus(chainId, hash, async (s) => {
        if (s.status === "confirmed") pushTimeline(`Confirmed in block ${s.blockNumber}`);
        if (s.status === "failed") pushTimeline("Reverted on-chain");
        if (recordId && (s.status === "confirmed" || s.status === "failed")) {
          await updateSwapRecord(recordId, { status: s.status });
          setReceipt((r) => r ? { ...r, status: s.status } : r);
          if (s.status === "confirmed") toast.success("Swap confirmed on-chain");
          else toast.error("Swap reverted on-chain");
        }
      });
    } catch (e) {
      const msg = (e as Error).message ?? "Swap failed";
      toast.error(msg);
      pushTimeline(`Error: ${msg}`);
      if (recordId) {
        await updateSwapRecord(recordId, { status: "failed", error_message: msg });
        setReceipt((r) => r ? { ...r, status: "failed", error_message: msg } : r);
      }
    } finally {
      setExecuting(false);
    }
  };

  const refreshedAt = quote.dataUpdatedAt ? new Date(quote.dataUpdatedAt) : null;

  return (
    <div className="space-y-5">
      {/* Chain & connection status */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Select value={String(chainId)} onValueChange={(v) => setChainId(Number(v))}>
          <SelectTrigger className="w-44 h-9 bg-background/40 border-border/40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SWAP_CHAINS.map((c) => (
              <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-wider">
          <span className={`h-1.5 w-1.5 rounded-full ${wc.account ? "bg-emerald-400" : "bg-muted-foreground/40"}`} />
          <span className="text-muted-foreground">
            {wc.account ? `${wc.account.slice(0, 6)}…${wc.account.slice(-4)}` : "Wallet not connected"}
          </span>
        </div>
      </div>

      {/* FROM */}
      <div className="rounded-2xl border border-border/40 bg-background/40 p-4">
        <div className="flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          <span>You pay</span>
          <span>{chain.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-2xl font-bold bg-transparent border-0 px-0 focus-visible:ring-0 h-12"
            style={HEADING}
          />
          <Select value={fromAddr} onValueChange={setFromAddr}>
            <SelectTrigger className="w-32 h-11 bg-background/60 border-border/50 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chain.tokens.filter((t) => t.address !== toAddr).map((t) => (
                <SelectItem key={t.address} value={t.address}>{t.symbol}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-center -my-3 relative z-10">
        <Button size="icon" variant="outline" onClick={flip} className="rounded-full h-10 w-10 bg-background border-border/60">
          ↑↓
        </Button>
      </div>

      {/* TO */}
      <div className="rounded-2xl border border-border/40 bg-background/40 p-4">
        <div className="flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          <span>You receive</span>
          <span>{quote.isFetching ? "Refreshing…" : refreshedAt ? `Updated ${refreshedAt.toLocaleTimeString()}` : ""}</span>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={outAmount}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              className="flex-1 text-2xl font-bold"
              style={HEADING}
            >
              {outAmount || "0.0"}
            </motion.div>
          </AnimatePresence>
          <Select value={toAddr} onValueChange={setToAddr}>
            <SelectTrigger className="w-32 h-11 bg-background/60 border-border/50 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {chain.tokens.filter((t) => t.address !== fromAddr).map((t) => (
                <SelectItem key={t.address} value={t.address}>{t.symbol}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <SlippageControl value={slippage} onChange={setSlippage} />

      {/* Route */}
      {route.length > 0 ? (
        <div className="rounded-xl border border-border/30 bg-background/30 p-3">
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1.5">Best route</div>
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="px-2 py-0.5 rounded border border-border/40 font-semibold">{fromTok.symbol}</span>
            {route.map((dex, i) => (
              <span key={i} className="flex items-center gap-1.5">
                <span className="text-muted-foreground">via</span>
                <span className="px-2 py-0.5 rounded border border-primary/40 text-primary text-[11px]">{dex}</span>
              </span>
            ))}
            <span className="text-muted-foreground">→</span>
            <span className="px-2 py-0.5 rounded border border-border/40 font-semibold">{toTok.symbol}</span>
          </div>
        </div>
      ) : null}

      {/* Stats */}
      <div className="rounded-xl border border-border/30 bg-background/30 p-3 text-xs space-y-1.5">
        <Row label="Rate" value={amount && outAmount ? `1 ${fromTok.symbol} ≈ ${(Number(outAmount) / Number(amount)).toFixed(6)} ${toTok.symbol}` : "—"} />
        <Row label="Min received" value={minReceived ? `${minReceived} ${toTok.symbol}` : "—"} />
        <Row label="Price impact" value={priceImpact != null ? `${priceImpact.toFixed(2)}%` : "—"} />
        <Row label="Est. gas" value={quote.data?.estimatedGas ? `${quote.data.estimatedGas} units` : "—"} />
      </div>

      {/* Price-impact warning */}
      {level && (level === "medium" || level === "high" || level === "severe") ? (
        <div className={`rounded-xl border p-3 text-xs ${IMPACT_META[level].cls}`}>
          <div className="font-semibold uppercase tracking-wider text-[10px] mb-1">{IMPACT_META[level].label}</div>
          <div className="opacity-80">
            Price impact is {priceImpact?.toFixed(2)}%. Min received at {slippage}% slippage: {minReceived} {toTok.symbol}.
          </div>
          {requiresConfirm ? (
            <label className="flex items-center gap-2 mt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmHighImpact}
                onChange={(e) => setConfirmHighImpact(e.target.checked)}
                className="accent-primary"
              />
              <span>I understand the risk and want to swap anyway</span>
            </label>
          ) : null}
        </div>
      ) : null}

      {quote.error ? (
        <p className="text-xs text-red-400">Quote error: {(quote.error as Error).message}</p>
      ) : null}

      <Button
        className="w-full h-12 text-base font-bold shadow-glow"
        onClick={execute}
        disabled={executing || !amount || !quote.data || (requiresConfirm && !confirmHighImpact)}
      >
        {executing
          ? "Confirm in wallet…"
          : !wc.account
            ? "Connect wallet to swap"
            : requiresConfirm && !confirmHighImpact
              ? "Acknowledge warning to swap"
              : "Swap on-chain"}
      </Button>

      <SwapReceiptDialog
        open={receiptOpen}
        onOpenChange={setReceiptOpen}
        record={receipt}
        timeline={timeline}
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Custodial swap panel
// ─────────────────────────────────────────────────────────────────────────────
function CustodialSwap() {
  const { user } = useAuth();
  const { balances } = useWallets();
  const { data: prices } = useChainPrices();
  const { swap } = useInternalSwap();
  const qc = useQueryClient();

  const [from, setFrom] = useState("USDT");
  const [to, setTo] = useState("VNX");
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(0.5);
  const [busy, setBusy] = useState(false);

  const [receiptOpen, setReceiptOpen] = useState(false);
  const [receipt, setReceipt] = useState<SwapRecord | null>(null);

  const balanceOf = (sym: string) =>
    Number(balances?.find((b) => b.token_symbol === sym)?.balance ?? 0);

  const fromPx = prices?.bySymbol[from] ?? 0;
  const toPx = prices?.bySymbol[to] ?? 0;
  const rate = fromPx && toPx ? fromPx / toPx : 0;
  const gross = Number(amount || 0) * rate;
  const fee = gross * 0.002;
  const net = gross - fee;
  const minReceived = net * (1 - slippage / 100);

  const flip = () => { setFrom(to); setTo(from); };

  const submit = async () => {
    if (!user) { toast.error("Sign in to swap custodial balances"); return; }
    const n = Number(amount);
    if (!n || n <= 0) { toast.error("Enter an amount"); return; }
    if (n > balanceOf(from)) { toast.error(`Insufficient ${from} balance`); return; }
    if (from === to) { toast.error("Pick two different tokens"); return; }
    setBusy(true);
    try {
      const r = await swap({ from_symbol: from, to_symbol: to, amount: n });
      toast.success(`Swapped ${r.amount_in} ${r.from_symbol} → ${r.amount_out.toFixed(6)} ${r.to_symbol}`);
      setAmount("");
      qc.invalidateQueries({ queryKey: ["balances"] });
      qc.invalidateQueries({ queryKey: ["swap-history"] });
      // Build a synthetic receipt from response (edge fn also stores it server-side)
      setReceipt({
        id: "tmp",
        mode: "custodial",
        chain_id: null,
        chain_name: null,
        from_symbol: r.from_symbol,
        to_symbol: r.to_symbol,
        amount_in: r.amount_in,
        amount_out: r.amount_out,
        rate: r.rate,
        fee_amount: r.fee_out,
        fee_symbol: r.to_symbol,
        slippage,
        price_impact: null,
        route: "Custodial · CoinGecko mid-price",
        tx_hash: null,
        signer_address: null,
        status: "settled",
        error_message: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      setReceiptOpen(true);
    } catch (e) {
      toast.error((e as Error).message ?? "Swap failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border/40 bg-background/40 p-4">
        <div className="flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          <span>You pay</span>
          <button onClick={() => setAmount(String(balanceOf(from)))} className="hover:text-primary">
            Balance: {balanceOf(from).toFixed(4)} {from} · MAX
          </button>
        </div>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            inputMode="decimal"
            placeholder="0.0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-2xl font-bold bg-transparent border-0 px-0 focus-visible:ring-0 h-12"
            style={HEADING}
          />
          <Select value={from} onValueChange={setFrom}>
            <SelectTrigger className="w-32 h-11 bg-background/60 border-border/50 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CUSTODIAL_TOKENS.filter((s) => s !== to).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {fromPx ? (
          <div className="text-[11px] text-muted-foreground mt-1">≈ ${(Number(amount || 0) * fromPx).toFixed(2)}</div>
        ) : null}
      </div>

      <div className="flex justify-center -my-3 relative z-10">
        <Button size="icon" variant="outline" onClick={flip} className="rounded-full h-10 w-10 bg-background border-border/60">
          ↑↓
        </Button>
      </div>

      <div className="rounded-2xl border border-border/40 bg-background/40 p-4">
        <div className="flex justify-between text-[11px] uppercase tracking-wider text-muted-foreground mb-2">
          <span>You receive</span>
          <span>Balance: {balanceOf(to).toFixed(4)} {to}</span>
        </div>
        <div className="flex items-center gap-3">
          <AnimatePresence mode="wait">
            <motion.div key={net} initial={{ opacity: 0.4 }} animate={{ opacity: 1 }} className="flex-1 text-2xl font-bold" style={HEADING}>
              {net ? net.toFixed(6) : "0.0"}
            </motion.div>
          </AnimatePresence>
          <Select value={to} onValueChange={setTo}>
            <SelectTrigger className="w-32 h-11 bg-background/60 border-border/50 font-bold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CUSTODIAL_TOKENS.filter((s) => s !== from).map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {toPx ? <div className="text-[11px] text-muted-foreground mt-1">≈ ${(net * toPx).toFixed(2)}</div> : null}
      </div>

      <SlippageControl value={slippage} onChange={setSlippage} />

      <div className="rounded-xl border border-border/30 bg-background/30 p-3 text-xs space-y-1.5">
        <Row label="Rate" value={rate ? `1 ${from} ≈ ${rate.toFixed(6)} ${to}` : "—"} />
        <Row label="Fee" value={`${fee.toFixed(6)} ${to} (0.20%)`} />
        <Row label="Min received" value={`${minReceived.toFixed(6)} ${to}`} />
        <Row label="Route" value="Custodial · CoinGecko mid-price" />
        <Row label="Settlement" value="Instant" />
      </div>

      <Button className="w-full h-12 text-base font-bold shadow-glow" onClick={submit} disabled={busy || !amount || !rate}>
        {busy ? "Settling…" : user ? "Swap instantly" : "Sign in to swap"}
      </Button>

      <SwapReceiptDialog open={receiptOpen} onOpenChange={setReceiptOpen} record={receipt} />
    </div>
  );
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between gap-3">
    <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
    <span className="font-medium text-right">{value}</span>
  </div>
);

const Swap = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />

        <section className="page-header">
          <div className="absolute inset-0 gradient-hero" />
          <div className="page-header-content">
            <div className="max-w-2xl mx-auto text-center animate-slide-up">
              <span className="section-badge">Real-time</span>
              <h1 className="page-title">Swap <span className="text-gradient">Anything</span></h1>
              <p className="page-subtitle mx-auto">
                Configurable slippage, live price-impact warnings, route breakdown, and tracked receipts.
              </p>
            </div>
          </div>
        </section>

        <div className="section-container py-8">
          <div className="max-w-xl mx-auto space-y-6">
            <div className="card-modern animate-slide-up stagger-1">
              <Tabs defaultValue="dex">
                <TabsList className="grid grid-cols-2 mb-6 bg-background/40 border border-border/40">
                  <TabsTrigger value="dex">On-chain DEX</TabsTrigger>
                  <TabsTrigger value="custodial">Custodial</TabsTrigger>
                </TabsList>
                <TabsContent value="dex"><DexSwap /></TabsContent>
                <TabsContent value="custodial"><CustodialSwap /></TabsContent>
              </Tabs>
            </div>

            <div className="card-modern animate-slide-up stagger-2">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold" style={HEADING}>Swap History</h2>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Live</span>
              </div>
              <SwapHistoryList />
            </div>

            <p className="text-[11px] text-muted-foreground text-center uppercase tracking-wider">
              DEX routing via OpenOcean · Custodial pricing via CoinGecko · Status via public RPC
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Swap;
