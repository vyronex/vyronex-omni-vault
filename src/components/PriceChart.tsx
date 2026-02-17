import { useState, useMemo } from "react";
import { useCoinChart } from "@/hooks/useCoinGecko";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";

const TIME_RANGES = [
  { label: "24h", days: 1 },
  { label: "7d", days: 7 },
  { label: "30d", days: 30 },
  { label: "90d", days: 90 },
  { label: "1y", days: 365 },
];

const chartConfig: ChartConfig = {
  price: { label: "Price", color: "hsl(var(--primary))" },
};

interface PriceChartProps {
  coinId: string;
  coinName?: string;
}

const PriceChart = ({ coinId, coinName }: PriceChartProps) => {
  const [days, setDays] = useState(7);
  const { data, isLoading } = useCoinChart(coinId, days);

  const chartData = useMemo(() => {
    if (!data?.prices) return [];
    return data.prices.map(([ts, price]: [number, number]) => ({
      time: ts,
      price,
    }));
  }, [data]);

  const priceChange = useMemo(() => {
    if (chartData.length < 2) return 0;
    const first = chartData[0].price;
    const last = chartData[chartData.length - 1].price;
    return ((last - first) / first) * 100;
  }, [chartData]);

  const isPositive = priceChange >= 0;
  const strokeColor = isPositive ? "hsl(142, 71%, 45%)" : "hsl(0, 84%, 60%)";
  const fillColor = isPositive
    ? "hsl(142, 71%, 45%)"
    : "hsl(0, 84%, 60%)";

  const formatDate = (ts: number) => {
    const d = new Date(ts);
    if (days <= 1) return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    if (days <= 30) return d.toLocaleDateString([], { month: "short", day: "numeric" });
    return d.toLocaleDateString([], { month: "short", year: "2-digit" });
  };

  const formatPrice = (v: number) => {
    if (v >= 1) return `$${v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
    return `$${v.toPrecision(4)}`;
  };

  return (
    <Card className="shadow-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div>
            <CardTitle className="text-lg">
              {coinName || coinId} Price Chart
            </CardTitle>
            {chartData.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xl font-bold font-mono">
                  {formatPrice(chartData[chartData.length - 1].price)}
                </span>
                <span
                  className={`text-sm font-semibold ${isPositive ? "text-green-500" : "text-red-500"}`}
                >
                  {isPositive ? "+" : ""}
                  {priceChange.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
          <div className="flex gap-1">
            {TIME_RANGES.map((r) => (
              <Button
                key={r.days}
                variant={days === r.days ? "default" : "outline"}
                size="sm"
                onClick={() => setDays(r.days)}
                className="text-xs px-2.5"
              >
                {r.label}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {isLoading ? (
          <Skeleton className="h-[260px] w-full rounded-lg" />
        ) : chartData.length === 0 ? (
          <div className="h-[260px] flex items-center justify-center text-muted-foreground">
            No chart data available
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[260px] w-full">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={`gradient-${coinId}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={fillColor} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={fillColor} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="time"
                tickFormatter={formatDate}
                tickLine={false}
                axisLine={false}
                minTickGap={40}
                tick={{ fontSize: 11 }}
              />
              <YAxis
                domain={["auto", "auto"]}
                tickFormatter={(v) => formatPrice(v)}
                tickLine={false}
                axisLine={false}
                width={70}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    labelFormatter={(_, payload) => {
                      if (!payload?.[0]) return "";
                      return formatDate(payload[0].payload.time);
                    }}
                    formatter={(value) => [formatPrice(value as number), "Price"]}
                  />
                }
              />
              <Area
                type="monotone"
                dataKey="price"
                stroke={strokeColor}
                strokeWidth={2}
                fill={`url(#gradient-${coinId})`}
                dot={false}
                animationDuration={500}
              />
            </AreaChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  );
};

export default PriceChart;
