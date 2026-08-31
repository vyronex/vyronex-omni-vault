import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Badge, Btn, TextInput } from "@/components/exchange/primitives";
import { NOTIFICATIONS, fmtUsd, pairOf, useTickers } from "@/exchange/data";
import VnxMark from "@/components/exchange/VnxMark";
import { toast } from "sonner";

export const NAV_GROUPS: { label: string; items: { label: string; to: string }[] }[] = [
  {
    label: "Trading",
    items: [
      { label: "Overview", to: "/app" },
      { label: "Markets", to: "/app/markets" },
      { label: "Trade", to: "/app/trade" },
      { label: "Spot", to: "/app/spot" },
      { label: "Convert", to: "/app/convert" },
      { label: "Futures", to: "/app/futures" },
    ],
  },
  {
    label: "Funds",
    items: [
      { label: "Assets", to: "/app/assets" },
      { label: "Deposit", to: "/app/deposit" },
      { label: "Withdraw", to: "/app/withdraw" },
      { label: "Transactions", to: "/app/transactions" },
      { label: "Earn", to: "/app/earn" },
      { label: "Orders", to: "/app/orders" },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Referrals", to: "/app/referrals" },
      { label: "API Management", to: "/app/api" },
      { label: "Security", to: "/app/security" },
      { label: "Support", to: "/app/support" },
    ],
  },
];

const ALL_ITEMS = NAV_GROUPS.flatMap((g) => g.items);

const LANGS = ["English", "Français", "Deutsch", "Español", "中文", "日本語"];
const CURRENCIES = ["USD", "EUR", "GBP", "NGN", "JPY"];

function useOutside<T extends HTMLElement>(onClose: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [onClose]);
  return ref;
}

function Dropdown({ label, children, align = "right", width = "w-64" }: { label: ReactNode; children: (close: () => void) => ReactNode; align?: "left" | "right"; width?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useOutside<HTMLDivElement>(() => setOpen(false));
  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 text-[11px] font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        {label}
      </button>
      {open && (
        <div className={cn("absolute z-50 mt-2 rounded-xl border border-border bg-popover p-1.5 shadow-xl", width, align === "right" ? "right-0" : "left-0")}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

function MenuItem({ children, onClick, tone }: { children: ReactNode; onClick?: () => void; tone?: "danger" }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "block w-full rounded-lg px-2.5 py-2 text-left text-[12px] transition-colors hover:bg-secondary",
        tone === "danger" ? "text-destructive" : "text-foreground",
      )}
    >
      {children}
    </button>
  );
}

function GlobalSearch() {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const ref = useOutside<HTMLDivElement>(() => setOpen(false));
  const { list } = useTickers();

  const results = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return { markets: [], pages: [] };
    return {
      markets: list.filter((m) => m.symbol.toLowerCase().includes(term) || m.name.toLowerCase().includes(term)).slice(0, 5),
      pages: ALL_ITEMS.filter((i) => i.label.toLowerCase().includes(term)).slice(0, 4),
    };
  }, [list, q]);

  const empty = q.trim() && !results.markets.length && !results.pages.length;

  return (
    <div className="relative w-full max-w-md" ref={ref}>
      <TextInput
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search markets, pages, order IDs"
        aria-label="Global search"
        className="h-8"
      />
      {open && q.trim() && (
        <div className="absolute left-0 right-0 z-50 mt-2 rounded-xl border border-border bg-popover p-1.5 shadow-xl">
          {empty && <p className="px-2.5 py-3 text-[12px] text-muted-foreground">No results for “{q}”.</p>}
          {results.markets.map((m) => (
            <MenuItem
              key={m.symbol}
              onClick={() => {
                setOpen(false);
                setQ("");
                navigate(`/app/trade?pair=${m.symbol}`);
              }}
            >
              <span className="flex items-center justify-between">
                <span>{pairOf(m.symbol)}</span>
                <span className="tabular text-muted-foreground">{fmtUsd(m.price)}</span>
              </span>
            </MenuItem>
          ))}
          {results.pages.map((p) => (
            <MenuItem
              key={p.to}
              onClick={() => {
                setOpen(false);
                setQ("");
                navigate(p.to);
              }}
            >
              <span className="text-muted-foreground">Page · </span>
              {p.label}
            </MenuItem>
          ))}
        </div>
      )}
    </div>
  );
}

function TickerStrip() {
  const { list } = useTickers();
  return (
    <div className="hidden items-center gap-5 overflow-hidden border-t border-border px-4 py-1.5 xl:flex">
      {list.slice(0, 8).map((m) => (
        <Link key={m.symbol} to={`/app/trade?pair=${m.symbol}`} className="tabular flex shrink-0 items-center gap-2 text-[11px] hover:opacity-80">
          <span className="text-muted-foreground">{pairOf(m.symbol)}</span>
          <span className="font-medium">{m.price.toLocaleString("en-US", { maximumFractionDigits: 4 })}</span>
          <span className={m.change24h >= 0 ? "text-success" : "text-destructive"}>
            {m.change24h >= 0 ? "+" : ""}
            {m.change24h.toFixed(2)}%
          </span>
        </Link>
      ))}
    </div>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="space-y-5">
      {NAV_GROUPS.map((g) => (
        <div key={g.label}>
          <p className="px-3 pb-1.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">{g.label}</p>
          <ul className="space-y-0.5">
            {g.items.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.to === "/app"}
                  onClick={onNavigate}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center justify-between rounded-lg px-3 py-1.5 text-[12px] transition-colors",
                      isActive ? "bg-primary/10 font-medium text-primary" : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                    )
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}

export default function ExchangeShell() {
  const [mobileNav, setMobileNav] = useState(false);
  const [lang, setLang] = useState("English");
  const [currency, setCurrency] = useState("USD");
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const location = useLocation();
  const navigate = useNavigate();
  const unread = notifications.filter((n) => !n.read).length;

  useEffect(() => setMobileNav(false), [location.pathname]);

  return (
    <div className="ex-scope min-h-screen">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex h-14 items-center gap-3 px-3 sm:px-4">
          <button
            className="rounded-lg border border-border px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground lg:hidden"
            onClick={() => setMobileNav((v) => !v)}
            aria-expanded={mobileNav}
          >
            {mobileNav ? "Close" : "Menu"}
          </button>

          <Link to="/app" className="flex shrink-0 items-center gap-2">
            <VnxMark size={28} />
            <span className="hidden text-[14px] font-semibold tracking-tight sm:block">Vyronex</span>
            <Badge tone="accent" className="hidden sm:inline-flex">
              Pro
            </Badge>
          </Link>

          <div className="hidden flex-1 justify-center md:flex">
            <GlobalSearch />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Link to="/app/markets" className="hidden rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground lg:block">
              Markets
            </Link>

            <Dropdown
              label={
                <span className="relative">
                  Alerts
                  {unread > 0 && <span className="tabular absolute -right-3 -top-2 rounded-full bg-primary px-1 text-[9px] text-primary-foreground">{unread}</span>}
                </span>
              }
              width="w-80"
            >
              {(close) => (
                <div>
                  <div className="flex items-center justify-between px-2.5 py-2">
                    <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Notifications</span>
                    <button className="text-[11px] text-primary" onClick={() => setNotifications((n) => n.map((x) => ({ ...x, read: true })))}>
                      Mark all read
                    </button>
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.slice(0, 5).map((n) => (
                      <div key={n.id} className={cn("rounded-lg px-2.5 py-2", !n.read && "bg-secondary/60")}>
                        <p className="text-[12px] font-medium">{n.title}</p>
                        <p className="mt-0.5 text-[11px] text-muted-foreground">{n.body}</p>
                      </div>
                    ))}
                  </div>
                  <MenuItem
                    onClick={() => {
                      close();
                      navigate("/app/notifications");
                    }}
                  >
                    View all notifications
                  </MenuItem>
                </div>
              )}
            </Dropdown>

            <Link to="/app/support" className="hidden rounded-lg border border-border bg-secondary px-2.5 py-1.5 text-[11px] font-medium text-muted-foreground hover:text-foreground sm:block">
              Help
            </Link>

            <Dropdown label={lang.slice(0, 3).toUpperCase()} width="w-40">
              {(close) =>
                LANGS.map((l) => (
                  <MenuItem
                    key={l}
                    onClick={() => {
                      setLang(l);
                      close();
                      toast.success(`Language set to ${l}`);
                    }}
                  >
                    {l}
                  </MenuItem>
                ))
              }
            </Dropdown>

            <Dropdown label={currency} width="w-32">
              {(close) =>
                CURRENCIES.map((c) => (
                  <MenuItem
                    key={c}
                    onClick={() => {
                      setCurrency(c);
                      close();
                      toast.success(`Display currency set to ${c}`);
                    }}
                  >
                    {c}
                  </MenuItem>
                ))
              }
            </Dropdown>

            <Dropdown label="Account">
              {(close) => (
                <div>
                  <div className="border-b border-border px-2.5 py-2">
                    <p className="text-[12px] font-medium">trader@vyronex.io</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">UID 88214003 · Verified Level 2</p>
                  </div>
                  <MenuItem
                    onClick={() => {
                      close();
                      navigate("/app/profile");
                    }}
                  >
                    Profile &amp; settings
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      close();
                      navigate("/app/security");
                    }}
                  >
                    Security center
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      close();
                      navigate("/app/api");
                    }}
                  >
                    API management
                  </MenuItem>
                  <MenuItem
                    tone="danger"
                    onClick={() => {
                      close();
                      toast.success("Signed out");
                      navigate("/");
                    }}
                  >
                    Log out
                  </MenuItem>
                </div>
              )}
            </Dropdown>
          </div>
        </div>

        <div className="px-3 pb-2 md:hidden">
          <GlobalSearch />
        </div>

        <TickerStrip />

        {mobileNav && (
          <div className="max-h-[70vh] overflow-y-auto border-t border-border bg-background px-3 py-3 lg:hidden">
            <SidebarNav onNavigate={() => setMobileNav(false)} />
            <div className="mt-4 border-t border-border pt-3">
              <Link to="/app/profile" className="block rounded-lg px-3 py-1.5 text-[12px] text-muted-foreground">
                Profile &amp; settings
              </Link>
              <button className="block w-full rounded-lg px-3 py-1.5 text-left text-[12px] text-destructive" onClick={() => navigate("/")}>
                Log out
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="flex">
        <aside className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-56 shrink-0 flex-col justify-between overflow-y-auto border-r border-border px-2.5 py-4 lg:flex">
          <SidebarNav />
          <div className="mt-6 border-t border-border pt-3">
            <div className="rounded-lg border border-border bg-card px-3 py-2.5">
              <p className="text-[12px] font-medium">trader@vyronex.io</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">UID 88214003</p>
              <div className="mt-2 flex flex-wrap gap-1">
                <Badge tone="success">Verified L2</Badge>
                <Badge tone="accent">VIP 1</Badge>
              </div>
            </div>
            <div className="mt-2 space-y-0.5">
              <NavLink to="/app/profile" className="block rounded-lg px-3 py-1.5 text-[12px] text-muted-foreground hover:bg-secondary hover:text-foreground">
                Settings
              </NavLink>
              <button
                onClick={() => {
                  toast.success("Signed out");
                  navigate("/");
                }}
                className="block w-full rounded-lg px-3 py-1.5 text-left text-[12px] text-destructive hover:bg-secondary"
              >
                Log out
              </button>
            </div>
          </div>
        </aside>

        <main className="min-w-0 flex-1 px-3 py-5 sm:px-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export { Btn };
