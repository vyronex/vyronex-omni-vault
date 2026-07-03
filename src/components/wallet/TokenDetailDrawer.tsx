import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const WATCHLIST_KEY = "vnx.watchlist.v1";

export function getWatchlist(): string[] {
  try {
    const raw = localStorage.getItem(WATCHLIST_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setWatchlist(ids: string[]) {
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("vnx:watchlist-changed"));
}

export interface TokenDetailCoin {
  id: string;
  symbol: string;
  name: string;
  image?: string;
  current_price?: number;
  price_change_percentage_24h?: number;
  market_cap?: number;
  total_volume?: number;
  high_24h?: number;
  low_24h?: number;
  market_cap_rank?: number;
}

interface Props {
  coin: TokenDetailCoin | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function TokenDetailDrawer({ coin, open, onOpenChange }: Props) {
  const navigate = useNavigate();
  const [watched, setWatched] = useState(false);

  useEffect(() => {
    if (!coin) return;
    setWatched(getWatchlist().includes(coin.id));
  }, [coin, open]);

  if (!coin) return null;

  const change = coin.price_change_percentage_24h ?? 0;
  const positive = change >= 0;
  const price = Number(coin.current_price ?? 0);

  const toggleWatch = () => {
    const list = getWatchlist();
    const next = list.includes(coin.id)
      ? list.filter((x) => x !== coin.id)
      : [...list, coin.id];
    setWatchlist(next);
    setWatched(next.includes(coin.id));
    toast.success(
      next.includes(coin.id)
        ? `${coin.symbol.toUpperCase()} added to watchlist`
        : `${coin.symbol.toUpperCase()} removed from watchlist`,
    );
  };

  const goSwap = () => {
    onOpenChange(false);
    navigate(`/swap?token=${encodeURIComponent(coin.symbol.toUpperCase())}`);
  };

  const fmtPrice = (v: number) =>
    v > 0
      ? `$${v < 1 ? v.toPrecision(4) : v.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      : "—";

  const fmtBig = (v?: number) => {
    if (!v || v <= 0) return "—";
    if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`;
    if (v >= 1e6) return `$${(v / 1e6).toFixed(2)}M`;
    if (v >= 1e3) return `$${(v / 1e3).toFixed(2)}K`;
    return `$${v.toFixed(2)}`;
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md bg-background border-border/60 overflow-y-auto">
        <SheetHeader className="text-left">
          <div className="flex items-center gap-3">
            {coin.image ? (
              <img src={coin.image} alt={coin.symbol} className="h-12 w-12 rounded-full" />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-xs font-bold text-primary">
                  {coin.symbol.slice(0, 3).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <SheetTitle className="text-lg font-bold uppercase" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                {coin.symbol}
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground truncate">
                {coin.name}
                {coin.market_cap_rank ? ` · Rank #${coin.market_cap_rank}` : ""}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {/* Live price */}
        <div className="mt-6 rounded-2xl border border-border/40 bg-card/40 p-5">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Live Price</p>
          <div className="flex items-baseline justify-between mt-1 gap-3">
            <p className="text-3xl font-mono font-bold">{fmtPrice(price)}</p>
            <span
              className={`text-sm font-mono font-bold px-2 py-1 rounded-md ${
                positive
                  ? "text-[hsl(var(--vnx-green))] bg-[hsl(var(--vnx-green))]/10"
                  : "text-destructive bg-destructive/10"
              }`}
            >
              {positive ? "+" : ""}{change.toFixed(2)}%
            </span>
          </div>
          <p className="text-[10px] text-muted-foreground mt-2">24h change · auto-refresh 60s</p>
        </div>

        {/* Stats */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <Stat label="24h High" value={fmtPrice(Number(coin.high_24h ?? 0))} />
          <Stat label="24h Low" value={fmtPrice(Number(coin.low_24h ?? 0))} />
          <Stat label="Market Cap" value={fmtBig(coin.market_cap)} />
          <Stat label="24h Volume" value={fmtBig(coin.total_volume)} />
        </div>

        {/* Quick actions */}
        <div className="mt-6 space-y-2">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">Quick Actions</p>
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={goSwap} className="h-11 font-bold">
              Swap
            </Button>
            <Button
              onClick={toggleWatch}
              variant={watched ? "secondary" : "outline"}
              className="h-11 font-bold"
            >
              {watched ? "In Watchlist" : "Add to Watchlist"}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/40 bg-card/30 p-3">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-mono">{label}</p>
      <p className="text-sm font-mono font-bold mt-1">{value}</p>
    </div>
  );
}
