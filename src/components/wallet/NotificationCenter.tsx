import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { useWalletNotifications } from "@/hooks/useWalletNotifications";

export const NotificationCenter = () => {
  const { prefs, setPrefs, permission, requestPermission, supported, vnxPrice } = useWalletNotifications();
  const [aboveDraft, setAboveDraft] = useState(prefs.priceAbove?.toString() ?? "");
  const [belowDraft, setBelowDraft] = useState(prefs.priceBelow?.toString() ?? "");

  const granted = permission === "granted";
  const denied = permission === "denied";

  const applyThresholds = () => {
    const above = aboveDraft.trim() ? Number(aboveDraft) : null;
    const below = belowDraft.trim() ? Number(belowDraft) : null;
    setPrefs({
      priceAbove: above !== null && isFinite(above) && above > 0 ? above : null,
      priceBelow: below !== null && isFinite(below) && below > 0 ? below : null,
    });
  };

  return (
    <div className="p-4 rounded-2xl border border-border/40 bg-card">
      <div className="flex items-baseline justify-between mb-3">
        <p
          className="text-xs font-bold uppercase tracking-wider text-muted-foreground"
          style={{ fontFamily: "'Space Grotesk', system-ui" }}
        >
          Push Alerts
        </p>
        <span className="text-[10px] uppercase tracking-wider font-bold text-primary">
          {!supported ? "UNSUPPORTED" : granted ? (prefs.enabled ? "LIVE" : "PAUSED") : denied ? "BLOCKED" : "OFF"}
        </span>
      </div>

      {!supported && (
        <p className="text-[11px] text-muted-foreground">
          Your browser does not support web notifications.
        </p>
      )}

      {supported && !granted && (
        <>
          <p className="text-xs text-muted-foreground mb-3">
            Get desktop alerts for transactions, staking activity, and VNX price moves.
          </p>
          <Button
            size="sm"
            className="w-full rounded-xl gradient-primary shadow-glow active-press h-10"
            onClick={requestPermission}
            disabled={denied}
          >
            {denied ? "Permission Blocked" : "Enable Notifications"}
          </Button>
          {denied && (
            <p className="mt-2 text-[10px] text-muted-foreground">
              Re-enable notifications for this site in your browser settings.
            </p>
          )}
        </>
      )}

      {supported && granted && (
        <div className="space-y-3">
          <Row
            label="Master switch"
            sub="Pause all alerts without losing settings"
            checked={prefs.enabled}
            onCheckedChange={(v) => setPrefs({ enabled: v })}
          />
          <div className="border-t border-border/30" />
          <Row
            label="Incoming transactions"
            sub="Deposits and transfer credits"
            checked={prefs.incoming}
            onCheckedChange={(v) => setPrefs({ incoming: v })}
            disabled={!prefs.enabled}
          />
          <Row
            label="Outgoing transactions"
            sub="Withdrawals and transfer debits"
            checked={prefs.outgoing}
            onCheckedChange={(v) => setPrefs({ outgoing: v })}
            disabled={!prefs.enabled}
          />
          <Row
            label="Staking & farming"
            sub="Activations, unlocks, reward jumps"
            checked={prefs.staking}
            onCheckedChange={(v) => setPrefs({ staking: v })}
            disabled={!prefs.enabled}
          />
          <div className="border-t border-border/30" />
          <Row
            label="VNX price alerts"
            sub={vnxPrice ? `Live: $${vnxPrice.toFixed(6)}` : "Awaiting price feed"}
            checked={prefs.priceAlerts}
            onCheckedChange={(v) => setPrefs({ priceAlerts: v })}
            disabled={!prefs.enabled}
          />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Alert above</label>
              <Input
                value={aboveDraft}
                onChange={(e) => setAboveDraft(e.target.value)}
                onBlur={applyThresholds}
                placeholder="e.g. 0.01"
                inputMode="decimal"
                className="h-8 text-xs font-mono mt-1"
                disabled={!prefs.enabled || !prefs.priceAlerts}
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Alert below</label>
              <Input
                value={belowDraft}
                onChange={(e) => setBelowDraft(e.target.value)}
                onBlur={applyThresholds}
                placeholder="e.g. 0.005"
                inputMode="decimal"
                className="h-8 text-xs font-mono mt-1"
                disabled={!prefs.enabled || !prefs.priceAlerts}
              />
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 text-[11px] rounded-xl"
            onClick={applyThresholds}
            disabled={!prefs.enabled || !prefs.priceAlerts}
          >
            Apply Price Thresholds
          </Button>
        </div>
      )}
    </div>
  );
};

const Row = ({
  label, sub, checked, onCheckedChange, disabled,
}: {
  label: string;
  sub?: string;
  checked: boolean;
  onCheckedChange: (v: boolean) => void;
  disabled?: boolean;
}) => (
  <div className="flex items-start justify-between gap-3">
    <div className="min-w-0">
      <p className="text-xs font-semibold leading-tight">{label}</p>
      {sub && <p className="text-[10px] text-muted-foreground mt-0.5">{sub}</p>}
    </div>
    <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
  </div>
);
