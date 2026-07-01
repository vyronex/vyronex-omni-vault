import { useEffect, useState } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface PriceFreshnessProps {
  /** ms since epoch of the last successful fetch (React Query's dataUpdatedAt) */
  updatedAt?: number;
  /** Error from the underlying query, if any */
  error?: unknown;
  /** Whether a refetch is in flight */
  isFetching?: boolean;
  /** Considered stale after this many ms (default 90s) */
  staleAfterMs?: number;
  /** Manual retry handler */
  onRetry?: () => void;
  /** Compact one-line variant */
  compact?: boolean;
  /** Label prefix — e.g. "Prices" */
  label?: string;
}

function formatAge(ms: number): string {
  const s = Math.floor(ms / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

const PriceFreshness = ({
  updatedAt,
  error,
  isFetching,
  staleAfterMs = 90_000,
  onRetry,
  compact,
  label = "Prices",
}: PriceFreshnessProps) => {
  // Tick every 5s so the "Xs ago" label stays live.
  const [, force] = useState(0);
  useEffect(() => {
    const id = setInterval(() => force((n) => n + 1), 5000);
    return () => clearInterval(id);
  }, []);

  const hasError = !!error;
  const age = updatedAt ? Date.now() - updatedAt : Infinity;
  const isStale = updatedAt ? age > staleAfterMs : true;

  // Error state: hard fallback, don't imply prices are current.
  if (hasError && !updatedAt) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-destructive ${
          compact ? "" : "px-2 py-1 rounded border border-destructive/30 bg-destructive/5"
        }`}
        role="status"
      >
        <AlertTriangle className="h-3 w-3" />
        <span>{label} unavailable</span>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="ml-1 underline hover:text-destructive/80"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  const stateColor = hasError
    ? "text-destructive"
    : isStale
    ? "text-amber-500"
    : "text-muted-foreground";

  return (
    <div
      className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider ${stateColor}`}
      role="status"
      aria-live="polite"
    >
      {isFetching ? (
        <RefreshCw className="h-3 w-3 animate-spin" />
      ) : hasError ? (
        <AlertTriangle className="h-3 w-3" />
      ) : (
        <span
          className={`h-1.5 w-1.5 rounded-full ${
            isStale ? "bg-amber-500" : "bg-[hsl(var(--vnx-green))]"
          }`}
        />
      )}
      <span>
        {hasError
          ? `${label} last updated ${updatedAt ? formatAge(age) : "—"} · retrying`
          : updatedAt
          ? `${label} · ${formatAge(age)}`
          : `${label} · loading`}
      </span>
      {onRetry && (hasError || isStale) && (
        <button
          type="button"
          onClick={onRetry}
          className="ml-1 underline hover:text-foreground"
        >
          Refresh
        </button>
      )}
    </div>
  );
};

export default PriceFreshness;
