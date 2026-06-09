import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SwapRecord } from "@/hooks/useSwapHistory";

const EXPLORERS: Record<number, string> = {
  56: "https://bscscan.com/tx/",
  1: "https://etherscan.io/tx/",
  137: "https://polygonscan.com/tx/",
  250: "https://ftmscan.com/tx/",
  42161: "https://arbiscan.io/tx/",
};

const HEADING = { fontFamily: "'Space Grotesk', system-ui" };

const StatusBadge = ({ status }: { status: SwapRecord["status"] }) => {
  const map: Record<SwapRecord["status"], { label: string; cls: string }> = {
    pending: { label: "Pending", cls: "bg-amber-400/10 text-amber-300 border-amber-400/30" },
    confirmed: { label: "Confirmed", cls: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30" },
    settled: { label: "Settled", cls: "bg-emerald-400/10 text-emerald-300 border-emerald-400/30" },
    failed: { label: "Failed", cls: "bg-red-400/10 text-red-300 border-red-400/30" },
  };
  const m = map[status];
  return (
    <span className={`px-2 py-0.5 rounded-md border text-[10px] uppercase tracking-wider ${m.cls}`}>
      {m.label}
    </span>
  );
};

const Row = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex justify-between gap-3 text-xs">
    <span className="text-muted-foreground uppercase tracking-wider">{label}</span>
    <span className="font-medium text-right break-all">{value}</span>
  </div>
);

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  record: SwapRecord | null;
  /** Optional live timeline events to render (pending → broadcast → confirmed). */
  timeline?: Array<{ label: string; at: number }>;
}

export const SwapReceiptDialog = ({ open, onOpenChange, record, timeline }: Props) => {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!open) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [open]);

  if (!record) return null;
  const explorer = record.chain_id && record.tx_hash ? `${EXPLORERS[record.chain_id] ?? ""}${record.tx_hash}` : null;
  const elapsed = Math.max(0, Math.floor((now - new Date(record.created_at).getTime()) / 1000));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md bg-background border-border/50">
        <DialogHeader>
          <div className="flex items-center justify-between gap-3">
            <DialogTitle style={HEADING} className="text-lg">Swap Receipt</DialogTitle>
            <StatusBadge status={record.status} />
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Headline */}
          <div className="rounded-xl border border-border/40 bg-background/40 p-4 text-center">
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
              {record.mode === "dex" ? `${record.chain_name ?? "On-chain"} swap` : "Custodial swap"}
            </div>
            <div className="text-base font-bold" style={HEADING}>
              {record.amount_in} {record.from_symbol}
              <span className="text-muted-foreground mx-2">→</span>
              {Number(record.amount_out).toFixed(6)} {record.to_symbol}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1.5">
            <Row label="Rate" value={record.rate ? `1 ${record.from_symbol} ≈ ${Number(record.rate).toFixed(6)} ${record.to_symbol}` : "—"} />
            {record.fee_amount != null ? (
              <Row label="Fee" value={`${Number(record.fee_amount).toFixed(6)} ${record.fee_symbol ?? ""}`} />
            ) : null}
            {record.slippage != null ? <Row label="Slippage" value={`${record.slippage}%`} /> : null}
            {record.price_impact != null ? <Row label="Price impact" value={`${Number(record.price_impact).toFixed(2)}%`} /> : null}
            {record.route ? <Row label="Route" value={record.route} /> : null}
            {record.signer_address ? (
              <Row label="Signer" value={`${record.signer_address.slice(0, 6)}…${record.signer_address.slice(-4)}`} />
            ) : null}
            {explorer ? (
              <Row label="Tx" value={
                <a href={explorer} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                  {record.tx_hash?.slice(0, 10)}…{record.tx_hash?.slice(-6)}
                </a>
              } />
            ) : null}
            <Row label="Submitted" value={new Date(record.created_at).toLocaleTimeString()} />
            {record.status === "pending" ? <Row label="Elapsed" value={`${elapsed}s`} /> : null}
            {record.error_message ? (
              <Row label="Error" value={<span className="text-red-400">{record.error_message}</span>} />
            ) : null}
          </div>

          {/* Live status timeline */}
          {timeline && timeline.length > 0 ? (
            <div className="rounded-xl border border-border/30 bg-background/30 p-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground mb-2">Live status</div>
              <ol className="space-y-1.5">
                {timeline.map((ev, i) => (
                  <li key={i} className="flex justify-between text-xs">
                    <span className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary/70" />
                      {ev.label}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                      {new Date(ev.at).toLocaleTimeString()}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};
