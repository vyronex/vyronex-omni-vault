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

const HEADING = { fontFamily: "'Space Grotesk', system-ui" };

const CUSTODIAL_TOKENS = ["BNB", "ETH", "BTC", "SOL", "USDT", "USDC", "VNX", "MATIC", "TRX", "FTM"];

// ─────────────────────────────────────────────────────────────────────────────
// DEX (on-chain) swap panel — OpenOcean quote, WalletConnect executes tx.
// ─────────────────────────────────────────────────────────────────────────────
function DexSwap() {
  const wc = useWalletConnect();
  const [chainId, setChainId] = useState<number>(56);
  const chain = useMemo(() => getChain(chainId), [chainId]);
  const [fromAddr, setFromAddr] = useState(chain.tokens[0].address);
  const [toAddr, setToAddr] = useState(chain.tokens[1].address);
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(1);
  const [executing, setExecuting] = useState(false);
  const [lastTx, setLastTx] = useState<string | null>(null);

  useEffect(() => {
    setFromAddr(chain.tokens[0].address);
    setToAddr(chain.tokens[1].address);
  }, [chainId]);

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

  const flip = () => {
    setFromAddr(toAddr);
    setToAddr(fromAddr);
  };

  const execute = async () => {
    if (!wc.account) {
      toast.error("Connect a wallet first via the Wallet → Connect tab.");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter an amount");
      return;
    }
    setExecuting(true);
    try {
      // Switch chain if needed
      if (wc.chainId !== chainId) {
        try { await wc.switchChain(chainId); } catch { /* user may reject */ }
      }
      // Build the tx via the proxy with account=signer
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
        { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY, Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}` } },
      );
      const json = await res.json();
      const tx = json?.data ?? json;
      if (!tx?.to || !tx?.data) throw new Error(tx?.error ?? "Failed to build swap tx");

      const hash = await wc.sendTransaction({
        to: tx.to,
        valueWei: tx.value && tx.value !== "0" ? `0x${BigInt(tx.value).toString(16)}` : "0x0",
        data: tx.data,
      });
      setLastTx(hash);
      toast.success("Swap submitted on-chain");
    } catch (e) {
      toast.error((e as Error).message ?? "Swap failed");
    } finally {
      setExecuting(false);
    }
  };

  const refreshedAt = quote.dataUpdatedAt ? new Date(quote.dataUpdatedAt) : null;

  return (
    <div className="space-y-5">
      {/* Chain & status bar */}
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

      {/* Flip */}
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

      {/* Slippage */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground uppercase tracking-wider">Slippage</span>
        <div className="flex gap-1">
          {[0.5, 1, 2, 5].map((s) => (
            <button
              key={s}
              onClick={() => setSlippage(s)}
              className={`px-2.5 py-1 rounded-md border ${slippage === s ? "border-primary text-primary bg-primary/10" : "border-border/40 text-muted-foreground hover:text-foreground"}`}
            >
              {s}%
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="rounded-xl border border-border/30 bg-background/30 p-3 text-xs space-y-1.5">
        <Row label="Rate" value={amount && outAmount ? `1 ${fromTok.symbol} ≈ ${(Number(outAmount) / Number(amount)).toFixed(6)} ${toTok.symbol}` : "—"} />
        <Row label="Price impact" value={quote.data?.priceImpact != null ? `${Number(quote.data.priceImpact).toFixed(2)}%` : "—"} />
        <Row label="Est. gas" value={quote.data?.estimatedGas ? `${quote.data.estimatedGas} units` : "—"} />
        <Row label="Route" value={quote.data?.dexes?.[0]?.dexCode ?? "—"} />
      </div>

      {quote.error ? (
        <p className="text-xs text-red-400">Quote error: {(quote.error as Error).message}</p>
      ) : null}

      <Button
        className="w-full h-12 text-base font-bold shadow-glow"
        onClick={execute}
        disabled={executing || !amount || !quote.data}
      >
        {executing ? "Confirm in wallet…" : wc.account ? "Swap on-chain" : "Connect wallet to swap"}
      </Button>

      {lastTx ? (
        <p className="text-xs text-muted-foreground break-all">
          Tx: <span className="text-primary">{lastTx}</span>
        </p>
      ) : null}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Custodial swap — internal balances at live CoinGecko mid-price.
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
  const [busy, setBusy] = useState(false);

  const balanceOf = (sym: string) =>
    Number(balances?.find((b) => b.token_symbol === sym)?.balance ?? 0);

  const fromPx = prices?.bySymbol[from] ?? 0;
  const toPx = prices?.bySymbol[to] ?? 0;
  const rate = fromPx && toPx ? fromPx / toPx : 0;
  const gross = Number(amount || 0) * rate;
  const fee = gross * 0.002;
  const net = gross - fee;

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
          <button
            onClick={() => setAmount(String(balanceOf(from)))}
            className="hover:text-primary"
          >
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
          <div className="text-[11px] text-muted-foreground mt-1">
            ≈ ${(Number(amount || 0) * fromPx).toFixed(2)}
          </div>
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
            <motion.div
              key={net}
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 1 }}
              className="flex-1 text-2xl font-bold"
              style={HEADING}
            >
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
        {toPx ? (
          <div className="text-[11px] text-muted-foreground mt-1">
            ≈ ${(net * toPx).toFixed(2)}
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-border/30 bg-background/30 p-3 text-xs space-y-1.5">
        <Row label="Rate" value={rate ? `1 ${from} ≈ ${rate.toFixed(6)} ${to}` : "—"} />
        <Row label="Fee" value={`${fee.toFixed(6)} ${to} (0.20%)`} />
        <Row label="Settlement" value="Instant · custodial balances" />
      </div>

      <Button
        className="w-full h-12 text-base font-bold shadow-glow"
        onClick={submit}
        disabled={busy || !amount || !rate}
      >
        {busy ? "Settling…" : user ? "Swap instantly" : "Sign in to swap"}
      </Button>
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
              <h1 className="page-title">
                Swap <span className="text-gradient">Anything</span>
              </h1>
              <p className="page-subtitle mx-auto">
                Live multi-chain DEX routing or instant custodial settlement — quotes refresh every 8 seconds.
              </p>
            </div>
          </div>
        </section>

        <div className="section-container py-8">
          <div className="max-w-xl mx-auto">
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

            <p className="text-[11px] text-muted-foreground text-center mt-6 uppercase tracking-wider">
              DEX routing via OpenOcean aggregator · Custodial pricing via CoinGecko
            </p>
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Swap;
