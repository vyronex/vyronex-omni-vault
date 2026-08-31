import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import CandleChart from "@/components/exchange/CandleChart";
import {
  AssetMark,
  Badge,
  Btn,
  Column,
  DataTable,
  Field,
  Panel,
  Segmented,
  Select,
  StatusBadge,
  TextInput,
} from "@/components/exchange/primitives";
import {
  OPEN_ORDERS,
  OrderRow,
  Side,
  TRADE_HISTORY,
  buildDepth,
  buildRecentTrades,
  fmtCompact,
  fmtDate,
  fmtNum,
  fmtUsd,
  pairOf,
  useLiveCandles,
  useTickers,
} from "@/exchange/data";
import { cn } from "@/lib/utils";

const INTERVALS = ["1m", "5m", "15m", "1H", "4H", "1D", "1W"] as const;
const INDICATORS = ["MA", "EMA", "Bollinger", "RSI", "MACD"] as const;
const ORDER_TYPES = [
  { value: "limit", label: "Limit" },
  { value: "market", label: "Market" },
  { value: "stop_limit", label: "Stop-limit" },
] as const;
type OrderType = (typeof ORDER_TYPES)[number]["value"];

const FEE_MAKER = 0.001;
const FEE_TAKER = 0.0012;
const QUOTE_BALANCE = 24_180.44;

export default function ExchangeTrade() {
  const [params, setParams] = useSearchParams();
  const { map, connected } = useTickers();
  const symbol = (params.get("pair") ?? "BTC").toUpperCase();
  const market = map[symbol] ?? map.BTC;
  const price = market?.price ?? 0;

  const [interval, setInterval] = useState<(typeof INTERVALS)[number]>("15m");
  const [indicators, setIndicators] = useState<string[]>(["MA"]);
  const [side, setSide] = useState<Side>("buy");
  const [type, setType] = useState<OrderType>("limit");
  const [limitPrice, setLimitPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [amount, setAmount] = useState("");
  const [tif, setTif] = useState("GTC");
  const [orders, setOrders] = useState<OrderRow[]>(OPEN_ORDERS.filter((o) => o.pair === pairOf(symbol)));
  const [bookTab, setBookTab] = useState<"book" | "trades">("book");
  const [bottomTab, setBottomTab] = useState<"open" | "history" | "fills">("open");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLimitPrice(price ? price.toFixed(price < 1 ? 4 : 2) : "");
    setOrders(OPEN_ORDERS.filter((o) => o.pair === pairOf(symbol)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [symbol]);

  const { data: candles = [], isLoading: candlesLoading, isError: candlesError } = useLiveCandles(market?.id, interval);
  const depth = useMemo(() => buildDepth(price || 100), [price ? Math.round(price * 100) / 100 : 0]);
  const trades = useMemo(() => buildRecentTrades(price || 100), [price ? Math.round(price) : 0]);

  const pairList = useMemo(
    () => Object.values(map).filter((m) => m.symbol !== "USDT" && (!search || m.symbol.toLowerCase().includes(search.toLowerCase()) || m.name.toLowerCase().includes(search.toLowerCase()))),
    [map, search],
  );

  const effPrice = type === "market" ? price : Number(limitPrice) || price;
  const amt = Number(amount) || 0;
  const total = effPrice * amt;
  const fee = total * (type === "market" ? FEE_TAKER : FEE_MAKER);
  const maxAmount = side === "buy" ? (effPrice ? QUOTE_BALANCE / effPrice : 0) : 0.8412;

  const maxAsk = Math.max(...depth.asks.map((a) => a.amount), 0.0001);
  const maxBid = Math.max(...depth.bids.map((b) => b.amount), 0.0001);

  const submit = () => {
    if (!amt) return toast.error("Enter an amount");
    if (type !== "market" && !Number(limitPrice)) return toast.error("Enter a limit price");
    const row: OrderRow = {
      id: `ORD-${Math.floor(Math.random() * 899999 + 100000)}`,
      date: new Date().toISOString(),
      pair: pairOf(symbol),
      type,
      side,
      price: effPrice,
      amount: amt,
      filled: type === "market" ? amt : 0,
      status: type === "market" ? "filled" : "open",
    };
    setOrders((o) => [row, ...o]);
    setAmount("");
    toast.success(`${side === "buy" ? "Buy" : "Sell"} ${type.replace("_", "-")} order placed`, {
      description: `${fmtNum(amt)} ${symbol} @ ${type === "market" ? "market" : fmtUsd(effPrice)}`,
    });
  };

  const cancel = (id: string) => {
    setOrders((o) => o.map((x) => (x.id === id ? { ...x, status: "canceled" } : x)));
    toast.success(`Order ${id} canceled`);
  };

  const orderColumns: Column<OrderRow>[] = [
    { key: "date", header: "Date", hideOn: "md", render: (o) => <span className="tabular text-muted-foreground">{fmtDate(o.date)}</span> },
    { key: "pair", header: "Pair", render: (o) => o.pair },
    { key: "type", header: "Type", hideOn: "sm", render: (o) => <span className="capitalize">{o.type.replace("_", "-")}</span> },
    { key: "side", header: "Side", render: (o) => <span className={o.side === "buy" ? "text-success" : "text-destructive"}>{o.side.toUpperCase()}</span> },
    { key: "price", header: "Price", align: "right", render: (o) => <span className="tabular">{fmtUsd(o.price)}</span> },
    { key: "amount", header: "Amount", align: "right", render: (o) => <span className="tabular">{fmtNum(o.amount)}</span> },
    { key: "filled", header: "Filled", align: "right", hideOn: "sm", render: (o) => <span className="tabular">{((o.filled / o.amount) * 100).toFixed(0)}%</span> },
    { key: "status", header: "Status", align: "right", render: (o) => <StatusBadge status={o.status} /> },
    {
      key: "action",
      header: "",
      align: "right",
      render: (o) =>
        o.status === "open" || o.status === "partially_filled" ? (
          <Btn size="sm" variant="outline" onClick={() => cancel(o.id)}>
            Cancel
          </Btn>
        ) : null,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Market header */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2.5">
          <AssetMark symbol={symbol} />
          <div>
            <p className="text-[14px] font-semibold">{pairOf(symbol)}</p>
            <p className="text-[11px] text-muted-foreground">{market?.name}</p>
          </div>
          <Badge tone={connected ? "success" : "warning"}>{connected ? "Live" : "…"}</Badge>
        </div>
        <div>
          <p className={cn("tabular text-[18px] font-semibold", (market?.change24h ?? 0) >= 0 ? "text-success" : "text-destructive")}>{fmtUsd(price, price < 1 ? 4 : 2)}</p>
          <p className="text-[11px] text-muted-foreground">Last price</p>
        </div>
        {[
          { l: "24h change", v: `${(market?.change24h ?? 0) >= 0 ? "+" : ""}${(market?.change24h ?? 0).toFixed(2)}%`, tone: (market?.change24h ?? 0) >= 0 },
          { l: "24h high", v: fmtNum(market?.high24h ?? 0, 2) },
          { l: "24h low", v: fmtNum(market?.low24h ?? 0, 2) },
          { l: "24h volume", v: `$${fmtCompact(market?.volume24h ?? 0)}` },
        ].map((s) => (
          <div key={s.l} className="hidden sm:block">
            <p className={cn("tabular text-[13px] font-medium", s.tone === undefined ? "" : s.tone ? "text-success" : "text-destructive")}>{s.v}</p>
            <p className="text-[11px] text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
        {/* Pair selector */}
        <Panel title="Markets" bodyClassName="p-2" className="order-2 xl:order-1">
          <TextInput value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search" aria-label="Search pairs" className="mb-2 h-8" />
          <div className="max-h-[420px] overflow-y-auto">
            {pairList.map((m) => (
              <button
                key={m.symbol}
                onClick={() => setParams({ pair: m.symbol })}
                className={cn(
                  "flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-[12px] transition-colors hover:bg-secondary",
                  m.symbol === symbol && "bg-secondary",
                )}
              >
                <span className="font-medium">{pairOf(m.symbol)}</span>
                <span className="text-right">
                  <span className="tabular block">{fmtNum(m.price, 2)}</span>
                  <span className={cn("tabular block text-[10px]", m.change24h >= 0 ? "text-success" : "text-destructive")}>
                    {m.change24h >= 0 ? "+" : ""}
                    {m.change24h.toFixed(2)}%
                  </span>
                </span>
              </button>
            ))}
          </div>
        </Panel>

        {/* Chart */}
        <div className="order-1 space-y-3 xl:order-2">
          <Panel
            title={`${pairOf(symbol)} chart`}
            actions={
              <div className="flex flex-wrap items-center gap-2">
                <Segmented size="sm" options={INTERVALS} value={interval} onChange={(v) => setInterval(v as typeof interval)} />
              </div>
            }
            bodyClassName="p-2"
          >
            <div className="mb-2 flex flex-wrap gap-1.5 px-1">
              {INDICATORS.map((ind) => (
                <button
                  key={ind}
                  onClick={() => setIndicators((s) => (s.includes(ind) ? s.filter((x) => x !== ind) : [...s, ind]))}
                  className={cn(
                    "rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide transition-colors",
                    indicators.includes(ind) ? "border-primary/40 bg-primary/10 text-primary" : "border-border text-muted-foreground hover:text-foreground",
                  )}
                >
                  {ind}
                </button>
              ))}
            </div>
            {candlesLoading ? (
              <div className="flex h-[360px] items-center justify-center text-[12px] text-muted-foreground">Loading live candles…</div>
            ) : candlesError || candles.length === 0 ? (
              <div className="flex h-[360px] items-center justify-center text-[12px] text-muted-foreground">Live chart data is temporarily unavailable.</div>
            ) : (
              <CandleChart candles={candles} indicators={indicators} height={360} />
            )}
          </Panel>
        </div>

        {/* Order book / trades */}
        <Panel
          className="order-3"
          title={<Segmented size="sm" options={[{ value: "book", label: "Order book" }, { value: "trades", label: "Trades" }]} value={bookTab} onChange={(v) => setBookTab(v as typeof bookTab)} />}
          bodyClassName="p-2"
        >
          {bookTab === "book" ? (
            <div className="text-[11px]">
              <div className="tabular grid grid-cols-3 px-1 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                <span>Price</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Total</span>
              </div>
              {depth.asks.map((a, i) => (
                <div key={`a${i}`} className="tabular relative grid grid-cols-3 px-1 py-[3px]">
                  <span className="absolute inset-y-0 right-0 bg-destructive/10" style={{ width: `${(a.amount / maxAsk) * 100}%` }} aria-hidden />
                  <span className="relative text-destructive">{fmtNum(a.price, 2)}</span>
                  <span className="relative text-right">{a.amount.toFixed(4)}</span>
                  <span className="relative text-right text-muted-foreground">{fmtNum(a.total, 2)}</span>
                </div>
              ))}
              <div className="tabular my-1.5 flex items-center justify-between border-y border-border px-1 py-1.5">
                <span className={cn("text-[14px] font-semibold", (market?.change24h ?? 0) >= 0 ? "text-success" : "text-destructive")}>{fmtNum(price, 2)}</span>
                <span className="text-[10px] text-muted-foreground">Spread {((depth.asks.at(-1)!.price - depth.bids[0].price) / price * 100).toFixed(3)}%</span>
              </div>
              {depth.bids.map((b, i) => (
                <div key={`b${i}`} className="tabular relative grid grid-cols-3 px-1 py-[3px]">
                  <span className="absolute inset-y-0 right-0 bg-success/10" style={{ width: `${(b.amount / maxBid) * 100}%` }} aria-hidden />
                  <span className="relative text-success">{fmtNum(b.price, 2)}</span>
                  <span className="relative text-right">{b.amount.toFixed(4)}</span>
                  <span className="relative text-right text-muted-foreground">{fmtNum(b.total, 2)}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px]">
              <div className="grid grid-cols-3 px-1 pb-1 text-[10px] uppercase tracking-wide text-muted-foreground">
                <span>Price</span>
                <span className="text-right">Amount</span>
                <span className="text-right">Time</span>
              </div>
              <div className="max-h-[420px] overflow-y-auto">
                {trades.map((t) => (
                  <div key={t.id} className="tabular grid grid-cols-3 px-1 py-[3px]">
                    <span className={t.side === "buy" ? "text-success" : "text-destructive"}>{fmtNum(t.price, 2)}</span>
                    <span className="text-right">{t.amount.toFixed(4)}</span>
                    <span className="text-right text-muted-foreground">{new Date(t.time).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>
      </div>

      {/* Order entry + bottom tabs */}
      <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_300px]">
        <Panel
          title="Orders"
          actions={
            <Segmented
              size="sm"
              options={[
                { value: "open", label: "Open orders" },
                { value: "history", label: "Order history" },
                { value: "fills", label: "Trade history" },
              ]}
              value={bottomTab}
              onChange={(v) => setBottomTab(v as typeof bottomTab)}
            />
          }
        >
          {bottomTab === "fills" ? (
            <DataTable
              rows={TRADE_HISTORY}
              columns={[
                { key: "date", header: "Date", render: (t) => <span className="tabular text-muted-foreground">{fmtDate(t.date)}</span> },
                { key: "pair", header: "Pair", render: (t) => t.pair },
                { key: "side", header: "Side", render: (t) => <span className={t.side === "buy" ? "text-success" : "text-destructive"}>{t.side.toUpperCase()}</span> },
                { key: "price", header: "Price", align: "right", render: (t) => <span className="tabular">{fmtUsd(t.price)}</span> },
                { key: "amount", header: "Amount", align: "right", render: (t) => <span className="tabular">{fmtNum(t.amount)}</span> },
                { key: "fee", header: "Fee", align: "right", hideOn: "sm", render: (t) => <span className="tabular">{fmtUsd(t.fee)}</span> },
                { key: "role", header: "Role", align: "right", hideOn: "sm", render: (t) => <Badge>{t.role}</Badge> },
              ]}
              pageSize={8}
            />
          ) : (
            <DataTable
              rows={bottomTab === "open" ? orders.filter((o) => o.status === "open" || o.status === "partially_filled") : orders}
              columns={orderColumns}
              pageSize={8}
              empty={<p className="py-8 text-center text-[12px] text-muted-foreground">No {bottomTab === "open" ? "open orders" : "orders"} for {pairOf(symbol)}.</p>}
            />
          )}
        </Panel>

        <Panel title="Place order" className="xl:order-first" bodyClassName="p-3">
          <div className="mb-3 grid grid-cols-2 gap-1 rounded-lg border border-border bg-secondary p-1">
            {(["buy", "sell"] as Side[]).map((s) => (
              <button
                key={s}
                onClick={() => setSide(s)}
                className={cn(
                  "rounded-md py-1.5 text-[12px] font-semibold uppercase transition-colors",
                  side === s ? (s === "buy" ? "bg-success text-success-foreground" : "bg-destructive text-destructive-foreground") : "text-muted-foreground hover:text-foreground",
                )}
              >
                {s}
              </button>
            ))}
          </div>

          <Segmented size="sm" className="mb-3 w-full" options={ORDER_TYPES} value={type} onChange={(v) => setType(v as OrderType)} />

          <div className="space-y-3">
            {type === "stop_limit" && (
              <Field label="Stop price" hint="USDT">
                <TextInput inputMode="decimal" value={stopPrice} onChange={(e) => setStopPrice(e.target.value)} placeholder="0.00" />
              </Field>
            )}
            <Field label={type === "market" ? "Price" : "Limit price"} hint="USDT">
              <TextInput
                inputMode="decimal"
                value={type === "market" ? "Market" : limitPrice}
                disabled={type === "market"}
                onChange={(e) => setLimitPrice(e.target.value)}
                placeholder="0.00"
              />
            </Field>
            <Field label="Amount" hint={`Max ${fmtNum(maxAmount, 4)} ${symbol}`}>
              <TextInput inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.0000" />
            </Field>

            <div className="grid grid-cols-4 gap-1">
              {[25, 50, 75, 100].map((p) => (
                <Btn key={p} size="sm" variant="outline" onClick={() => setAmount(((maxAmount * p) / 100).toFixed(6))}>
                  {p}%
                </Btn>
              ))}
            </div>

            {type !== "market" && (
              <Field label="Time in force">
                <Select value={tif} onChange={(e) => setTif(e.target.value)}>
                  <option value="GTC">Good till canceled</option>
                  <option value="IOC">Immediate or cancel</option>
                  <option value="FOK">Fill or kill</option>
                </Select>
              </Field>
            )}

            <dl className="space-y-1.5 rounded-lg border border-border bg-secondary/60 px-3 py-2.5 text-[11px]">
              {[
                ["Order value", fmtUsd(total)],
                ["Est. fee", `${fmtUsd(fee)} (${((type === "market" ? FEE_TAKER : FEE_MAKER) * 100).toFixed(2)}%)`],
                ["Available", side === "buy" ? `${fmtUsd(QUOTE_BALANCE)} USDT` : `0.8412 ${symbol}`],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-muted-foreground">{k}</dt>
                  <dd className="tabular">{v}</dd>
                </div>
              ))}
            </dl>

            <Btn variant={side === "buy" ? "success" : "danger"} size="lg" className="w-full" onClick={submit}>
              {side === "buy" ? "Buy" : "Sell"} {symbol}
            </Btn>
          </div>
        </Panel>
      </div>
    </div>
  );
}
