import { useMemo } from "react";
import { Candle } from "@/exchange/data";

/**
 * Lightweight SVG candlestick renderer with optional overlays.
 * Swap the `candles` prop for a live WS kline feed without UI changes.
 */
export default function CandleChart({
  candles,
  indicators = [],
  height = 340,
}: {
  candles: Candle[];
  indicators?: string[];
  height?: number;
}) {
  const w = 1000;
  const padTop = 12;
  const volH = 54;
  const rsiOn = indicators.includes("RSI");
  const macdOn = indicators.includes("MACD");
  const subH = rsiOn || macdOn ? 60 : 0;
  const priceH = height - volH - subH - padTop - 18;

  const { min, max } = useMemo(() => {
    const lows = candles.map((c) => c.l);
    const highs = candles.map((c) => c.h);
    const lo = Math.min(...lows);
    const hi = Math.max(...highs);
    const pad = (hi - lo) * 0.08;
    return { min: lo - pad, max: hi + pad };
  }, [candles]);

  const y = (v: number) => padTop + priceH - ((v - min) / (max - min || 1)) * priceH;
  const step = w / Math.max(candles.length, 1);
  const bw = Math.max(step * 0.6, 1.5);

  const sma = (period: number) =>
    candles.map((_, i) => {
      if (i < period - 1) return null;
      const slice = candles.slice(i - period + 1, i + 1);
      return slice.reduce((s, c) => s + c.c, 0) / period;
    });

  const ema = (period: number) => {
    const k = 2 / (period + 1);
    let prev = candles[0]?.c ?? 0;
    return candles.map((c, i) => (i === 0 ? (prev = c.c) : (prev = c.c * k + prev * (1 - k))));
  };

  const line = (vals: (number | null)[]) =>
    vals
      .map((v, i) => (v == null ? null : `${i === 0 || vals[i - 1] == null ? "M" : "L"}${(i + 0.5) * step},${y(v)}`))
      .filter(Boolean)
      .join(" ");

  const maxVol = Math.max(...candles.map((c) => c.v), 1);

  const rsi = useMemo(() => {
    const out: number[] = [];
    let gain = 0;
    let loss = 0;
    candles.forEach((c, i) => {
      if (i === 0) return out.push(50);
      const d = c.c - candles[i - 1].c;
      gain = (gain * 13 + Math.max(d, 0)) / 14;
      loss = (loss * 13 + Math.max(-d, 0)) / 14;
      out.push(loss === 0 ? 100 : 100 - 100 / (1 + gain / loss));
    });
    return out;
  }, [candles]);

  const bb = useMemo(() => {
    const period = 20;
    return candles.map((_, i) => {
      if (i < period - 1) return null;
      const slice = candles.slice(i - period + 1, i + 1).map((c) => c.c);
      const mean = slice.reduce((s, v) => s + v, 0) / period;
      const sd = Math.sqrt(slice.reduce((s, v) => s + (v - mean) ** 2, 0) / period);
      return { up: mean + 2 * sd, low: mean - 2 * sd };
    });
  }, [candles]);

  return (
    <svg viewBox={`0 0 ${w} ${height}`} className="w-full" style={{ height }} role="img" aria-label="Candlestick price chart">
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <line key={f} x1={0} x2={w} y1={padTop + priceH * f} y2={padTop + priceH * f} stroke="hsl(var(--border))" strokeWidth={1} />
      ))}

      {candles.map((c, i) => {
        const up = c.c >= c.o;
        const color = up ? "hsl(var(--success))" : "hsl(var(--destructive))";
        const x = (i + 0.5) * step;
        const top = y(Math.max(c.o, c.c));
        const bot = y(Math.min(c.o, c.c));
        return (
          <g key={i}>
            <line x1={x} x2={x} y1={y(c.h)} y2={y(c.l)} stroke={color} strokeWidth={1} />
            <rect x={x - bw / 2} y={top} width={bw} height={Math.max(bot - top, 1)} fill={color} />
            <rect x={x - bw / 2} y={padTop + priceH + 8 + (volH - 8) * (1 - c.v / maxVol)} width={bw} height={((volH - 8) * c.v) / maxVol} fill={color} opacity={0.35} />
          </g>
        );
      })}

      {indicators.includes("MA") && <path d={line(sma(7))} fill="none" stroke="hsl(var(--warning))" strokeWidth={1.5} />}
      {indicators.includes("EMA") && <path d={line(ema(25))} fill="none" stroke="hsl(var(--primary))" strokeWidth={1.5} />}
      {indicators.includes("Bollinger") && (
        <>
          <path d={line(bb.map((b) => b?.up ?? null))} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4 4" />
          <path d={line(bb.map((b) => b?.low ?? null))} fill="none" stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4 4" />
        </>
      )}

      {(rsiOn || macdOn) && (
        <g transform={`translate(0, ${padTop + priceH + volH + 8})`}>
          <line x1={0} x2={w} y1={0} y2={0} stroke="hsl(var(--border))" />
          {rsiOn && (
            <path
              d={rsi.map((v, i) => `${i === 0 ? "M" : "L"}${(i + 0.5) * step},${subH - (v / 100) * subH}`).join(" ")}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={1.5}
            />
          )}
          {macdOn &&
            candles.map((c, i) => {
              const fast = ema(12)[i];
              const slow = ema(26)[i];
              const h = (fast - slow) * 4;
              return <rect key={i} x={(i + 0.5) * step - bw / 2} y={subH / 2 - Math.max(h, 0)} width={bw} height={Math.abs(h) || 1} fill={h >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} />;
            })}
        </g>
      )}
    </svg>
  );
}
