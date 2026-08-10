/**
 * Exchange data layer.
 *
 * Architecture note: every consumer reads through these hooks so that the
 * simulated feed below can be swapped for a real REST + WebSocket transport
 * without touching UI code. `subscribeTicker` mirrors a WS subscription
 * contract (subscribe -> callback -> unsubscribe).
 */
import { useEffect, useMemo, useRef, useState } from "react";

export type Side = "buy" | "sell";
export type OrderStatus = "open" | "partially_filled" | "filled" | "canceled";
export type TxStatus = "completed" | "pending" | "processing" | "failed";

export interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  category: ("spot" | "futures" | "new")[];
}

const SEED: Omit<MarketAsset, "high24h" | "low24h">[] = [
  { symbol: "BTC", name: "Bitcoin", price: 96420.15, change24h: 2.41, volume24h: 42_180_000_000, marketCap: 1_910_000_000_000, category: ["spot", "futures"] },
  { symbol: "ETH", name: "Ethereum", price: 3364.88, change24h: 3.12, volume24h: 18_940_000_000, marketCap: 404_000_000_000, category: ["spot", "futures"] },
  { symbol: "USDT", name: "Tether", price: 1.0, change24h: 0.01, volume24h: 61_200_000_000, marketCap: 138_000_000_000, category: ["spot"] },
  { symbol: "USDC", name: "USD Coin", price: 0.9998, change24h: -0.01, volume24h: 9_120_000_000, marketCap: 42_000_000_000, category: ["spot"] },
  { symbol: "BNB", name: "BNB", price: 712.44, change24h: -1.18, volume24h: 2_140_000_000, marketCap: 103_000_000_000, category: ["spot", "futures"] },
  { symbol: "SOL", name: "Solana", price: 198.32, change24h: 5.64, volume24h: 5_410_000_000, marketCap: 94_000_000_000, category: ["spot", "futures"] },
  { symbol: "XRP", name: "XRP", price: 2.28, change24h: -2.74, volume24h: 4_880_000_000, marketCap: 130_000_000_000, category: ["spot", "futures"] },
  { symbol: "ADA", name: "Cardano", price: 0.912, change24h: 1.02, volume24h: 1_120_000_000, marketCap: 32_000_000_000, category: ["spot"] },
  { symbol: "AVAX", name: "Avalanche", price: 38.91, change24h: 4.18, volume24h: 780_000_000, marketCap: 15_800_000_000, category: ["spot", "futures"] },
  { symbol: "DOGE", name: "Dogecoin", price: 0.3216, change24h: -3.91, volume24h: 3_010_000_000, marketCap: 47_000_000_000, category: ["spot", "futures"] },
  { symbol: "LINK", name: "Chainlink", price: 22.14, change24h: 6.72, volume24h: 940_000_000, marketCap: 13_900_000_000, category: ["spot"] },
  { symbol: "TON", name: "Toncoin", price: 5.41, change24h: -0.62, volume24h: 320_000_000, marketCap: 13_400_000_000, category: ["spot", "new"] },
  { symbol: "ARB", name: "Arbitrum", price: 0.812, change24h: -5.44, volume24h: 260_000_000, marketCap: 3_400_000_000, category: ["spot", "new"] },
  { symbol: "SUI", name: "Sui", price: 4.02, change24h: 8.31, volume24h: 1_640_000_000, marketCap: 11_600_000_000, category: ["spot", "new", "futures"] },
  { symbol: "OP", name: "Optimism", price: 1.71, change24h: -4.02, volume24h: 210_000_000, marketCap: 2_900_000_000, category: ["spot", "new"] },
];

export const MARKETS: MarketAsset[] = SEED.map((m) => ({
  ...m,
  high24h: m.price * (1 + Math.abs(m.change24h) / 100 + 0.004),
  low24h: m.price * (1 - Math.abs(m.change24h) / 100 - 0.004),
}));

export const QUOTE = "USDT";
export const pairOf = (s: string) => `${s}/${QUOTE}`;

/* ---------------------------------------------------------------- feed --- */

type TickerListener = (m: Record<string, MarketAsset>) => void;
const listeners = new Set<TickerListener>();
const state: Record<string, MarketAsset> = Object.fromEntries(MARKETS.map((m) => [m.symbol, { ...m }]));
let timer: ReturnType<typeof setInterval> | null = null;

function tick() {
  for (const s of Object.keys(state)) {
    const a = state[s];
    if (a.symbol === "USDT" || a.symbol === "USDC") continue;
    const drift = (Math.random() - 0.5) * 0.0016;
    a.price = +(a.price * (1 + drift)).toFixed(a.price > 100 ? 2 : 4);
    a.change24h = +(a.change24h + drift * 60).toFixed(2);
    a.high24h = Math.max(a.high24h, a.price);
    a.low24h = Math.min(a.low24h, a.price);
  }
  listeners.forEach((l) => l({ ...state }));
}

/** Mirrors a WebSocket ticker subscription. Replace body with a real socket. */
export function subscribeTicker(cb: TickerListener) {
  listeners.add(cb);
  cb({ ...state });
  if (!timer) timer = setInterval(tick, 1500);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}

export function useTickers() {
  const [map, setMap] = useState<Record<string, MarketAsset>>(state);
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    const off = subscribeTicker((m) => {
      setMap(m);
      setConnected(true);
    });
    return off;
  }, []);
  const list = useMemo(() => Object.values(map), [map]);
  return { map, list, connected };
}

export function usePrevious<T>(value: T) {
  const ref = useRef<T>(value);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
}

/* ------------------------------------------------------------ holdings --- */

export interface Holding {
  symbol: string;
  total: number;
  inOrders: number;
}

export const HOLDINGS: Holding[] = [
  { symbol: "BTC", total: 0.8412, inOrders: 0.1 },
  { symbol: "ETH", total: 9.24, inOrders: 1.5 },
  { symbol: "USDT", total: 24_180.44, inOrders: 3_200 },
  { symbol: "USDC", total: 8_500, inOrders: 0 },
  { symbol: "BNB", total: 18.6, inOrders: 0 },
  { symbol: "SOL", total: 62.4, inOrders: 10 },
];

export function usePortfolio() {
  const { map } = useTickers();
  return useMemo(() => {
    const rows = HOLDINGS.map((h) => {
      const m = map[h.symbol];
      const price = m?.price ?? 0;
      const value = price * h.total;
      return {
        ...h,
        name: m?.name ?? h.symbol,
        price,
        change24h: m?.change24h ?? 0,
        available: h.total - h.inOrders,
        value,
        inOrdersValue: h.inOrders * price,
      };
    });
    const total = rows.reduce((s, r) => s + r.value, 0);
    const inOrders = rows.reduce((s, r) => s + r.inOrdersValue, 0);
    const change = rows.reduce((s, r) => s + (r.value * r.change24h) / 100, 0);
    return {
      rows: rows
        .map((r) => ({ ...r, allocation: total ? (r.value / total) * 100 : 0 }))
        .sort((a, b) => b.value - a.value),
      total,
      inOrders,
      available: total - inOrders,
      change,
      changePct: total ? (change / (total - change)) * 100 : 0,
    };
  }, [map]);
}

/* --------------------------------------------------------------- series -- */

export type Range = "1D" | "1W" | "1M" | "3M" | "1Y" | "ALL";
const RANGE_POINTS: Record<Range, number> = { "1D": 24, "1W": 28, "1M": 30, "3M": 45, "1Y": 52, ALL: 60 };

function rng(seed: number) {
  let s = seed;
  return () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296);
}

export function buildSeries(range: Range, base: number, seed = 7) {
  const n = RANGE_POINTS[range];
  const r = rng(seed + n);
  const vol = { "1D": 0.004, "1W": 0.012, "1M": 0.02, "3M": 0.03, "1Y": 0.05, ALL: 0.07 }[range];
  let v = base * (1 - vol * n * 0.12);
  const out: { t: string; v: number }[] = [];
  for (let i = 0; i < n; i++) {
    v = v * (1 + (r() - 0.44) * vol);
    out.push({ t: `${i}`, v: +v.toFixed(2) });
  }
  out[out.length - 1].v = base;
  return out;
}

export interface Candle { t: number; o: number; h: number; l: number; c: number; v: number }

export function buildCandles(base: number, count = 80, seed = 3): Candle[] {
  const r = rng(seed);
  let c = base * 0.97;
  const out: Candle[] = [];
  for (let i = 0; i < count; i++) {
    const o = c;
    c = o * (1 + (r() - 0.47) * 0.014);
    const h = Math.max(o, c) * (1 + r() * 0.005);
    const l = Math.min(o, c) * (1 - r() * 0.005);
    out.push({ t: i, o: +o.toFixed(2), h: +h.toFixed(2), l: +l.toFixed(2), c: +c.toFixed(2), v: +(r() * 900 + 100).toFixed(1) });
  }
  const k = base / out[out.length - 1].c;
  return out.map((x) => ({ ...x, o: +(x.o * k).toFixed(2), h: +(x.h * k).toFixed(2), l: +(x.l * k).toFixed(2), c: +(x.c * k).toFixed(2) }));
}

export function buildDepth(mid: number) {
  const r = rng(Math.floor(mid));
  const step = mid * 0.0004;
  const asks = Array.from({ length: 14 }, (_, i) => {
    const price = +(mid + step * (i + 1)).toFixed(mid > 100 ? 2 : 4);
    const amount = +(r() * 1.6 + 0.05).toFixed(4);
    return { price, amount, total: +(price * amount).toFixed(2) };
  });
  const bids = Array.from({ length: 14 }, (_, i) => {
    const price = +(mid - step * (i + 1)).toFixed(mid > 100 ? 2 : 4);
    const amount = +(r() * 1.6 + 0.05).toFixed(4);
    return { price, amount, total: +(price * amount).toFixed(2) };
  });
  return { asks: asks.reverse(), bids };
}

export function buildRecentTrades(mid: number) {
  const r = rng(Math.floor(mid * 3));
  return Array.from({ length: 24 }, (_, i) => ({
    id: `t${i}`,
    price: +(mid * (1 + (r() - 0.5) * 0.001)).toFixed(mid > 100 ? 2 : 4),
    amount: +(r() * 0.9 + 0.01).toFixed(4),
    side: (r() > 0.5 ? "buy" : "sell") as Side,
    time: new Date(Date.now() - i * 27_000).toISOString(),
  }));
}

/* --------------------------------------------------------------- orders -- */

export interface OrderRow {
  id: string;
  date: string;
  pair: string;
  type: "limit" | "market" | "stop_limit" | "stop_market";
  side: Side;
  price: number;
  amount: number;
  filled: number;
  status: OrderStatus;
}

const pad = (n: number) => String(n).padStart(6, "0");

export const OPEN_ORDERS: OrderRow[] = [
  { id: `ORD-${pad(84213)}`, date: iso(-2), pair: "BTC/USDT", type: "limit", side: "buy", price: 93800, amount: 0.15, filled: 0.05, status: "partially_filled" },
  { id: `ORD-${pad(84198)}`, date: iso(-6), pair: "ETH/USDT", type: "limit", side: "sell", price: 3520, amount: 1.5, filled: 0, status: "open" },
  { id: `ORD-${pad(84102)}`, date: iso(-26), pair: "SOL/USDT", type: "stop_limit", side: "sell", price: 182.4, amount: 10, filled: 0, status: "open" },
];

export const ORDER_HISTORY: OrderRow[] = [
  { id: `ORD-${pad(83990)}`, date: iso(-48), pair: "BTC/USDT", type: "market", side: "buy", price: 91240.2, amount: 0.25, filled: 0.25, status: "filled" },
  { id: `ORD-${pad(83944)}`, date: iso(-72), pair: "SOL/USDT", type: "limit", side: "buy", price: 176.1, amount: 40, filled: 40, status: "filled" },
  { id: `ORD-${pad(83901)}`, date: iso(-96), pair: "ETH/USDT", type: "limit", side: "buy", price: 3050, amount: 4, filled: 0, status: "canceled" },
  { id: `ORD-${pad(83870)}`, date: iso(-120), pair: "BNB/USDT", type: "market", side: "sell", price: 688.5, amount: 6, filled: 6, status: "filled" },
];

export const TRADE_HISTORY = ORDER_HISTORY.filter((o) => o.status === "filled").map((o, i) => ({
  id: `TRD-${pad(51200 + i)}`,
  date: o.date,
  pair: o.pair,
  side: o.side,
  price: o.price,
  amount: o.filled,
  fee: +(o.price * o.filled * 0.001).toFixed(2),
  role: i % 2 === 0 ? "Taker" : "Maker",
}));

export interface TxRow {
  id: string;
  date: string;
  type: "deposit" | "withdrawal" | "trade" | "transfer" | "fee";
  asset: string;
  amount: number;
  status: TxStatus;
  txid: string;
  network: string;
  fee: number;
}

export const TRANSACTIONS: TxRow[] = [
  { id: "TX-000912", date: iso(-3), type: "deposit", asset: "USDT", amount: 12_000, status: "completed", txid: "0x8f2a…c41d", network: "Ethereum (ERC20)", fee: 0 },
  { id: "TX-000911", date: iso(-9), type: "withdrawal", asset: "BTC", amount: -0.12, status: "processing", txid: "bc1q…9f2x", network: "Bitcoin", fee: 0.0002 },
  { id: "TX-000910", date: iso(-14), type: "trade", asset: "SOL", amount: 40, status: "completed", txid: "internal", network: "Internal", fee: 7.04 },
  { id: "TX-000909", date: iso(-30), type: "transfer", asset: "USDC", amount: -2_500, status: "completed", txid: "internal", network: "Internal", fee: 0 },
  { id: "TX-000908", date: iso(-44), type: "withdrawal", asset: "ETH", amount: -1.4, status: "failed", txid: "0x11b7…2a90", network: "Ethereum (ERC20)", fee: 0.0011 },
  { id: "TX-000907", date: iso(-58), type: "fee", asset: "USDT", amount: -18.42, status: "completed", txid: "internal", network: "Internal", fee: 0 },
  { id: "TX-000906", date: iso(-77), type: "deposit", asset: "SOL", amount: 25, status: "pending", txid: "5Kd8…rTq1", network: "Solana", fee: 0 },
  { id: "TX-000905", date: iso(-90), type: "deposit", asset: "BNB", amount: 6, status: "completed", txid: "0xa02c…7731", network: "BNB Smart Chain (BEP20)", fee: 0 },
];

export const NETWORKS: Record<string, { name: string; minDeposit: number; fee: number; confirmations: number; memo?: boolean; address: string }[]> = {
  BTC: [{ name: "Bitcoin", minDeposit: 0.0002, fee: 0.0002, confirmations: 2, address: "bc1qx9k3rjw8m4c2ndl7z0v6qzt5hs4u2p8ye3fa7d" }],
  ETH: [
    { name: "Ethereum (ERC20)", minDeposit: 0.01, fee: 0.0012, confirmations: 12, address: "0x7Ac41b0F5e2d93C8a1B6e04D5F2c9A83e10B4d62" },
    { name: "Arbitrum One", minDeposit: 0.001, fee: 0.0001, confirmations: 20, address: "0x7Ac41b0F5e2d93C8a1B6e04D5F2c9A83e10B4d62" },
  ],
  USDT: [
    { name: "Ethereum (ERC20)", minDeposit: 10, fee: 4.2, confirmations: 12, address: "0x7Ac41b0F5e2d93C8a1B6e04D5F2c9A83e10B4d62" },
    { name: "Tron (TRC20)", minDeposit: 5, fee: 1, confirmations: 20, address: "TQ8j5mNq2Vr7LkPd3sYc6Wb1Xz9AeH4uRt" },
    { name: "BNB Smart Chain (BEP20)", minDeposit: 5, fee: 0.5, confirmations: 15, address: "0x7Ac41b0F5e2d93C8a1B6e04D5F2c9A83e10B4d62" },
  ],
  USDC: [{ name: "Ethereum (ERC20)", minDeposit: 10, fee: 4.2, confirmations: 12, address: "0x7Ac41b0F5e2d93C8a1B6e04D5F2c9A83e10B4d62" }],
  BNB: [{ name: "BNB Smart Chain (BEP20)", minDeposit: 0.01, fee: 0.001, confirmations: 15, address: "0x7Ac41b0F5e2d93C8a1B6e04D5F2c9A83e10B4d62" }],
  SOL: [{ name: "Solana", minDeposit: 0.05, fee: 0.008, confirmations: 32, address: "9pQr4TdKm2Xy7Lc5Vb8Nz3Hf6Wq1Ae0RsUj2Gt4Kd7P" }],
  XRP: [{ name: "XRP Ledger", minDeposit: 1, fee: 0.2, confirmations: 1, memo: true, address: "rP9jL4Kd2Vm7Qx3Nb6Yc1Zt8Hs5We0Ar" }],
};

export interface EarnProduct {
  id: string;
  asset: string;
  name: string;
  kind: "Flexible" | "Staking" | "Fixed-term";
  apyLow: number;
  apyHigh: number;
  term: string;
  min: number;
  subscribed: number;
  capacity: number;
  risk: "Low" | "Medium" | "High";
}

export const EARN_PRODUCTS: EarnProduct[] = [
  { id: "e1", asset: "USDT", name: "USDT Flexible", kind: "Flexible", apyLow: 3.2, apyHigh: 5.8, term: "Flexible", min: 10, subscribed: 18_400_000, capacity: 40_000_000, risk: "Low" },
  { id: "e2", asset: "USDC", name: "USDC Flexible", kind: "Flexible", apyLow: 2.9, apyHigh: 5.1, term: "Flexible", min: 10, subscribed: 9_200_000, capacity: 25_000_000, risk: "Low" },
  { id: "e3", asset: "ETH", name: "ETH Staking", kind: "Staking", apyLow: 2.8, apyHigh: 3.6, term: "Unbonding ~7d", min: 0.01, subscribed: 41_200, capacity: 90_000, risk: "Medium" },
  { id: "e4", asset: "SOL", name: "SOL Staking", kind: "Staking", apyLow: 5.9, apyHigh: 7.2, term: "Unbonding ~3d", min: 0.5, subscribed: 210_000, capacity: 500_000, risk: "Medium" },
  { id: "e5", asset: "BTC", name: "BTC 60-Day", kind: "Fixed-term", apyLow: 1.4, apyHigh: 2.2, term: "60 days", min: 0.001, subscribed: 320, capacity: 800, risk: "Medium" },
  { id: "e6", asset: "BNB", name: "BNB 30-Day", kind: "Fixed-term", apyLow: 3.1, apyHigh: 4.4, term: "30 days", min: 0.05, subscribed: 61_000, capacity: 120_000, risk: "High" },
];

export const REFERRALS = {
  code: "VNX-8K2QDL",
  link: "https://vyronexchange.lovable.app/r/VNX-8K2QDL",
  total: 42,
  active: 17,
  rewards: 1_284.55,
  history: [
    { id: "r1", user: "u***41@mail.com", date: iso(-20), status: "Active", commission: 184.2 },
    { id: "r2", user: "k***09@mail.com", date: iso(-60), status: "Active", commission: 96.4 },
    { id: "r3", user: "j***77@mail.com", date: iso(-140), status: "Inactive", commission: 12.1 },
    { id: "r4", user: "m***12@mail.com", date: iso(-260), status: "Active", commission: 311.85 },
  ],
};

export interface ApiKey {
  id: string;
  name: string;
  key: string;
  read: boolean;
  trade: boolean;
  withdraw: boolean;
  ips: string;
  created: string;
  lastUsed: string | null;
}

export const API_KEYS: ApiKey[] = [
  { id: "k1", name: "Market data bot", key: "vx_live_9f2a41c8d7b3", read: true, trade: false, withdraw: false, ips: "203.0.113.24", created: iso(-1200), lastUsed: iso(-4) },
  { id: "k2", name: "Execution engine", key: "vx_live_1b77e0a2c945", read: true, trade: true, withdraw: false, ips: "198.51.100.7, 198.51.100.8", created: iso(-2400), lastUsed: iso(-27) },
];

export interface NotificationItem {
  id: string;
  category: "deposit" | "withdrawal" | "order" | "trade" | "security" | "account" | "system";
  title: string;
  body: string;
  date: string;
  read: boolean;
}

export const NOTIFICATIONS: NotificationItem[] = [
  { id: "n1", category: "deposit", title: "Deposit credited", body: "12,000 USDT credited via Ethereum (ERC20).", date: iso(-3), read: false },
  { id: "n2", category: "order", title: "Order partially filled", body: "BTC/USDT limit buy 0.05 / 0.15 filled at 93,800.00.", date: iso(-5), read: false },
  { id: "n3", category: "security", title: "New device sign-in", body: "Chrome on macOS · Lagos, NG. Not you? Review sessions.", date: iso(-11), read: false },
  { id: "n4", category: "withdrawal", title: "Withdrawal processing", body: "0.12 BTC is being broadcast to the Bitcoin network.", date: iso(-9), read: true },
  { id: "n5", category: "system", title: "Scheduled maintenance", body: "Futures matching engine upgrade, Sunday 02:00–02:30 UTC.", date: iso(-30), read: true },
  { id: "n6", category: "account", title: "Identity verification approved", body: "Your Level 2 verification has been approved.", date: iso(-260), read: true },
];

export interface Ticket {
  id: string;
  subject: string;
  category: string;
  status: "Open" | "Awaiting reply" | "Resolved";
  updated: string;
}

export const TICKETS: Ticket[] = [
  { id: "SUP-10482", subject: "ERC20 deposit not credited", category: "Deposits", status: "Awaiting reply", updated: iso(-6) },
  { id: "SUP-10390", subject: "API key IP whitelist question", category: "API", status: "Open", updated: iso(-40) },
  { id: "SUP-10211", subject: "Enable withdrawal whitelist", category: "Security", status: "Resolved", updated: iso(-300) },
];

export const SECURITY_ACTIVITY = [
  { id: "s1", event: "Password changed", date: iso(-480), ip: "203.0.113.24", device: "Chrome · macOS" },
  { id: "s2", event: "2FA device added", date: iso(-1200), ip: "203.0.113.24", device: "Chrome · macOS" },
  { id: "s3", event: "Failed sign-in attempt", date: iso(-2), ip: "198.51.100.44", device: "Unknown · Linux" },
  { id: "s4", event: "API key created", date: iso(-1200), ip: "203.0.113.24", device: "Chrome · macOS" },
];

export const SESSIONS = [
  { id: "d1", device: "Chrome · macOS", location: "Lagos, NG", ip: "203.0.113.24", lastActive: iso(0), current: true },
  { id: "d2", device: "Safari · iPhone", location: "Lagos, NG", ip: "203.0.113.90", lastActive: iso(-8), current: false },
  { id: "d3", device: "Firefox · Windows", location: "London, UK", ip: "198.51.100.7", lastActive: iso(-72), current: false },
];

function iso(hoursAgo: number) {
  return new Date(Date.now() + hoursAgo * 3_600_000).toISOString();
}

/* ------------------------------------------------------------ formatting - */

export const fmtUsd = (n: number, max = 2) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: max });

export const fmtNum = (n: number, max = 6) =>
  n.toLocaleString("en-US", { maximumFractionDigits: max });

export const fmtCompact = (n: number) =>
  n.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 2 });

export const fmtPct = (n: number) => `${n >= 0 ? "+" : ""}${n.toFixed(2)}%`;

export const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
