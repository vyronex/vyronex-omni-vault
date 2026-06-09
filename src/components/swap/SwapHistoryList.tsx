import { useSwapHistory } from "@/hooks/useSwapHistory";
import { useState } from "react";
import { SwapReceiptDialog } from "./SwapReceiptDialog";
import type { SwapRecord } from "@/hooks/useSwapHistory";

const HEADING = { fontFamily: "'Space Grotesk', system-ui" };

const StatusDot = ({ s }: { s: SwapRecord["status"] }) => {
  const color = s === "failed" ? "bg-red-400" : s === "pending" ? "bg-amber-400" : "bg-emerald-400";
  return <span className={`h-1.5 w-1.5 rounded-full ${color}`} />;
};

export const SwapHistoryList = () => {
  const { data, isLoading } = useSwapHistory(15);
  const [selected, setSelected] = useState<SwapRecord | null>(null);

  if (isLoading) {
    return <div className="text-xs text-muted-foreground">Loading history…</div>;
  }
  if (!data || data.length === 0) {
    return <div className="text-xs text-muted-foreground">No swaps yet. Your history will appear here.</div>;
  }

  return (
    <>
      <div className="divide-y divide-border/30">
        {data.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelected(r)}
            className="w-full grid grid-cols-[auto_1fr_auto] items-center gap-3 py-2.5 px-1 text-left hover:bg-background/40 rounded transition"
          >
            <StatusDot s={r.status} />
            <div className="min-w-0">
              <div className="text-sm font-semibold truncate" style={HEADING}>
                {r.amount_in} {r.from_symbol} → {Number(r.amount_out).toFixed(4)} {r.to_symbol}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider">
                {r.mode === "dex" ? r.chain_name ?? "On-chain" : "Custodial"} · {new Date(r.created_at).toLocaleString()}
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
              {r.status}
            </span>
          </button>
        ))}
      </div>
      <SwapReceiptDialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)} record={selected} />
    </>
  );
};
