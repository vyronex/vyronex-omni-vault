import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  vnxBalance: number;
  userEmail?: string | null;
}

type Tier = "Standard" | "Silver" | "Gold";

interface TierConfig {
  tier: Tier;
  threshold: number; // VNX
  queue: string;
  firstResponseSec: number;
  resolutionMin: number;
  accent: string;
  bg: string;
  perks: string[];
}

const TIERS: TierConfig[] = [
  {
    tier: "Standard",
    threshold: 0,
    queue: "general",
    firstResponseSec: 600,
    resolutionMin: 240,
    accent: "text-muted-foreground",
    bg: "bg-muted/30 border-border/40",
    perks: ["Live chat", "Email support", "Knowledge base"],
  },
  {
    tier: "Silver",
    threshold: 50_000,
    queue: "priority",
    firstResponseSec: 120,
    resolutionMin: 60,
    accent: "text-[hsl(var(--vnx-gold))]",
    bg: "bg-[hsl(var(--vnx-gold))]/10 border-[hsl(var(--vnx-gold))]/30",
    perks: ["Priority queue", "Phone support", "<2 min first response"],
  },
  {
    tier: "Gold",
    threshold: 500_000,
    queue: "vip",
    firstResponseSec: 30,
    resolutionMin: 15,
    accent: "text-primary",
    bg: "bg-primary/10 border-primary/30",
    perks: ["Dedicated account manager", "Instant escalation", "<30s first response"],
  },
];

const formatSeconds = (s: number) => (s < 60 ? `${s}s` : s < 3600 ? `<${Math.round(s / 60)}m` : `<${Math.round(s / 3600)}h`);
const formatMinutes = (m: number) => (m < 60 ? `<${m}m` : `<${Math.round(m / 60)}h`);

export const VIPSupportEscalation = ({ vnxBalance, userEmail }: Props) => {
  const current = useMemo(() => {
    let match = TIERS[0];
    for (const t of TIERS) if (vnxBalance >= t.threshold) match = t;
    return match;
  }, [vnxBalance]);

  const nextTier = useMemo(() => {
    const idx = TIERS.findIndex((t) => t.tier === current.tier);
    return TIERS[idx + 1] ?? null;
  }, [current]);

  const progress = nextTier
    ? Math.min(100, (vnxBalance / nextTier.threshold) * 100)
    : 100;

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submitTicket = async () => {
    if (!message.trim()) {
      toast.error("Please describe your issue");
      return;
    }
    if (!userEmail) {
      toast.error("Sign in required");
      return;
    }
    setSubmitting(true);
    try {
      const subject = `[${current.queue.toUpperCase()} · ${current.tier}] Priority ticket — SLA ${formatSeconds(current.firstResponseSec)}`;
      const { error } = await supabase.from("contact_submissions").insert({
        name: userEmail,
        email: userEmail,
        subject,
        message: `VIP Tier: ${current.tier}\nVNX Holdings: ${vnxBalance.toLocaleString()}\nQueue: ${current.queue}\nSLA First Response: ${formatSeconds(current.firstResponseSec)}\nSLA Resolution: ${formatMinutes(current.resolutionMin)}\n\n---\n${message}`,
      });
      if (error) throw error;
      toast.success(`Ticket routed to ${current.queue} queue · ETA ${formatSeconds(current.firstResponseSec)}`);
      setMessage("");
      setOpen(false);
    } catch (err) {
      const e = err as { message?: string };
      toast.error(e?.message ?? "Failed to submit ticket");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className={`p-4 rounded-2xl border ${current.bg} transition-all`}>
        <div className="flex items-baseline justify-between mb-1">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
            Support Tier
          </p>
          <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${current.bg} ${current.accent}`}>
            {current.queue} queue
          </span>
        </div>

        <div className="flex items-baseline gap-2 mb-3">
          <p className={`text-2xl font-bold ${current.accent}`} style={{ fontFamily: "'Space Grotesk', system-ui" }}>
            {current.tier}
          </p>
          <p className="text-[11px] text-muted-foreground font-mono">
            {vnxBalance.toLocaleString()} VNX
          </p>
        </div>

        {/* SLA targets */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2 rounded-lg bg-background/50 border border-border/30 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">First Response</p>
            <p className={`text-sm font-bold font-mono ${current.accent}`}>{formatSeconds(current.firstResponseSec)}</p>
          </div>
          <div className="p-2 rounded-lg bg-background/50 border border-border/30 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Resolution SLA</p>
            <p className={`text-sm font-bold font-mono ${current.accent}`}>{formatMinutes(current.resolutionMin)}</p>
          </div>
        </div>

        {/* Tier progression */}
        {nextTier ? (
          <div className="mb-3">
            <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
              <span>{Math.max(0, nextTier.threshold - vnxBalance).toLocaleString()} VNX to {nextTier.tier}</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <Progress value={progress} className="h-1.5" />
          </div>
        ) : (
          <div className="mb-3 p-2 rounded-lg bg-primary/10 border border-primary/30 text-center">
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary">Highest Tier · Auto-Escalation Enabled</p>
          </div>
        )}

        <Button
          size="sm"
          className="w-full rounded-xl gradient-primary shadow-glow active-press h-9 text-xs"
          onClick={() => setOpen(true)}
          disabled={!userEmail}
        >
          Open {current.tier === "Standard" ? "Support" : "Priority"} Ticket
        </Button>

        {current.tier !== "Standard" && (
          <p className="mt-2 text-[10px] text-center text-muted-foreground">
            Your tickets are auto-routed to the <span className={`font-bold ${current.accent}`}>{current.queue}</span> queue.
          </p>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {current.tier === "Standard" ? "Submit Support Ticket" : `Priority Ticket · ${current.tier}`}
            </DialogTitle>
            <DialogDescription>
              Routes to the <span className={`font-bold ${current.accent}`}>{current.queue}</span> queue with an SLA of {formatSeconds(current.firstResponseSec)} for first response and {formatMinutes(current.resolutionMin)} for resolution.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {TIERS.map((t) => (
                <div
                  key={t.tier}
                  className={`p-2 rounded-lg border text-center ${t.tier === current.tier ? t.bg : "bg-muted/20 border-border/30 opacity-50"}`}
                >
                  <p className={`text-[10px] uppercase tracking-wider font-bold ${t.tier === current.tier ? t.accent : "text-muted-foreground"}`}>
                    {t.tier}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground">{formatSeconds(t.firstResponseSec)}</p>
                </div>
              ))}
            </div>

            <Textarea
              placeholder="Describe your issue. Include order IDs, transaction hashes, or screenshots when relevant."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="text-sm"
            />

            <div className="p-2 rounded-lg bg-muted/30 border border-border/30 text-[10px] text-muted-foreground">
              Filed as <span className="font-mono">{userEmail ?? "anonymous"}</span> · queue <span className={`font-bold ${current.accent}`}>{current.queue}</span> · target {formatSeconds(current.firstResponseSec)}
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button className="gradient-primary" onClick={submitTicket} disabled={submitting}>
              {submitting ? "Routing…" : "Submit & Route"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
