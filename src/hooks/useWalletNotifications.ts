import { useEffect, useRef, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { useVNXPrice } from "./useVNXPrice";

// ───────────────────────────────────────────────────────────────────
// Types & storage
// ───────────────────────────────────────────────────────────────────
export interface NotificationPrefs {
  enabled: boolean;
  incoming: boolean;     // deposits + transfer credits
  outgoing: boolean;     // withdrawals + transfer debits
  staking: boolean;      // staking_records inserts/updates
  priceAlerts: boolean;
  priceAbove: number | null;
  priceBelow: number | null;
}

const DEFAULT_PREFS: NotificationPrefs = {
  enabled: false,
  incoming: true,
  outgoing: true,
  staking: true,
  priceAlerts: true,
  priceAbove: null,
  priceBelow: null,
};

const PREFS_KEY = "wallet_notif_prefs_v1";

const loadPrefs = (): NotificationPrefs => {
  if (typeof window === "undefined") return DEFAULT_PREFS;
  try {
    const raw = localStorage.getItem(PREFS_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_PREFS;
  }
};

const savePrefs = (p: NotificationPrefs) => {
  try { localStorage.setItem(PREFS_KEY, JSON.stringify(p)); } catch { /* ignore */ }
};

// ───────────────────────────────────────────────────────────────────
// Helpers
// ───────────────────────────────────────────────────────────────────
const canNotify = () =>
  typeof window !== "undefined" && "Notification" in window;

const fire = (title: string, body: string, tag?: string) => {
  if (!canNotify() || Notification.permission !== "granted") return;
  try {
    new Notification(title, {
      body,
      tag,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
    });
  } catch { /* ignore */ }
};

interface TransactionRow {
  id: string;
  user_id: string;
  tx_type: string;
  status: string;
  token_symbol: string;
  amount: number | string;
  chain: string;
  from_address?: string | null;
  to_address?: string | null;
}

interface StakingRow {
  id: string;
  user_id: string;
  status: string;
  token_symbol: string;
  amount: number | string;
  rewards_earned?: number | string;
}

// ───────────────────────────────────────────────────────────────────
// Hook
// ───────────────────────────────────────────────────────────────────
export const useWalletNotifications = () => {
  const { user } = useAuth();
  const { data: vnx } = useVNXPrice();

  const [prefs, setPrefsState] = useState<NotificationPrefs>(loadPrefs);
  const [permission, setPermission] = useState<NotificationPermission>(
    canNotify() ? Notification.permission : "denied",
  );

  // Keep refs in sync so realtime callbacks always see latest prefs
  const prefsRef = useRef(prefs);
  useEffect(() => { prefsRef.current = prefs; savePrefs(prefs); }, [prefs]);

  const userIdRef = useRef<string | null>(null);
  useEffect(() => { userIdRef.current = user?.id ?? null; }, [user?.id]);

  const setPrefs = useCallback((updater: Partial<NotificationPrefs> | ((p: NotificationPrefs) => NotificationPrefs)) => {
    setPrefsState((prev) => typeof updater === "function" ? updater(prev) : { ...prev, ...updater });
  }, []);

  // Permission request
  const requestPermission = useCallback(async () => {
    if (!canNotify()) return "denied" as NotificationPermission;
    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === "granted") {
      setPrefs({ enabled: true });
      fire("Notifications enabled", "You'll receive wallet activity alerts here.", "permission-granted");
    }
    return result;
  }, [setPrefs]);

  // ── Realtime: transactions ────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`notif-tx-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const p = prefsRef.current;
          if (!p.enabled) return;
          const row = payload.new as TransactionRow;
          const amt = Number(row.amount);
          const sym = row.token_symbol;
          const type = row.tx_type;

          // Direction: deposit + credit-side transfer = incoming.
          // withdraw + debit-side transfer = outgoing.
          const isIncoming = type === "deposit" ||
            (type === "transfer" && row.to_address === user.id);
          const isOutgoing = type === "withdraw" ||
            (type === "transfer" && row.from_address === user.id);

          if (isIncoming && p.incoming) {
            fire(
              `Incoming ${sym}`,
              `+${amt} ${sym} · ${row.chain} · ${row.status}`,
              `tx-${row.id}`,
            );
          } else if (isOutgoing && p.outgoing) {
            fire(
              `Outgoing ${sym}`,
              `-${amt} ${sym} · ${row.chain} · ${row.status}`,
              `tx-${row.id}`,
            );
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "transactions", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const p = prefsRef.current;
          if (!p.enabled) return;
          const row = payload.new as TransactionRow;
          const old = payload.old as TransactionRow;
          if (old.status !== row.status && row.status === "confirmed") {
            const isIn = row.tx_type === "deposit" ||
              (row.tx_type === "transfer" && row.to_address === user.id);
            if ((isIn && !p.incoming) || (!isIn && !p.outgoing)) return;
            fire(
              `${row.token_symbol} ${row.tx_type} confirmed`,
              `${Number(row.amount)} ${row.token_symbol} on ${row.chain}`,
              `tx-conf-${row.id}`,
            );
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // ── Realtime: staking ─────────────────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    const channel = supabase
      .channel(`notif-stake-${user.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "staking_records", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const p = prefsRef.current;
          if (!p.enabled || !p.staking) return;
          const row = payload.new as StakingRow;
          fire(
            `Stake activated`,
            `${Number(row.amount)} ${row.token_symbol} now earning rewards`,
            `stake-${row.id}`,
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "staking_records", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const p = prefsRef.current;
          if (!p.enabled || !p.staking) return;
          const row = payload.new as StakingRow;
          const old = payload.old as StakingRow;
          if (old.status !== row.status) {
            fire(
              `Stake ${row.status}`,
              `${Number(row.amount)} ${row.token_symbol}`,
              `stake-status-${row.id}`,
            );
          } else {
            const newR = Number(row.rewards_earned ?? 0);
            const oldR = Number(old.rewards_earned ?? 0);
            // Notify on meaningful reward jumps (>= 1 unit) to avoid spam
            if (newR - oldR >= 1) {
              fire(
                `Rewards updated`,
                `+${(newR - oldR).toFixed(4)} ${row.token_symbol}`,
                `stake-rewards-${row.id}`,
              );
            }
          }
        },
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  // ── VNX price alerts ──────────────────────────────────────────────
  const lastAlertRef = useRef<{ above: number | null; below: number | null }>({ above: null, below: null });

  useEffect(() => {
    if (!prefs.enabled || !prefs.priceAlerts || !vnx?.price) return;
    const price = vnx.price;
    const { priceAbove, priceBelow } = prefs;

    if (priceAbove !== null && price >= priceAbove && lastAlertRef.current.above !== priceAbove) {
      fire(
        "VNX price alert",
        `VNX at $${price.toFixed(6)} (above $${priceAbove})`,
        `vnx-above-${priceAbove}`,
      );
      lastAlertRef.current.above = priceAbove;
    }
    if (priceBelow !== null && price <= priceBelow && lastAlertRef.current.below !== priceBelow) {
      fire(
        "VNX price alert",
        `VNX at $${price.toFixed(6)} (below $${priceBelow})`,
        `vnx-below-${priceBelow}`,
      );
      lastAlertRef.current.below = priceBelow;
    }
  }, [vnx?.price, prefs]);

  // Reset cooldown when user changes thresholds
  useEffect(() => {
    lastAlertRef.current = { above: null, below: null };
  }, [prefs.priceAbove, prefs.priceBelow]);

  return { prefs, setPrefs, permission, requestPermission, supported: canNotify(), vnxPrice: vnx?.price ?? null };
};
