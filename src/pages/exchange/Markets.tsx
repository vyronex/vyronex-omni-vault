import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  AssetMark,
  Badge,
  Btn,
  Column,
  DataTable,
  PageHeader,
  Panel,
  Segmented,
  Stat,
  TextInput,
} from "@/components/exchange/primitives";
import { MarketAsset, fmtCompact, fmtNum, fmtUsd, pairOf, useTickers } from "@/exchange/data";
import { cn } from "@/lib/utils";

const TABS = [
  { value: "all", label: "All" },
  { value: "spot", label: "Spot" },
  { value: "futures", label: "Futures" },
  { value: "new", label: "New listings" },
  { value: "gainers", label: "Gainers" },
  { value: "losers", label: "Losers" },
  { value: "watchlist", label: "Watchlist" },
] as const;
type Tab = (typeof TABS)[number]["value"];

const WATCH_KEY = "vnx.exchange.watchlist";

function Spark({ change }: { change: number }) {
  const up = change >= 0;
  const pts = useMemo(() => {
    let v = 50;
    return Array.from({ length: 20 }, (_, i) => {
      v += (Math.sin(i * 1.7 + change) + change / 6) * 3;
      return `${(i / 19) * 72},${Math.max(4, Math.min(28, 32 - v / 3))}`;
    }).join(" ");
  }, [change]);
  return (
    <svg width="72" height="32" viewBox="0 0 72 32" aria-hidden className="overflow-visible">
      <polyline points={pts} fill="none" strokeWidth="1.4" stroke={up ? "hsl(var(--success))" : "hsl(var(--destructive))"} />
    </svg>
  );
}

export default function ExchangeMarkets() {
  const { list, connected } = useTickers();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("all");
  const [q, setQ] = useState("");
  const [watch, setWatch] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(WATCH_KEY) ?? "[]");
    } catch {
      return [];
    }
  });

  const toggleWatch = (symbol: string) =>
    setWatch((w) => {
      const next = w.includes(symbol) ? w.filter((s) => s !== symbol) : [...w, symbol];
      localStorage.setItem(WATCH_KEY, JSON.stringify(next));
      return next;
    });

  const rows = useMemo(() => {
    const term = q.trim().toLowerCase();
    let out = list.filter((m) => !term || m.symbol.toLowerCase().includes(term) || m.name.toLowerCase().includes(term));
    if (tab === "spot" || tab === "futures" || tab === "new") out = out.filter((m) => m.category.includes(tab));
    if (tab === "watchlist") out = out.filter((m) => watch.includes(m.symbol));
    if (tab === "gainers") out = out.filter((m) => m.change24h > 0).sort((a, b) => b.change24h - a.change24h);
    if (tab === "losers") out = out.filter((m) => m.change24h < 0).sort((a, b) => a.change24h - b.change24h);
    return out;
  }, [list, q, tab, watch]);

  const totals = useMemo(() => {
    const vol = list.reduce((s, m) => s + m.volume24h, 0);
    const cap = list.reduce((s, m) => s + m.marketCap, 0);
    const advancing = list.filter((m) => m.change24h >= 0).length;
    const top = [...list].sort((a, b) => b.change24h - a.change24h)[0];
    return { vol, cap, advancing, top };
  }, [list]);

  const columns: Column<MarketAsset>[] = [
    {
      key: "star",
      header: "",
      width: "34px",
      render: (m) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWatch(m.symbol);
          }}
          aria-label={watch.includes(m.symbol) ? `Remove ${m.symbol} from watchlist` : `Add ${m.symbol} to watchlist`}
          className={cn("text-[13px] leading-none", watch.includes(m.symbol) ? "text-warning" : "text-muted-foreground hover:text-foreground")}
        >
          {watch.includes(m.symbol) ? "★" : "☆"}
        </button>
      ),
    },
    {
      key: "pair",
      header: "Market",
      sortValue: (m) => m.symbol,
      render: (m) => (
        <div className="flex items-center gap-2.5">
          <AssetMark symbol={m.symbol} size={26} />
          <div>
            <p className="font-medium">{pairOf(m.symbol)}</p>
            <p className="text-[11px] text-muted-foreground">{m.name}</p>
          </div>
          {m.category.includes("new") && <Badge tone="accent">New</Badge>}
        </div>
      ),
    },
    { key: "price", header: "Price", align: "right", sortValue: (m) => m.price, render: (m) => <span className="tabular">{fmtUsd(m.price, m.price < 1 ? 4 : 2)}</span> },
    {
      key: "change",
      header: "24h %",
      align: "right",
      sortValue: (m) => m.change24h,
      render: (m) => (
        <span className={cn("tabular font-medium", m.change24h >= 0 ? "text-success" : "text-destructive")}>
          {m.change24h >= 0 ? "+" : ""}
          {m.change24h.toFixed(2)}%
        </span>
      ),
    },
    { key: "high", header: "24h high", align: "right", hideOn: "md", sortValue: (m) => m.high24h, render: (m) => <span className="tabular">{fmtNum(m.high24h, 2)}</span> },
    { key: "low", header: "24h low", align: "right", hideOn: "md", sortValue: (m) => m.low24h, render: (m) => <span className="tabular">{fmtNum(m.low24h, 2)}</span> },
    { key: "vol", header: "24h volume", align: "right", hideOn: "sm", sortValue: (m) => m.volume24h, render: (m) => <span className="tabular">${fmtCompact(m.volume24h)}</span> },
    { key: "cap", header: "Market cap", align: "right", hideOn: "lg", sortValue: (m) => m.marketCap, render: (m) => <span className="tabular">${fmtCompact(m.marketCap)}</span> },
    { key: "spark", header: "7d", align: "right", hideOn: "lg", render: (m) => <div className="flex justify-end"><Spark change={m.change24h} /></div> },
    {
      key: "action",
      header: "",
      align: "right",
      render: (m) => (
        <Btn
          size="sm"
          variant="primary"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/app/trade?pair=${m.symbol}`);
          }}
        >
          Trade
        </Btn>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Markets"
        description="Live spot and derivatives markets with 24-hour statistics, depth-backed pricing and one-click routing into the trading terminal."
        actions={<Badge tone={connected ? "success" : "warning"}>{connected ? "Live feed" : "Connecting"}</Badge>}
      />

      <div className="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="24h volume" value={`$${fmtCompact(totals.vol)}`} sub="All listed markets" />
        <Stat label="Total market cap" value={`$${fmtCompact(totals.cap)}`} sub="Tracked assets" />
        <Stat label="Advancing" value={`${totals.advancing}/${list.length}`} sub="Markets up on the day" tone="success" />
        <Stat
          label="Top mover"
          value={totals.top ? pairOf(totals.top.symbol) : "—"}
          sub={totals.top ? `${totals.top.change24h >= 0 ? "+" : ""}${totals.top.change24h.toFixed(2)}% · ${fmtUsd(totals.top.price)}` : ""}
          tone="accent"
        />
      </div>

      <Panel
        title="All markets"
        subtitle={`${rows.length} of ${list.length} markets`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <TextInput value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search asset" aria-label="Search markets" className="h-8 w-40" />
            <Segmented size="sm" options={TABS} value={tab} onChange={(v) => setTab(v as Tab)} />
          </div>
        }
      >
        <DataTable
          columns={columns}
          rows={rows}
          rowKey={(m) => m.symbol}
          pageSize={12}
          onRowClick={(m) => navigate(`/app/trade?pair=${m.symbol}`)}
        />
      </Panel>
    </div>
  );
}
