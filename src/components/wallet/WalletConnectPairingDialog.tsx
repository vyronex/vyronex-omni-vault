import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import type { WalletConnectStatus } from "@/hooks/useWalletConnect";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pairingUri: string | null;
  status: WalletConnectStatus;
  error: string | null;
  account?: string | null;
  onCancel: () => void;
  onRetry: () => void;
}

type TimelineKey =
  | "init"
  | "uri_created"
  | "awaiting_scan"
  | "scanned"
  | "approved"
  | "connected"
  | "failed";

interface TimelineEvent {
  key: TimelineKey;
  label: string;
  at: number;
  tone: "ok" | "pending" | "error";
  detail?: string;
}

const fmtTime = (t: number) => {
  const d = new Date(t);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
};

const classifyFailure = (msg: string | null): string => {
  if (!msg) return "Unknown failure";
  const m = msg.toLowerCase();
  if (m.includes("reject")) return "Connection rejected in wallet";
  if (m.includes("expired") || m.includes("expire")) return "Pairing code expired — request a new one";
  if (m.includes("timeout")) return "Wallet did not respond in time";
  if (m.includes("project") && m.includes("id")) return "Invalid WalletConnect Project ID";
  if (m.includes("network") || m.includes("fetch")) return "Network error reaching WalletConnect relay";
  if (m.includes("user disapproved") || m.includes("user denied")) return "User denied the request";
  if (m.includes("unsupported")) return "Wallet does not support the requested chain";
  return msg;
};

// Common mobile wallet deep-link prefixes
const MOBILE_WALLETS: { name: string; build: (uri: string) => string }[] = [
  { name: "Trust", build: (u) => `https://link.trustwallet.com/wc?uri=${encodeURIComponent(u)}` },
  { name: "Rainbow", build: (u) => `https://rnbwapp.com/wc?uri=${encodeURIComponent(u)}` },
  { name: "MetaMask", build: (u) => `https://metamask.app.link/wc?uri=${encodeURIComponent(u)}` },
  { name: "Zerion", build: (u) => `https://wallet.zerion.io/wc?uri=${encodeURIComponent(u)}` },
  { name: "1inch", build: (u) => `https://wallet.1inch.io/wc?uri=${encodeURIComponent(u)}` },
  { name: "SafePal", build: (u) => `https://link.safepal.io/wc?uri=${encodeURIComponent(u)}` },
];

const statusMeta: Record<WalletConnectStatus, { label: string; tone: string }> = {
  idle: { label: "Idle", tone: "text-muted-foreground" },
  initializing: { label: "Initializing", tone: "text-muted-foreground" },
  awaiting_uri: { label: "Generating pairing code", tone: "text-muted-foreground" },
  awaiting_approval: { label: "Awaiting wallet approval", tone: "text-amber-400" },
  connecting: { label: "Finalizing handshake", tone: "text-amber-400" },
  connected: { label: "Connected", tone: "text-emerald-400" },
  disconnected: { label: "Disconnected", tone: "text-muted-foreground" },
  error: { label: "Error", tone: "text-destructive" },
};

export const WalletConnectPairingDialog = ({
  open, onOpenChange, pairingUri, status, error, account, onCancel, onRetry,
}: Props) => {
  const [qrSvg, setQrSvg] = useState<string>("");
  const [showRaw, setShowRaw] = useState(false);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const seenRef = useRef<Set<TimelineKey>>(new Set());
  const meta = statusMeta[status];

  const pushEvent = (e: Omit<TimelineEvent, "at"> & { at?: number }) => {
    if (seenRef.current.has(e.key)) return;
    seenRef.current.add(e.key);
    setTimeline((t) => [...t, { ...e, at: e.at ?? Date.now() }]);
  };

  // Reset timeline whenever the dialog opens fresh
  useEffect(() => {
    if (open) {
      seenRef.current = new Set();
      setTimeline([]);
      seenRef.current.add("init");
      setTimeline([{ key: "init", label: "Pairing session started", tone: "ok", at: Date.now() }]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Track status transitions into timeline events
  useEffect(() => {
    if (!open) return;
    if ((status === "awaiting_approval" || status === "connecting" || status === "connected") && pairingUri) {
      pushEvent({ key: "uri_created", label: "Pairing URI generated", tone: "ok" });
    }
    if (status === "awaiting_approval") {
      pushEvent({ key: "awaiting_scan", label: "Awaiting QR scan / deep-link", tone: "pending" });
    }
    if (status === "connecting") {
      pushEvent({ key: "scanned", label: "Wallet scanned code, handshake in progress", tone: "pending" });
    }
    if (status === "connected") {
      pushEvent({ key: "scanned", label: "Wallet scanned code", tone: "ok" });
      pushEvent({
        key: "approved",
        label: account ? `Account approved (${account.slice(0, 6)}…${account.slice(-4)})` : "Accounts approved",
        tone: "ok",
      });
      pushEvent({ key: "connected", label: "Session established", tone: "ok" });
    }
    if (status === "error") {
      pushEvent({ key: "failed", label: "Pairing failed", tone: "error", detail: classifyFailure(error) });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, pairingUri, account, error, open]);

  useEffect(() => {
    if (!pairingUri) { setQrSvg(""); return; }
    QRCode.toString(pairingUri, {
      type: "svg",
      errorCorrectionLevel: "M",
      margin: 1,
      width: 320,
      color: { dark: "#ffffff", light: "#00000000" },
    }).then(setQrSvg).catch(() => setQrSvg(""));
  }, [pairingUri]);

  const copyUri = async () => {
    if (!pairingUri) return;
    try {
      await navigator.clipboard.writeText(pairingUri);
      toast.success("Pairing URI copied");
    } catch {
      toast.error("Copy failed — long-press to select");
    }
  };

  const handleClose = () => {
    if (status !== "connected") onCancel();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else onOpenChange(true); }}>
      <DialogContent className="max-w-md p-0 bg-card border-border/40">
        <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/30">
          <DialogTitle
            className="text-base font-bold tracking-tight"
            style={{ fontFamily: "'Space Grotesk', system-ui" }}
          >
            Pair Wallet via WalletConnect
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Scan with a mobile wallet, deep-link, or paste the URI into a hardware wallet bridge.
          </DialogDescription>
        </DialogHeader>

        {/* Status pill */}
        <div className="px-5 pt-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                status === "connected"
                  ? "bg-emerald-400"
                  : status === "awaiting_approval" || status === "connecting"
                    ? "bg-amber-400 animate-pulse"
                    : status === "error"
                      ? "bg-destructive"
                      : "bg-muted-foreground"
              }`}
            />
            <span className={`text-[11px] uppercase tracking-wider font-bold ${meta.tone}`}>
              {meta.label}
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground">WC v2</span>
        </div>

        {/* QR */}
        <div className="px-5 pt-3 pb-2">
          <div className="aspect-square w-full rounded-2xl border border-border/40 bg-background/40 flex items-center justify-center overflow-hidden">
            {qrSvg ? (
              <div
                className="w-full h-full p-4 flex items-center justify-center"
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground text-xs">
                <span className="h-8 w-8 rounded-full border-2 border-border/40 border-t-primary animate-spin" />
                {status === "error" ? "Pairing failed" : "Generating QR…"}
              </div>
            )}
          </div>
          {error && (
            <p className="mt-2 text-[10px] text-destructive text-center">{error}</p>
          )}
        </div>

        {/* Manual URI */}
        <div className="px-5 pb-2">
          <div className="flex items-center justify-between mb-1">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
              Manual Pairing URI
            </p>
            <button
              type="button"
              className="text-[10px] text-primary uppercase tracking-wider font-bold"
              onClick={() => setShowRaw((s) => !s)}
            >
              {showRaw ? "Hide" : "Show"}
            </button>
          </div>
          {showRaw && (
            <Input
              readOnly
              value={pairingUri ?? ""}
              className="h-9 text-[11px] font-mono mb-2"
              onFocus={(e) => e.currentTarget.select()}
            />
          )}
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="sm" variant="outline"
              className="h-9 rounded-xl text-xs"
              onClick={copyUri}
              disabled={!pairingUri}
            >
              Copy URI
            </Button>
            <Button
              size="sm" variant="outline"
              className="h-9 rounded-xl text-xs"
              onClick={onRetry}
              disabled={status === "awaiting_uri" || status === "awaiting_approval"}
            >
              {status === "error" ? "Retry" : "New Code"}
            </Button>
          </div>
        </div>

        {/* Mobile wallet deep links */}
        <div className="px-5 pb-3">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">
            Open in mobile wallet
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            {MOBILE_WALLETS.map((w) => (
              <a
                key={w.name}
                href={pairingUri ? w.build(pairingUri) : "#"}
                target="_blank"
                rel="noreferrer"
                aria-disabled={!pairingUri}
                className={`h-9 rounded-xl border border-border/40 bg-background/60 text-[11px] font-bold flex items-center justify-center transition-colors ${
                  pairingUri ? "hover:bg-primary/10 hover:border-primary/40" : "opacity-40 pointer-events-none"
                }`}
              >
                {w.name}
              </a>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-border/30 flex items-center justify-between">
          <p className="text-[10px] text-muted-foreground">
            Hardware wallets: paste URI into Ledger Live / KeepKey bridge.
          </p>
          <Button
            size="sm" variant="ghost"
            className="h-7 text-[11px] text-muted-foreground"
            onClick={handleClose}
          >
            {status === "connected" ? "Close" : "Cancel"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
