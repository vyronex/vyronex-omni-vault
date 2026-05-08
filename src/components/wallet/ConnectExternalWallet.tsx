import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface Eip1193Provider {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on?: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener?: (event: string, handler: (...args: unknown[]) => void) => void;
  isMetaMask?: boolean;
}

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

const EVM_CHAINS = ["BNB Chain", "Ethereum", "Fantom"] as const;
type EvmChain = typeof EVM_CHAINS[number];

interface Props {
  evmWallets: { id: string; chain: string; address: string }[];
  onApply: (walletId: string, address: string) => Promise<void>;
}

export const ConnectExternalWallet = ({ evmWallets, onApply }: Props) => {
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

    const onAccounts = (...args: unknown[]) => {
      const list = args[0] as string[];
      setAccount(list?.[0] ?? null);
    };
    const onChain = (...args: unknown[]) => setChainId(args[0] as string);
    eth.on?.("accountsChanged", onAccounts);
    eth.on?.("chainChanged", onChain);
    return () => {
      eth.removeListener?.("accountsChanged", onAccounts);
      eth.removeListener?.("chainChanged", onChain);
    };
  }, [hasProvider]);

  const connect = async () => {
    if (!hasProvider) {
      toast.error("No injected Web3 wallet detected. Install MetaMask or use WalletConnect.");
      return;
    }
    setConnecting(true);
    try {
      const accs = (await window.ethereum!.request({ method: "eth_requestAccounts" })) as string[];
      if (accs?.[0]) {
        setAccount(accs[0]);
        toast.success("External wallet connected");
      }
    } catch (err) {
      const e = err as { message?: string };
      toast.error(e?.message ?? "Connection rejected");
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    toast.info("External wallet disconnected from this session");
  };

  const apply = async () => {
    if (!account) return;
    const target = evmWallets.find((w) => w.chain === applyChain);
    if (!target) {
      toast.error(`No ${applyChain} slot available`);
      return;
    }
    setApplying(true);
    try {
      await onApply(target.id, account);
      toast.success(`Applied to ${applyChain} account`);
    } catch (err) {
      const e = err as { message?: string };
      toast.error(e?.message ?? "Failed to apply address");
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

  return (
    <div className="p-4 rounded-2xl border border-border/40 bg-card">
      <div className="flex items-baseline justify-between mb-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
          External Wallet
        </p>
        <span className="text-[10px] text-muted-foreground">EVM · MetaMask compatible</span>
      </div>

      {!account ? (
        <>
          <p className="text-xs text-muted-foreground mb-3">
            Connect your existing browser wallet to verify ownership and auto-fill EVM addresses.
          </p>
          <Button
            size="sm"
            className="w-full rounded-xl gradient-primary shadow-glow active-press h-10"
            onClick={connect}
            disabled={connecting || !hasProvider}
          >
            {connecting ? "Requesting…" : hasProvider ? "Connect Wallet" : "No Wallet Detected"}
          </Button>
          {!hasProvider && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              Install MetaMask, Rabby, or another EIP-1193 browser wallet to enable this.
            </p>
          )}
        </>
      ) : (
        <>
          <div className="p-3 rounded-xl bg-muted/30 border border-border/30 mb-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Connected</span>
              {networkLabel && (
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary">{networkLabel}</span>
              )}
            </div>
            <p className="font-mono text-xs break-all">{account}</p>
          </div>

          <div className="grid grid-cols-[1fr_auto] gap-2">
            <Select value={applyChain} onValueChange={(v) => setApplyChain(v as EvmChain)}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {EVM_CHAINS.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" className="h-9 rounded-xl" onClick={apply} disabled={applying}>
              {applying ? "Applying…" : "Apply"}
            </Button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="w-full mt-2 text-[11px] h-7 text-muted-foreground"
            onClick={disconnect}
          >
            Disconnect
          </Button>
        </>
      )}
    </div>
  );
};
