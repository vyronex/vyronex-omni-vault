/** Shared exchange data layer backed by the project's live market proxy. */
import { useEffect, useMemo, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchCoinGeckoData } from "@/hooks/useCoinGecko";

export type Side = "buy" | "sell";
export type OrderStatus = "open" | "partially_filled" | "filled" | "canceled";
export type TxStatus = "completed" | "pending" | "processing" | "failed";

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap: number;
  category: ("spot" | "futures" | "new")[];
  lastUpdatedAt: number;
}

export const QUOTE = "USDT";
export const pairOf = (s: string) => `${s}/${QUOTE}`;

/* ----------------------------------------------------------- live markets --- */

type CoinGeckoMarket = {
  id: string;
  symbol: string;
  name: string;
  current_price: number | null;
  price_change_percentage_24h: number | null;
  high_24h: number | null;
  low_24h: number | null;
  total_volume: number | null;
  market_cap: number | null;
  last_updated: string;
};

const FUTURES_SYMBOLS = new Set(["BTC", "ETH", "BNB", "SOL", "XRP", "AVAX", "DOGE"]);

function mapMarket(market: CoinGeckoMarket): MarketAsset | null {
  if (!market.id || !market.symbol || market.current_price == null) return null;
  const symbol = market.symbol.toUpperCase();
  return {
    id: market.id,
    symbol,
    name: market.name,
    price: market.current_price,
    change24h: market.price_change_percentage_24h ?? 0,
    high24h: market.high_24h ?? market.current_price,
    low24h: market.low_24h ?? market.current_price,
    volume24h: market.total_volume ?? 0,
    marketCap: market.market_cap ?? 0,
    category: FUTURES_SYMBOLS.has(symbol) ? ["spot", "futures"] : ["spot"],
    lastUpdatedAt: Date.parse(market.last_updated) || Date.now(),
  };
}

export function useTickers() {
  const query = useQuery<CoinGeckoMarket[]>({
    queryKey: ["exchange-live-markets"],
    queryFn: async () => {
      const data = await fetchCoinGeckoData(
        "coins/markets",
        "vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h",
      );
      if (!Array.isArray(data)) throw new Error("Live market feed returned an invalid response");
      return data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
  const list = useMemo(() => (query.data ?? []).map(mapMarket).filter((m): m is MarketAsset => m !== null), [query.data]);
  const map = useMemo(() => Object.fromEntries(list.map((market) => [market.symbol, market])), [list]);
  return { map, list, connected: list.length > 0 && !query.isError, loading: query.isLoading, error: query.error };
}

/* ------------------------------------------------------------- live chart --- */

export type Candle = { t: number; o: number; h: number; l: number; c: number; v: number };
type ChartPoint = [number, number];

const CHART_DAYS: Record<string, number> = { "1m": 1, "5m": 1, "15m": 2, "1H": 7, "4H": 30, "1D": 180, "1W": 365 };

export function useLiveCandles(coinId: string | undefined, interval: string) {
  return useQuery<Candle[]>({
    queryKey: ["exchange-live-candles", coinId, interval],
    enabled: !!coinId,
    queryFn: async () => {
      if (!coinId) throw new Error("A market is required for chart data");
      const response = await fetchCoinGeckoData(
        `coins/${coinId}/market_chart`,
        `vs_currency=usd&days=${CHART_DAYS[interval] ?? 7}`,
      ) as { prices?: ChartPoint[]; total_volumes?: ChartPoint[] };
      const prices = response.prices ?? [];
      if (prices.length < 2) throw new Error("Live chart feed returned no usable prices");
      const volumes = response.total_volumes ?? [];
      const volumeByTime = new Map(volumes.map(([time, value]) => [time, value]));
      const count = Math.min(90, prices.length - 1);
      const bucketSize = Math.max(1, Math.floor(prices.length / count));
      const candles: Candle[] = [];
      for (let start = Math.max(0, prices.length - count * bucketSize); start < prices.length; start += bucketSize) {
        const bucket = prices.slice(start, Math.min(start + bucketSize, prices.length));
        const values = bucket.map(([, value]) => value);
        const previous = prices[Math.max(0, start - 1)]?.[1] ?? values[0];
        const close = values.at(-1) ?? previous;
        candles.push({
          t: bucket[0]?.[0] ?? start,
          o: previous,
          h: Math.max(...values),
          l: Math.min(...values),
          c: close,
          v: bucket.reduce((sum, [time]) => sum + (volumeByTime.get(time) ?? 0), 0),
        });
      }
      return candles;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
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
