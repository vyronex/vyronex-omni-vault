import { useMyWithdrawals, useWithdrawActions, type WithdrawalRequest } from "@/hooks/useWithdrawals";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

const STATUS_TONE: Record<string, string> = {
  pending_confirmation: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  pending_review: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  approved: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  broadcasting: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
  completed: "bg-primary/10 text-primary border-primary/30",
  failed: "bg-destructive/10 text-destructive border-destructive/30",
  rejected: "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

const EXPLORER: Record<string, string> = {
  "BNB Chain": "https://bscscan.com/tx/",
  Ethereum: "https://etherscan.io/tx/",
  Fantom: "https://ftmscan.com/tx/",
  Bitcoin: "https://mempool.space/tx/",
  Solana: "https://solscan.io/tx/",
  Tron: "https://tronscan.org/#/transaction/",
};

export const WithdrawalHistory = () => {
  const { data: rows, isLoading } = useMyWithdrawals();
  const { cancel } = useWithdrawActions();

  if (isLoading) {
    return <div className="p-6 text-center text-sm text-muted-foreground">Loading withdrawals…</div>;
  }
  if (!rows || rows.length === 0) {
    return <div className="p-6 text-center text-sm text-muted-foreground">No withdrawal history yet</div>;
  }

  return (
    <div className="space-y-2">
      {rows.map((r) => (
        <Row key={r.id} row={r} onCancel={() => cancel.mutate(r.id)} />
      ))}
    </div>
  );
};

const Row = ({ row, onCancel }: { row: WithdrawalRequest; onCancel: () => void }) => {
  const canCancel = ["pending_confirmation", "pending_review"].includes(row.status);
  const explorer = row.tx_hash ? EXPLORER[row.chain] : null;
  return (
    <div className="p-4 rounded-xl border border-border/60 bg-card/50 hover:bg-card transition">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold">{row.amount} {row.token_symbol}</span>
            <span className="text-xs text-muted-foreground">on {row.chain}</span>
            <Badge variant="outline" className={`text-[10px] ${STATUS_TONE[row.status] ?? ""}`}>
              {row.status.replace(/_/g, " ")}
            </Badge>
          </div>
          <div className="mt-1 text-xs text-muted-foreground font-mono truncate">
            → {row.to_address}
          </div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {formatDistanceToNow(new Date(row.created_at), { addSuffix: true })} ·
            fee {row.fee} {row.token_symbol} · receives {row.net_amount}
          </div>
          {row.failure_reason && (
            <div className="mt-1 text-xs text-destructive">Failed: {row.failure_reason}</div>
          )}
          {row.admin_notes && (
            <div className="mt-1 text-xs text-muted-foreground italic">Admin: {row.admin_notes}</div>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          {explorer && row.tx_hash && (
            <a href={explorer + row.tx_hash} target="_blank" rel="noreferrer"
               className="text-xs text-primary hover:underline">View tx ↗</a>
          )}
          {canCancel && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
