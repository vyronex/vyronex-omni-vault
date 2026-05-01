import { useState, useMemo } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import type { OnChainBalance } from "@/hooks/useOnChainBalances";
import type { ChainPrices } from "@/hooks/useChainPrices";

interface ChainAccountCardProps {
  chain: string;
  address: string;
  isPrimary: boolean;
  onChain?: OnChainBalance;
  loading?: boolean;
  prices?: ChainPrices;
  onSetPrimary?: () => void;
}

const CHAIN_BADGE: Record<string, string> = {
  "BNB Chain": "BSC",
  Ethereum: "ETH",
  Fantom: "FTM",
  Bitcoin: "BTC",
  Solana: "SOL",
  Tron: "TRX",
};

const explorerUrl = (chain: string, address: string): string | null => {
  if (address.startsWith("pending")) return null;
  switch (chain) {
    case "BNB Chain": return `https://bscscan.com/address/${address}`;
    case "Ethereum": return `https://etherscan.io/address/${address}`;
    case "Fantom": return `https://ftmscan.com/address/${address}`;
    case "Bitcoin": return `https://blockstream.info/address/${address}`;
    case "Solana": return `https://solscan.io/account/${address}`;
    case "Tron": return `https://tronscan.org/#/address/${address}`;
    default: return null;
  }
};

export const ChainAccountCard = ({
  chain,
  address,
  isPrimary,
  onChain,
  loading,
  prices,
  onSetPrimary,
}: ChainAccountCardProps) => {
  const [qrOpen, setQrOpen] = useState(false);
  const isPending = address.startsWith("pending");
  const shortAddress = address.length > 16
    ? `${address.slice(0, 6)}...${address.slice(-6)}`
    : address;

  const copyAddress = () => {
    if (isPending) {
      toast.error(`No ${chain} address provisioned yet`);
      return;
    }
    navigator.clipboard.writeText(address);
    toast.success(`${chain} address copied`);
  };

  const explorer = explorerUrl(chain, address);

  // Total positive token balance count for display
  const tokens = onChain?.tokens.filter((t) => t.balance > 0) ?? [];
  const nativeBalance = onChain?.native.balance ?? 0;

  // USD calculations
  const nativeSymbol = onChain?.native.symbol ?? CHAIN_BADGE[chain] ?? "";
  const nativeUsd = prices ? prices.usdValue(nativeSymbol, nativeBalance) : 0;
  const tokenUsds = tokens.map((t) => prices ? prices.usdValue(t.symbol, t.balance) : 0);
  const chainTotal = nativeUsd + tokenUsds.reduce((s, v) => s + v, 0);

  return (
    <>
      <div className={`p-4 rounded-2xl border bg-card transition-all ${isPrimary ? "border-primary/60 shadow-glow" : "border-border/40"}`}>
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-bold text-primary">{CHAIN_BADGE[chain] ?? chain.slice(0, 3)}</span>
            </div>
            <div>
              <p className="font-semibold text-sm" style={{ fontFamily: "'Space Grotesk', system-ui" }}>{chain}</p>
              <p className="text-[11px] text-muted-foreground">
                {isPending ? "Address pending" : "On-chain account"}
              </p>
            </div>
          </div>
          {isPrimary && (
            <span className="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-primary/40 text-primary bg-primary/10">
              Primary
            </span>
          )}
        </div>

        {/* Chain total USD */}
        {!isPending && !loading && chainTotal > 0 && (
          <div className="mb-3 pb-2 border-b border-border/30 flex items-baseline justify-between">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total Value</p>
            <p className="text-sm font-bold text-primary font-mono">${chainTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          </div>
        )}

        {/* Native balance */}
        <div className="flex items-baseline justify-between mb-1">
          <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{onChain?.native.symbol ?? CHAIN_BADGE[chain]}</p>
          <div className="text-right">
            <p className="text-lg font-bold font-mono">
              {loading
                ? "…"
                : isPending
                  ? "—"
                  : nativeBalance.toLocaleString(undefined, { maximumFractionDigits: 6 })}
            </p>
            {!isPending && !loading && nativeUsd > 0 && (
              <p className="text-[10px] text-muted-foreground font-mono">${nativeUsd.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            )}
          </div>
        </div>

        {/* Token balances if any */}
        {tokens.length > 0 && (
          <div className="space-y-1 mb-3 pb-3 border-b border-border/30">
            {tokens.map((t, idx) => (
              <div key={t.address} className="flex justify-between text-xs">
                <span className="text-muted-foreground">{t.symbol}</span>
                <div className="text-right">
                  <span className="font-mono">{t.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}</span>
                  {tokenUsds[idx] > 0 && (
                    <p className="text-[10px] text-muted-foreground font-mono">${tokenUsds[idx].toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Address row */}
        <button
          onClick={copyAddress}
          className="w-full text-left mb-3 px-2 py-1.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
          title={address}
        >
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Address</p>
          <p className="font-mono text-xs truncate">{shortAddress}</p>
        </button>

        {/* Actions */}
        <div className="grid grid-cols-3 gap-2">
          <Button size="sm" variant="outline" className="text-xs h-8" onClick={() => setQrOpen(true)} disabled={isPending}>
            Receive
          </Button>
          <Button size="sm" variant="outline" className="text-xs h-8" onClick={copyAddress} disabled={isPending}>
            Copy
          </Button>
          {explorer ? (
            <Button size="sm" variant="outline" className="text-xs h-8" asChild>
              <a href={explorer} target="_blank" rel="noopener noreferrer">Explorer</a>
            </Button>
          ) : (
            <Button size="sm" variant="outline" className="text-xs h-8" onClick={onSetPrimary} disabled={isPrimary || isPending}>
              {isPrimary ? "Primary" : "Set primary"}
            </Button>
          )}
        </div>
      </div>

      {/* Receive QR dialog */}
      <Dialog open={qrOpen} onOpenChange={setQrOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Receive on {chain}</DialogTitle>
            <DialogDescription>
              Send only {chain} assets to this address. Sending unsupported tokens will result in permanent loss.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex justify-center p-4 rounded-2xl bg-white">
              <QRCodeSVG value={address} size={200} />
            </div>
            <button
              onClick={copyAddress}
              className="w-full p-3 rounded-xl bg-muted/30 border border-border/40 text-left active-press"
            >
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Tap to copy</p>
              <p className="font-mono text-xs break-all">{address}</p>
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
