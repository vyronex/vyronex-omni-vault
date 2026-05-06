import { useMemo } from "react";
import { Area, AreaChart, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

interface OrderLevel {
  price: number;
  quantity: number;
}

interface DepthChartProps {
  bids: OrderLevel[];
  asks: OrderLevel[];
}

const DepthChart = ({ bids, asks }: DepthChartProps) => {
  const data = useMemo(() => {
    // Sort bids descending, asks ascending
    const sortedBids = [...bids].sort((a, b) => b.price - a.price);
    const sortedAsks = [...asks].sort((a, b) => a.price - b.price);

    // Accumulate
    let bidCum = 0;
    const bidData = sortedBids.map(b => {
      bidCum += b.quantity;
      return { price: b.price, bidDepth: bidCum, askDepth: null as number | null };
    }).reverse();

    let askCum = 0;
    const askData = sortedAsks.map(a => {
      askCum += a.quantity;
      return { price: a.price, bidDepth: null as number | null, askDepth: askCum };
    });

    return [...bidData, ...askData];
  }, [bids, asks]);

  if (data.length === 0) {
    return (
      <div className="h-[140px] flex items-center justify-center text-xs text-muted-foreground">
        No depth data
      </div>
    );
  }

  return (
    <div className="h-[140px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="bidGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(142, 71%, 45%)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="askGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(0, 84%, 60%)" stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="price"
            tickFormatter={(v) => v >= 1 ? v.toFixed(0) : v.toPrecision(3)}
            tick={{ fontSize: 9 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 11 }}
            formatter={(v: number) => v.toFixed(4)}
            labelFormatter={(l: number) => `Price: $${l >= 1 ? l.toFixed(2) : l.toPrecision(4)}`}
          />
          <Area
            type="stepAfter"
            dataKey="bidDepth"
            stroke="hsl(142, 71%, 45%)"
            fill="url(#bidGrad)"
            strokeWidth={1.5}
            dot={false}
            connectNulls={false}
          />
          <Area
            type="stepAfter"
            dataKey="askDepth"
            stroke="hsl(0, 84%, 60%)"
            fill="url(#askGrad)"
            strokeWidth={1.5}
            dot={false}
            connectNulls={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DepthChart;
