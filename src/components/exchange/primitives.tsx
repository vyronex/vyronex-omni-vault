import { cn } from "@/lib/utils";
import { ReactNode, useMemo, useState } from "react";

/* ------------------------------------------------------------------ card - */

export function Panel({
  title,
  subtitle,
  actions,
  children,
  className,
  bodyClassName,
}: {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
  className?: string;
  bodyClassName?: string;
}) {
  return (
    <section className={cn("rounded-xl border border-border bg-card", className)}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            {title && <h2 className="text-[13px] font-semibold text-foreground">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-[11px] text-muted-foreground">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </header>
      )}
      <div className={cn("p-4", bodyClassName)}>{children}</div>
    </section>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
        {description && <p className="mt-1 max-w-2xl text-[12px] text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, sub, tone = "default" }: { label: string; value: ReactNode; sub?: ReactNode; tone?: Tone }) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3.5">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className={cn("tabular mt-1.5 text-[19px] font-semibold", toneText(tone))}>{value}</p>
      {sub && <p className="tabular mt-1 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

/* ----------------------------------------------------------------- tone -- */

export type Tone = "default" | "success" | "danger" | "warning" | "muted" | "accent";

export function toneText(tone: Tone) {
  return {
    default: "text-foreground",
    success: "text-success",
    danger: "text-destructive",
    warning: "text-warning",
    muted: "text-muted-foreground",
    accent: "text-primary",
  }[tone];
}

export function Delta({ value, suffix = "%", className }: { value: number; suffix?: string; className?: string }) {
  const up = value >= 0;
  return (
    <span className={cn("tabular font-medium", up ? "text-success" : "text-destructive", className)}>
      {up ? "+" : ""}
      {value.toFixed(2)}
      {suffix}
    </span>
  );
}

export function Badge({ children, tone = "muted", className }: { children: ReactNode; tone?: Tone; className?: string }) {
  const map: Record<Tone, string> = {
    default: "border-border bg-secondary text-foreground",
    success: "border-success/30 bg-success/10 text-success",
    danger: "border-destructive/30 bg-destructive/10 text-destructive",
    warning: "border-warning/30 bg-warning/10 text-warning",
    muted: "border-border bg-secondary text-muted-foreground",
    accent: "border-primary/30 bg-primary/10 text-primary",
  };
  return (
    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide", map[tone], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const s = status.toLowerCase();
  const tone: Tone =
    ["completed", "filled", "active", "resolved", "approved", "verified", "enabled"].includes(s)
      ? "success"
      : ["pending", "processing", "open", "partially_filled", "awaiting reply", "in review"].includes(s)
        ? "warning"
        : ["failed", "canceled", "cancelled", "rejected", "disabled"].includes(s)
          ? "danger"
          : "muted";
  return <Badge tone={tone}>{status.replace(/_/g, " ")}</Badge>;
}

/* ---------------------------------------------------------------- inputs - */

export function Field({ label, hint, children, className }: { label: string; hint?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="mb-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{label}</span>
        {hint && <span className="tabular">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputClass =
  "h-9 w-full rounded-lg border border-border bg-secondary px-3 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/60 focus:ring-1 focus:ring-primary/30";

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputClass, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cn(inputClass, "cursor-pointer pr-8", props.className)} />;
}

export function Btn({
  variant = "secondary",
  size = "md",
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" | "success" | "danger" | "outline"; size?: "sm" | "md" | "lg" }) {
  const variants = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "border border-border bg-secondary text-foreground hover:bg-accent",
    outline: "border border-border text-foreground hover:bg-secondary",
    ghost: "text-muted-foreground hover:bg-secondary hover:text-foreground",
    success: "bg-success text-success-foreground hover:bg-success/90",
    danger: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
  };
  const sizes = { sm: "h-7 px-2.5 text-[11px]", md: "h-9 px-3.5 text-[12px]", lg: "h-11 px-5 text-[13px]" };
  return (
    <button
      {...props}
      className={cn(
        "inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60",
        variants[variant],
        sizes[size],
        className,
      )}
    />
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
  size = "md",
}: {
  options: readonly { value: T; label: string }[] | readonly T[];
  value: T;
  onChange: (v: T) => void;
  className?: string;
  size?: "sm" | "md";
}) {
  const opts = options.map((o) => (typeof o === "string" ? { value: o as T, label: o as string } : o));
  return (
    <div role="tablist" className={cn("inline-flex flex-wrap items-center gap-1 rounded-lg border border-border bg-secondary p-1", className)}>
      {opts.map((o) => (
        <button
          key={o.value}
          role="tab"
          aria-selected={value === o.value}
          onClick={() => onChange(o.value)}
          className={cn(
            "rounded-md font-medium transition-colors",
            size === "sm" ? "px-2 py-1 text-[11px]" : "px-3 py-1.5 text-[12px]",
            value === o.value ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------- states - */

export function EmptyState({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border px-6 py-12 text-center">
      <p className="text-[13px] font-medium text-foreground">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[12px] text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
      <p className="text-[13px] font-medium text-destructive">Something went wrong</p>
      <p className="mt-1 max-w-sm text-[12px] text-muted-foreground">{message}</p>
      {onRetry && (
        <Btn size="sm" className="mt-4" onClick={onRetry}>
          Retry
        </Btn>
      )}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-secondary", className)} />;
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex gap-3">
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-7 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- modal - */

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  width = "max-w-md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  width?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0" onClick={onClose} aria-hidden />
      <div className={cn("relative w-full rounded-t-2xl border border-border bg-card sm:rounded-xl", width)}>
        <header className="border-b border-border px-5 py-4">
          <h2 className="text-[14px] font-semibold">{title}</h2>
          {description && <p className="mt-1 text-[12px] text-muted-foreground">{description}</p>}
        </header>
        <div className="max-h-[65vh] overflow-y-auto px-5 py-4 text-[12px]">{children}</div>
        <footer className="flex justify-end gap-2 border-t border-border px-5 py-3.5">
          {footer ?? (
            <Btn onClick={onClose} size="sm">
              Close
            </Btn>
          )}
        </footer>
      </div>
    </div>
  );
}

/* ----------------------------------------------------------------- table - */

export interface Column<T> {
  key: string;
  header: string;
  align?: "left" | "right" | "center";
  width?: string;
  sortValue?: (row: T) => number | string;
  render: (row: T) => ReactNode;
  hideOn?: "sm" | "md" | "lg";
}

export function DataTable<T>({
  columns,
  rows,
  loading,
  empty,
  pageSize = 0,
  rowKey,
  onRowClick,
  dense,
}: {
  columns: Column<T>[];
  rows: T[];
  loading?: boolean;
  empty?: ReactNode;
  pageSize?: number;
  rowKey?: (row: T, i: number) => string;
  onRowClick?: (row: T) => void;
  dense?: boolean;
}) {
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(0);

  const sorted = useMemo(() => {
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col?.sortValue) return rows;
    return [...rows].sort((a, b) => {
      const av = col.sortValue!(a);
      const bv = col.sortValue!(b);
      if (typeof av === "number" && typeof bv === "number") return (av - bv) * sort.dir;
      return String(av).localeCompare(String(bv)) * sort.dir;
    });
  }, [rows, sort, columns]);

  const pages = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const current = Math.min(page, pages - 1);
  const view = pageSize ? sorted.slice(current * pageSize, current * pageSize + pageSize) : sorted;

  const hide = (h?: Column<T>["hideOn"]) => (h === "sm" ? "hidden sm:table-cell" : h === "md" ? "hidden md:table-cell" : h === "lg" ? "hidden lg:table-cell" : "");

  if (loading) return <TableSkeleton cols={Math.min(columns.length, 6)} />;
  if (!rows.length) return <>{empty ?? <EmptyState title="No records" description="There is nothing to display yet." />}</>;

  return (
    <div>
      <div className="-mx-4 overflow-x-auto px-4">
        <table className="w-full min-w-[560px] border-collapse">
          <thead>
            <tr className="border-b border-border">
              {columns.map((c) => (
                <th
                  key={c.key}
                  style={{ width: c.width }}
                  className={cn(
                    "whitespace-nowrap px-2 pb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground first:pl-0 last:pr-0",
                    c.align === "right" && "text-right",
                    c.align === "center" && "text-center",
                    !c.align && "text-left",
                    hide(c.hideOn),
                  )}
                >
                  {c.sortValue ? (
                    <button
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() => setSort((s) => (s?.key === c.key ? { key: c.key, dir: s.dir === 1 ? -1 : 1 } : { key: c.key, dir: -1 }))}
                    >
                      {c.header}
                      <span className="text-[8px]">{sort?.key === c.key ? (sort.dir === 1 ? "▲" : "▼") : "◆"}</span>
                    </button>
                  ) : (
                    c.header
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {view.map((row, i) => (
              <tr
                key={rowKey ? rowKey(row, i) : (row.id ?? i)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={cn("border-b border-border/60 last:border-0", onRowClick && "cursor-pointer hover:bg-secondary/60")}
              >
                {columns.map((c) => (
                  <td
                    key={c.key}
                    className={cn(
                      "whitespace-nowrap px-2 text-[12px] first:pl-0 last:pr-0",
                      dense ? "py-1.5" : "py-2.5",
                      c.align === "right" && "text-right",
                      c.align === "center" && "text-center",
                      hide(c.hideOn),
                    )}
                  >
                    {c.render(row)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {pageSize > 0 && sorted.length > pageSize && (
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 text-[11px] text-muted-foreground">
          <span className="tabular">
            {current * pageSize + 1}–{Math.min((current + 1) * pageSize, sorted.length)} of {sorted.length}
          </span>
          <div className="flex items-center gap-2">
            <Btn size="sm" variant="outline" disabled={current === 0} onClick={() => setPage(current - 1)}>
              Previous
            </Btn>
            <span className="tabular">
              {current + 1} / {pages}
            </span>
            <Btn size="sm" variant="outline" disabled={current >= pages - 1} onClick={() => setPage(current + 1)}>
              Next
            </Btn>
          </div>
        </div>
      )}
    </div>
  );
}

/* ----------------------------------------------------------------- misc -- */

export function AssetMark({ symbol, size = 28 }: { symbol: string; size?: number }) {
  const hue = useMemo(() => Array.from(symbol).reduce((a, c) => a + c.charCodeAt(0), 0) % 360, [symbol]);
  return (
    <span
      aria-hidden
      style={{ width: size, height: size, backgroundColor: `hsl(${hue} 45% 16%)`, color: `hsl(${hue} 70% 70%)` }}
      className="tabular inline-flex shrink-0 items-center justify-center rounded-full border border-border text-[10px] font-semibold"
    >
      {symbol.slice(0, 3)}
    </span>
  );
}

export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <Btn
      size="sm"
      variant="outline"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(value);
        } catch {
          /* clipboard unavailable */
        }
        setDone(true);
        setTimeout(() => setDone(false), 1600);
      }}
    >
      {done ? "Copied" : label}
    </Btn>
  );
}

export function Notice({ tone = "warning", title, children }: { tone?: Tone; title: string; children?: ReactNode }) {
  const map: Record<string, string> = {
    warning: "border-warning/30 bg-warning/5 text-warning",
    danger: "border-destructive/30 bg-destructive/5 text-destructive",
    accent: "border-primary/30 bg-primary/5 text-primary",
    muted: "border-border bg-secondary text-muted-foreground",
    success: "border-success/30 bg-success/5 text-success",
    default: "border-border bg-secondary text-foreground",
  };
  return (
    <div className={cn("rounded-lg border px-3.5 py-3", map[tone])}>
      <p className="text-[12px] font-semibold">{title}</p>
      {children && <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{children}</div>}
    </div>
  );
}

export function KeyValue({ items }: { items: { label: ReactNode; value: ReactNode }[] }) {
  return (
    <dl className="divide-y divide-border">
      {items.map((it, i) => (
        <div key={i} className="flex items-center justify-between gap-4 py-2 text-[12px]">
          <dt className="text-muted-foreground">{it.label}</dt>
          <dd className="tabular text-right font-medium">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label?: string }) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn("relative h-5 w-9 shrink-0 rounded-full border transition-colors", checked ? "border-primary bg-primary" : "border-border bg-secondary")}
    >
      <span className={cn("absolute top-0.5 h-3.5 w-3.5 rounded-full bg-white transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
    </button>
  );
}
