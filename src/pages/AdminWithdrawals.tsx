import { useEffect, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { useAllWithdrawals, useWithdrawActions, type WithdrawalRequest } from "@/hooks/useWithdrawals";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { formatDistanceToNow } from "date-fns";

const TABS = [
  { k: "pending_review", label: "Pending Review" },
  { k: "pending_confirmation", label: "Awaiting Confirm" },
  { k: "approved", label: "Approved" },
  { k: "broadcasting", label: "Broadcasting" },
  { k: "completed", label: "Completed" },
  { k: "failed", label: "Failed" },
  { k: "rejected", label: "Rejected" },
  { k: "all", label: "All" },
];

const AdminWithdrawals = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [tab, setTab] = useState("pending_review");
  const { data: rows, isLoading } = useAllWithdrawals(tab);
  const { adminAction } = useWithdrawActions();

  const [selected, setSelected] = useState<WithdrawalRequest | null>(null);
  const [notes, setNotes] = useState("");
  const [txHash, setTxHash] = useState("");

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate("/auth"); return; }
    supabase.rpc("has_role", { _user_id: user.id, _role: "admin" }).then(({ data }) => {
      setIsAdmin(Boolean(data));
    });
  }, [user, loading, navigate]);

  const openRow = (r: WithdrawalRequest) => {
    setSelected(r); setNotes(r.admin_notes ?? ""); setTxHash(r.tx_hash ?? "");
  };

  const run = async (action: "approve" | "reject" | "mark_completed" | "mark_failed") => {
    if (!selected) return;
    await adminAction.mutateAsync({
      request_id: selected.id, action, notes: notes || undefined,
      tx_hash: txHash || undefined,
      failure_reason: action === "mark_failed" ? notes : undefined,
    });
    setSelected(null);
  };

  if (isAdmin === null) return null;
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-3xl mx-auto p-8 text-center">
          <h1 className="text-2xl font-bold mb-2">Admin only</h1>
          <p className="text-muted-foreground">You need the admin role to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <h1 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
            Withdrawal Queue
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Review, approve, or reject user withdrawal requests. Approving EVM native tokens auto-broadcasts on-chain.
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {TABS.map((t) => (
              <button key={t.k} onClick={() => setTab(t.k)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  tab === t.k ? "bg-primary text-primary-foreground border-primary" : "border-border/60 hover:border-primary/40"
                }`}>
                {t.label}
              </button>
            ))}
          </div>

          {isLoading && <div className="text-center py-8 text-sm text-muted-foreground">Loading…</div>}
          {!isLoading && (!rows || rows.length === 0) && (
            <div className="text-center py-8 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
              No withdrawals in this queue.
            </div>
          )}

          <div className="space-y-2">
            {(rows ?? []).map((r) => (
              <button key={r.id} onClick={() => openRow(r)}
                className="w-full text-left p-4 rounded-xl border border-border/60 bg-card/50 hover:bg-card hover:border-primary/40 transition">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-semibold">{r.amount} {r.token_symbol}</span>
                    <span className="text-xs text-muted-foreground">{r.chain}</span>
                    <Badge variant="outline" className="text-[10px]">{r.status.replace(/_/g, " ")}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
                  </div>
                </div>
                <div className="mt-1 text-xs font-mono text-muted-foreground truncate">
                  user {r.user_id.slice(0, 8)}… → {r.to_address}
                </div>
              </button>
            ))}
          </div>
        </div>
        <Footer />
      </div>

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Withdrawal {selected?.id.slice(0, 8)}</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-3 text-sm">
              <Grid label="User" value={selected.user_id} mono />
              <Grid label="Token / Chain" value={`${selected.token_symbol} · ${selected.chain}`} />
              <Grid label="Amount / Fee / Net" value={`${selected.amount} / ${selected.fee} / ${selected.net_amount}`} />
              <Grid label="Destination" value={selected.to_address} mono />
              <Grid label="Status" value={selected.status} />
              {selected.tx_hash && <Grid label="Tx Hash" value={selected.tx_hash} mono />}
              {selected.failure_reason && <Grid label="Failure" value={selected.failure_reason} />}

              <div>
                <label className="text-xs text-muted-foreground">Tx hash (for manual completion)</label>
                <Input value={txHash} onChange={(e) => setTxHash(e.target.value)} className="font-mono text-xs" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Notes</label>
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
              </div>
            </div>
          )}
          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => run("reject")} disabled={adminAction.isPending}>Reject & Refund</Button>
            <Button variant="outline" onClick={() => run("mark_failed")} disabled={adminAction.isPending}>Mark Failed</Button>
            <Button variant="outline" onClick={() => run("mark_completed")} disabled={adminAction.isPending}>Mark Completed</Button>
            <Button className="gradient-primary" onClick={() => run("approve")} disabled={adminAction.isPending}>
              Approve & Broadcast
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
};

const Grid = ({ label, value, mono }: { label: string; value: string; mono?: boolean }) => (
  <div className="flex justify-between gap-2 p-2 rounded bg-muted/30">
    <span className="text-muted-foreground text-xs">{label}</span>
    <span className={`text-xs text-right break-all ${mono ? "font-mono" : ""}`}>{value}</span>
  </div>
);

export default AdminWithdrawals;
