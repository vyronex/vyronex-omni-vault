import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Area, AreaChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AssetMark, Badge, Btn, DataTable, Delta, PageHeader, Panel, Segmented, Stat, Column } from "@/components/exchange/primitives";
import { Range, buildSeries, fmtCompact, fmtNum, fmtPct, fmtUsd, pairOf, usePortfolio, useTickers } from "@/exchange/data";

type Row = ReturnType<typeof usePortfolio>["rows"][number];

const RANGES: Range[] = ["1D", "1W", "1M", "3M", "1Y", "ALL"];
const PIE_COLORS = ["#2563EB", "#22C55E", "#F59E0B", "#8B5CF6", "#06B6D4", "#EF4444", "#64748B"];

export default function Overview() {
  const portfolio = usePortfolio();
  const { connected } = useTickers();
  const [range, setRange] = useState<Range>("1W");

  const series = useMemo(() => buildSeries(range, portfolio.total || 1, 11), [range, portfolio.total]);
  const first = series[0]?.v ?? 0;
  const rangeChange = portfolio.total - first;
  const rangePct = first ? (rangeChange / first) * 100 : 0;

  const pie = portfolio.rows.slice(0, 6).map((r, i) => ({ name: r.symbol, value: +r.value.toFixed(2), color: PIE_COLORS[i % PIE_COLORS.length] }));

  const columns: Column<Row>[] = [
    {
      key: "asset",
      header: "Asset",
      render: (r) => (
        <div className="flex items-center gap-2.5">
          <AssetMark symbol={r.symbol} />
          <div>
            <p className="font-medium">{r.symbol}</p>
            <p className="text-[11px] text-muted-foreground">{r.name}</p>
          </div>
        </div>
      ),
      sortValue: (r) => r.symbol,
    },
    { key: "price", header: "Price", align: "right", render: (r) => <span className="tabular">{fmtUsd(r.price, 4)}</span>, sortValue: (r) => r.price },
    { key: "holdings", header: "Holdings", align: "right", hideOn: "sm", render: (r) => <span className="tabular">{fmtNum(r.total, 6)}</span>, sortValue: (r) => r.total },
    { key: "value", header: "USD Value", align: "right", render: (r) => <span className="tabular font-medium">{fmtUsd(r.value)}</span>, sortValue: (r) => r.value },
    { key: "chg", header: "24h", align: "right", render: (r) => <Delta value={r.change24h} />, sortValue: (r) => r.change24h },
    {
      key: "alloc",
      header: "Allocation",
      align: "right",
      hideOn: "md",
      sortValue: (r) => r.allocation,
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <div className="h-1.5 w-16 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-primary" style={{ width: `${Math.min(r.allocation, 100)}%` }} />
          </div>
          <span className="tabular w-11 text-right text-muted-foreground">{r.allocation.toFixed(1)}%</span>
        </div>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (r) => (
        <Link to={`/app/trade?pair=${r.symbol}`}>
          <Btn size="sm" variant="outline">
            Trade
          </Btn>
        </Link>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Account overview"
        description="Consolidated view of balances, exposure and performance across spot, funding and earn accounts."
        actions={
          <>
            <Badge tone={connected ? "success" : "warning"}>{connected ? "Live feed" : "Connecting"}</Badge>
            <Link to="/app/deposit">
              <Btn variant="primary" size="md">
                Deposit
              </Btn>
            </Link>
            <Link to="/app/withdraw">
              <Btn size="md">Withdraw</Btn>
            </Link>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <Stat label="Total balance" value={fmtUsd(portfolio.total)} sub={`Estimated across all accounts`} />
        <Stat label="Available" value={fmtUsd(portfolio.available)} sub="Free to trade or withdraw" />
        <Stat label="In orders" value={fmtUsd(portfolio.inOrders)} sub="Reserved by open orders" />
        <Stat
          label="Today's P&L"
          value={
            <span className={portfolio.change >= 0 ? "text-success" : "text-destructive"}>
              {portfolio.change >= 0 ? "+" : "-"}
              {fmtUsd(Math.abs(portfolio.change))}
            </span>
          }
          sub={`24h change ${fmtPct(portfolio.changePct)}`}
        />
      </div>

      <div className="grid gap-3 xl:grid-cols-3">
        <Panel
          className="xl:col-span-2"
          title="Portfolio performance"
          subtitle={`${range} change ${rangeChange >= 0 ? "+" : "-"}${fmtUsd(Math.abs(rangeChange))} (${fmtPct(rangePct)})`}
          actions={<Segmented size="sm" options={RANGES} value={range} onChange={(v) => setRange(v as Range)} />}
        >
          <div className="h-[260px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series} margin={{ top: 8, right: 4, bottom: 0, left: 4 }}>
                <defs>
                  <linearGradient id="pf" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="t" hide />
                <YAxis domain={["dataMin", "dataMax"]} hide />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  labelFormatter={() => ""}
                  formatter={(v: number) => [fmtUsd(v), "Portfolio"]}
                />
                <Area type="monotone" dataKey="v" stroke="hsl(var(--primary))" strokeWidth={2} fill="url(#pf)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Allocation" subtitle="Share of portfolio value by asset">
          <div className="flex items-center gap-4">
            <div className="h-[150px] w-[150px] shrink-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie} dataKey="value" innerRadius={45} outerRadius={72} paddingAngle={2} stroke="none">
                    {pie.map((p) => (
                      <Cell key={p.name} fill={p.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }} formatter={(v: number) => fmtUsd(v)} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <ul className="min-w-0 flex-1 space-y-1.5">
              {portfolio.rows.slice(0, 6).map((r, i) => (
                <li key={r.symbol} className="flex items-center justify-between text-[12px]">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                    {r.symbol}
                  </span>
                  <span className="tabular text-muted-foreground">{r.allocation.toFixed(1)}%</span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>

      <Panel
        title="Balances"
        subtitle="Live valuation of your holdings"
        actions={
          <Link to="/app/assets">
            <Btn size="sm" variant="outline">
              Manage assets
            </Btn>
          </Link>
        }
      >
        <DataTable columns={columns} rows={portfolio.rows} rowKey={(r) => r.symbol} />
      </Panel>

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel title="Market movers" subtitle="Largest 24h moves in your watch universe">
          <MarketMovers />
        </Panel>
        <Panel title="Fee tier" subtitle="Rolling 30-day volume based">
          <div className="space-y-2 text-[12px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tier</span>
              <span className="font-medium">VIP 1</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Maker / Taker</span>
              <span className="tabular font-medium">0.080% / 0.100%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">30d volume</span>
              <span className="tabular font-medium">{fmtUsd(1_240_500)}</span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-secondary">
              <div className="h-full rounded-full bg-primary" style={{ width: "62%" }} />
            </div>
            <p className="text-[11px] text-muted-foreground">{fmtUsd(759_500)} more volume to reach VIP 2.</p>
          </div>
        </Panel>
        <Panel title="Account status" subtitle="Compliance and limits">
          <div className="space-y-2 text-[12px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Verification</span>
              <Badge tone="success">Level 2</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Daily withdrawal limit</span>
              <span className="tabular font-medium">{fmtUsd(1_000_000)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Used today</span>
              <span className="tabular font-medium">{fmtUsd(11_540)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">2FA</span>
              <Badge tone="success">Enabled</Badge>
            </div>
          </div>
        </Panel>
      </div>
    </div>
  );
}

function MarketMovers() {
  const { list } = useTickers();
  const movers = [...list].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h)).slice(0, 6);
  return (
    <ul className="space-y-2">
      {movers.map((m) => (
        <li key={m.symbol}>
          <Link to={`/app/trade?pair=${m.symbol}`} className="flex items-center justify-between rounded-lg px-1 py-1 hover:bg-secondary/60">
            <span className="flex items-center gap-2 text-[12px]">
              <AssetMark symbol={m.symbol} size={22} />
              {pairOf(m.symbol)}
            </span>
            <span className="flex items-center gap-3 text-[12px]">
              <span className="tabular">{fmtUsd(m.price, 4)}</span>
              <Delta value={m.change24h} className="w-16 text-right" />
              <span className="tabular hidden w-16 text-right text-muted-foreground sm:inline">{fmtCompact(m.volume24h)}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
