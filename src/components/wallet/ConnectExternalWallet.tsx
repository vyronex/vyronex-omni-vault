import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";

// ─── Provider type defs ──────────────────────────────────────────────
interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
}

interface PhantomProvider {
  isPhantom?: boolean;
  publicKey?: { toString(): string } | null;
  isConnected?: boolean;
  connect: (opts?: { onlyIfTrusted?: boolean }) => Promise<{ publicKey: { toString(): string } }>;
  disconnect: () => Promise<void>;
  signAndSendTransaction: (tx: Transaction) => Promise<{ signature: string }>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
}

interface TronWeb {
  defaultAddress?: { base58?: string };
  trx: {
    sendTransaction: (to: string, amountSun: number) => Promise<{ result: boolean; txid?: string; transaction?: { txID: string } }>;
    getBalance: (addr: string) => Promise<number>;
  };
  ready?: boolean;
}

interface TronLink {
  request: (args: { method: string }) => Promise<{ code: number; message?: string }>;
  tronWeb?: TronWeb;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
    solana?: PhantomProvider;
    tronLink?: TronLink;
    tronWeb?: TronWeb;
  }
}

// ─── Props ───────────────────────────────────────────────────────────
interface WalletSlot {
  id: string;
  chain: string;
  address: string;
}

interface Props {
  evmWallets: WalletSlot[];
  solanaWallet?: WalletSlot;
  tronWallet?: WalletSlot;
  onApply: (walletId: string, address: string) => Promise<void>;
}

const EVM_CHAINS = ["BNB Chain", "Ethereum", "Fantom"] as const;
type EvmChain = typeof EVM_CHAINS[number];

const SOLANA_RPC = "https://api.mainnet-beta.solana.com";

// ────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────
export const ConnectExternalWallet = ({
  evmWallets,
  solanaWallet,
  tronWallet,
  onApply,
}: Props) => {
  return (
    <div className="p-4 rounded-2xl border border-border/40 bg-card">
      <div className="flex items-baseline justify-between mb-3">
        <p
          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          style={{ fontFamily: "'Space Grotesk', system-ui" }}
        >
          External Wallets
        </p>
        <span className="text-[10px] text-muted-foreground">EVM · Solana · Tron</span>
      </div>

      <Tabs defaultValue="evm" className="w-full">
        <TabsList className="grid grid-cols-3 h-8 mb-3">
          <TabsTrigger value="evm" className="text-[11px]">EVM</TabsTrigger>
          <TabsTrigger value="solana" className="text-[11px]">Solana</TabsTrigger>
          <TabsTrigger value="tron" className="text-[11px]">Tron</TabsTrigger>
        </TabsList>

        <TabsContent value="evm" className="mt-0">
          <EvmPanel evmWallets={evmWallets} onApply={onApply} />
        </TabsContent>
        <TabsContent value="solana" className="mt-0">
          <SolanaPanel slot={solanaWallet} onApply={onApply} />
        </TabsContent>
        <TabsContent value="tron" className="mt-0">
          <TronPanel slot={tronWallet} onApply={onApply} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

// ────────────────────────────────────────────────────────────────────
// EVM
// ────────────────────────────────────────────────────────────────────
const EvmPanel = ({
  evmWallets,
  onApply,
}: {
  evmWallets: WalletSlot[];
  onApply: Props["onApply"];
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [applyChain, setApplyChain] = useState<EvmChain>("BNB Chain");
  const [applying, setApplying] = useState(false);

  const hasProvider = typeof window !== "undefined" && !!window.ethereum;

  useEffect(() => {
    if (!hasProvider) return;
    const eth = window.ethereum!;
    eth.request({ method: "eth_accounts" }).then((accs) => {
      const list = accs as string[];
      if (list?.[0]) setAccount(list[0]);
    }).catch(() => {});
    eth.request({ method: "eth_chainId" }).then((id) => setChainId(id as string)).catch(() => {});

    const onAccounts = (...args: unknown[]) => setAccount((args[0] as string[])?.[0] ?? null);
    const onChain = (...args: unknown[]) => setChainId(args[0] as string);
    eth.on?.("accountsChanged", onAccounts);
    eth.on?.("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, [hasProvider]);

  const connect = async () => {
    if (!hasProvider) return toast.error("Install MetaMask or another EIP-1193 wallet");
    setConnecting(true);
    try {
      const accs = (await window.ethereum!.request({ method: "eth_requestAccounts" })) as string[];
      if (accs?.[0]) {
        setAccount(accs[0]);
        toast.success("EVM wallet connected");
      }
    } catch (err) {
      toast.error((err as { message?: string })?.message ?? "Connection rejected");
    } finally {
      setConnecting(false);
    }
  };

  const apply = async () => {
    if (!account) return;
    const target = evmWallets.find((w) => w.chain === applyChain);
    if (!target) return toast.error(`No ${applyChain} slot available`);
    setApplying(true);
    try {
      await onApply(target.id, account);
      toast.success(`Applied to ${applyChain}`);
    } catch (err) {
      toast.error((err as { message?: string })?.message ?? "Failed");
    } finally {
      setApplying(false);
    }
  };

  const networkLabel = chainId
    ? ({
        "0x1": "Ethereum",
        "0x38": "BNB Chain",
        "0xfa": "Fantom",
        "0x89": "Polygon",
        "0xa4b1": "Arbitrum",
      } as Record<string, string>)[chainId.toLowerCase()] ?? `Chain ${parseInt(chainId, 16)}`
    : null;

  if (!account) {
    return (
      <>
        <p className="text-xs text-muted-foreground mb-3">
          Connect MetaMask / Rabby / browser EVM wallet to verify ownership and auto-fill EVM addresses.
        </p>
        <Button
          size="sm"
          className="w-full rounded-xl gradient-primary shadow-glow active-press h-10"
          onClick={connect}
          disabled={connecting || !hasProvider}
        >
          {connecting ? "Requesting…" : hasProvider ? "Connect EVM Wallet" : "No Wallet Detected"}
        </Button>
        {!hasProvider && (
          <p className="mt-2 text-[10px] text-muted-foreground">
            Install MetaMask or another EIP-1193 browser wallet.
          </p>
        )}
      </>
    );
  }

  return (
    <>
      <ConnectedHeader label="Connected" right={networkLabel} address={account} />
      <div className="grid grid-cols-[1fr_auto] gap-2">
        <Select value={applyChain} onValueChange={(v) => setApplyChain(v as EvmChain)}>
          <SelectTrigger className="h-9 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            {EVM_CHAINS.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button size="sm" className="h-9 rounded-xl" onClick={apply} disabled={applying}>
          {applying ? "Applying…" : "Apply"}
        </Button>
      </div>
      <Button
        size="sm" variant="ghost"
        className="w-full mt-2 text-[11px] h-7 text-muted-foreground"
        onClick={() => setAccount(null)}
      >
        Disconnect
      </Button>
    </>
  );
};

// ────────────────────────────────────────────────────────────────────
// Solana (Phantom)
// ────────────────────────────────────────────────────────────────────
const SolanaPanel = ({
  slot,
  onApply,
}: {
  slot?: WalletSlot;
  onApply: Props["onApply"];
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);

  const provider = typeof window !== "undefined" ? window.solana : undefined;
  const hasProvider = !!provider?.isPhantom;

  const connection = useMemo(() => new Connection(SOLANA_RPC, "confirmed"), []);

  useEffect(() => {
    if (!provider) return;
    provider.connect({ onlyIfTrusted: true })
      .then((res) => setAccount(res.publicKey.toString()))
      .catch(() => {});
  }, [provider]);

  useEffect(() => {
    if (!account) { setBalance(null); return; }
    let cancelled = false;
    (async () => {
      try {
        const lamports = await connection.getBalance(new PublicKey(account));
        if (!cancelled) setBalance(lamports / LAMPORTS_PER_SOL);
      } catch { /* ignore */ }
    })();
    return () => { cancelled = true; };
  }, [account, connection]);

  const connect = async () => {
    if (!provider) return toast.error("Install Phantom wallet");
    setConnecting(true);
    try {
      const res = await provider.connect();
      setAccount(res.publicKey.toString());
      toast.success("Phantom wallet connected");
    } catch (err) {
      toast.error((err as { message?: string })?.message ?? "Connection rejected");
    } finally {
      setConnecting(false);
    }
  };

  const apply = async () => {
    if (!account || !slot) return;
    setApplying(true);
    try {
      await onApply(slot.id, account);
      toast.success("Applied to Solana account");
    } catch (err) {
      toast.error((err as { message?: string })?.message ?? "Failed");
    } finally {
      setApplying(false);
    }
  };

  const send = async () => {
    if (!provider || !account) return;
    const amt = parseFloat(amount);
    if (!to.trim() || !isFinite(amt) || amt <= 0) return toast.error("Enter recipient and amount");
    let toPk: PublicKey;
    try { toPk = new PublicKey(to.trim()); } catch { return toast.error("Invalid Solana address"); }

    setSending(true);
    try {
      const fromPk = new PublicKey(account);
      const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
      const tx = new Transaction({ feePayer: fromPk, blockhash, lastValidBlockHeight }).add(
        SystemProgram.transfer({
          fromPubkey: fromPk,
          toPubkey: toPk,
          lamports: Math.round(amt * LAMPORTS_PER_SOL),
        }),
      );
      const { signature } = await provider.signAndSendTransaction(tx);
      toast.success(`SOL sent · ${signature.slice(0, 8)}…`);
      setTo(""); setAmount("");
      // Refresh balance
      const lamports = await connection.getBalance(fromPk);
      setBalance(lamports / LAMPORTS_PER_SOL);
    } catch (err) {
      toast.error((err as { message?: string })?.message ?? "Transaction failed");
    } finally {
      setSending(false);
    }
  };

  if (!account) {
    return (
      <>
        <p className="text-xs text-muted-foreground mb-3">
          Connect Phantom to read your SOL balance, link your Solana account, and send native transfers.
        </p>
        <Button
          size="sm"
          className="w-full rounded-xl gradient-primary shadow-glow active-press h-10"
          onClick={connect}
          disabled={connecting || !hasProvider}
        >
          {connecting ? "Requesting…" : hasProvider ? "Connect Phantom" : "Phantom Not Detected"}
        </Button>
        {!hasProvider && (
          <p className="mt-2 text-[10px] text-muted-foreground">Install the Phantom browser extension.</p>
        )}
      </>
    );
  }

  return (
    <>
      <ConnectedHeader
        label="Phantom"
        right={balance !== null ? `${balance.toFixed(4)} SOL` : "…"}
        address={account}
      />
      <div className="grid grid-cols-[1fr_auto] gap-2 mb-3">
        <div className="text-[11px] text-muted-foreground self-center">
          {slot ? `Slot: ${slot.chain}` : "No Solana slot"}
        </div>
        <Button size="sm" className="h-9 rounded-xl" onClick={apply} disabled={applying || !slot}>
          {applying ? "Applying…" : "Apply"}
        </Button>
      </div>

      <div className="border-t border-border/30 pt-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Send SOL</p>
        <Input
          value={to} onChange={(e) => setTo(e.target.value)}
          placeholder="Recipient address" className="h-9 text-xs mb-2 font-mono"
        />
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Input
            value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00" inputMode="decimal" className="h-9 text-xs font-mono"
          />
          <Button size="sm" className="h-9 rounded-xl" onClick={send} disabled={sending}>
            {sending ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>

      <Button
        size="sm" variant="ghost"
        className="w-full mt-2 text-[11px] h-7 text-muted-foreground"
        onClick={async () => { try { await provider?.disconnect(); } catch { /* ignore */ } setAccount(null); }}
      >
        Disconnect
      </Button>
    </>
  );
};

// ────────────────────────────────────────────────────────────────────
// Tron (TronLink)
// ────────────────────────────────────────────────────────────────────
const TronPanel = ({
  slot,
  onApply,
}: {
  slot?: WalletSlot;
  onApply: Props["onApply"];
}) => {
  const [account, setAccount] = useState<string | null>(null);
  const [balance, setBalance] = useState<number | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [applying, setApplying] = useState(false);
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [sending, setSending] = useState(false);

  const detect = (): TronWeb | undefined => {
    if (typeof window === "undefined") return undefined;
    return window.tronLink?.tronWeb ?? window.tronWeb;
  };
  const hasProvider = typeof window !== "undefined" && (!!window.tronLink || !!window.tronWeb);

  const refreshBalance = async (addr: string) => {
    const tw = detect();
    if (!tw) return;
    try {
      const sun = await tw.trx.getBalance(addr);
      setBalance(sun / 1_000_000);
    } catch { /* ignore */ }
  };

  useEffect(() => {
    const tw = detect();
    const addr = tw?.defaultAddress?.base58;
    if (addr) {
      setAccount(addr);
      refreshBalance(addr);
    }
    const handler = (e: MessageEvent) => {
      const data = (e.data as { message?: { action?: string; data?: { address?: string } } })?.message;
      if (data?.action === "setAccount" && data.data?.address) {
        setAccount(data.data.address);
        refreshBalance(data.data.address);
      } else if (data?.action === "accountsChanged") {
        const tw2 = detect();
        const a = tw2?.defaultAddress?.base58 ?? null;
        setAccount(a);
        if (a) refreshBalance(a);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = async () => {
    if (!window.tronLink) return toast.error("Install TronLink wallet");
    setConnecting(true);
    try {
      const res = await window.tronLink.request({ method: "tron_requestAccounts" });
      // 200 = approved, 4000 = already processing, 4001 = rejected
      if (res?.code !== 200 && res?.code !== 4000) {
        throw new Error(res?.message ?? "Connection rejected");
      }
      const tw = detect();
      const addr = tw?.defaultAddress?.base58;
      if (!addr) throw new Error("No Tron account exposed");
      setAccount(addr);
      await refreshBalance(addr);
      toast.success("TronLink connected");
    } catch (err) {
      toast.error((err as { message?: string })?.message ?? "Connection failed");
    } finally {
      setConnecting(false);
    }
  };

  const apply = async () => {
    if (!account || !slot) return;
    setApplying(true);
    try {
      await onApply(slot.id, account);
      toast.success("Applied to Tron account");
    } catch (err) {
      toast.error((err as { message?: string })?.message ?? "Failed");
    } finally {
      setApplying(false);
    }
  };

  const send = async () => {
    const tw = detect();
    if (!tw || !account) return;
    const amt = parseFloat(amount);
    if (!to.trim() || !isFinite(amt) || amt <= 0) return toast.error("Enter recipient and amount");
    setSending(true);
    try {
      const sun = Math.round(amt * 1_000_000);
      const res = await tw.trx.sendTransaction(to.trim(), sun);
      if (!res?.result) throw new Error("Transaction rejected");
      const id = res.txid ?? res.transaction?.txID ?? "";
      toast.success(`TRX sent · ${id.slice(0, 8)}…`);
      setTo(""); setAmount("");
      await refreshBalance(account);
    } catch (err) {
      toast.error((err as { message?: string })?.message ?? "Transaction failed");
    } finally {
      setSending(false);
    }
  };

  if (!account) {
    return (
      <>
        <p className="text-xs text-muted-foreground mb-3">
          Connect TronLink to read TRX balance, link your Tron account, and send native transfers.
        </p>
        <Button
          size="sm"
          className="w-full rounded-xl gradient-primary shadow-glow active-press h-10"
          onClick={connect}
          disabled={connecting || !hasProvider}
        >
          {connecting ? "Requesting…" : hasProvider ? "Connect TronLink" : "TronLink Not Detected"}
        </Button>
        {!hasProvider && (
          <p className="mt-2 text-[10px] text-muted-foreground">Install the TronLink browser extension.</p>
        )}
      </>
    );
  }

  return (
    <>
      <ConnectedHeader
        label="TronLink"
        right={balance !== null ? `${balance.toFixed(4)} TRX` : "…"}
        address={account}
      />
      <div className="grid grid-cols-[1fr_auto] gap-2 mb-3">
        <div className="text-[11px] text-muted-foreground self-center">
          {slot ? `Slot: ${slot.chain}` : "No Tron slot"}
        </div>
        <Button size="sm" className="h-9 rounded-xl" onClick={apply} disabled={applying || !slot}>
          {applying ? "Applying…" : "Apply"}
        </Button>
      </div>

      <div className="border-t border-border/30 pt-3">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Send TRX</p>
        <Input
          value={to} onChange={(e) => setTo(e.target.value)}
          placeholder="Recipient T-address" className="h-9 text-xs mb-2 font-mono"
        />
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <Input
            value={amount} onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00" inputMode="decimal" className="h-9 text-xs font-mono"
          />
          <Button size="sm" className="h-9 rounded-xl" onClick={send} disabled={sending}>
            {sending ? "Sending…" : "Send"}
          </Button>
        </div>
      </div>
    </>
  );
};

// ────────────────────────────────────────────────────────────────────
// Shared header
// ────────────────────────────────────────────────────────────────────
const ConnectedHeader = ({
  label, right, address,
}: { label: string; right?: string | null; address: string }) => (
  <div className="p-3 rounded-xl bg-muted/30 border border-border/30 mb-3">
    <div className="flex items-center justify-between mb-1">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</span>
      {right && (
        <span className="text-[10px] uppercase tracking-wider font-bold text-primary">{right}</span>
      )}
    </div>
    <p className="font-mono text-xs break-all">{address}</p>
  </div>
);
