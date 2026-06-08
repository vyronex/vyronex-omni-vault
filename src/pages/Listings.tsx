import { useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useApprovedListings, useMyListings, type TokenListing, type ListingStatus } from "@/hooks/useTokenListings";
import { useAuth } from "@/hooks/useAuth";
import { ListingApplyDialog } from "@/components/listings/ListingApplyDialog";

const CHAINS = ["All", "BNB Chain", "Ethereum", "Fantom", "Polygon", "Arbitrum", "Solana", "Tron", "Bitcoin"];

type StatusKey = ListingStatus;

const STATUS_META: Record<StatusKey, { label: string; dot: string; border: string; bg: string; text: string }> = {
  pending: {
    label: "Submitted",
    dot: "bg-amber-400",
    border: "border-amber-400/30",
    bg: "bg-amber-400/10",
    text: "text-amber-400",
  },
  approved: {
    label: "Approved",
    dot: "bg-emerald-400",
    border: "border-emerald-400/30",
    bg: "bg-emerald-400/10",
    text: "text-emerald-400",
  },
  rejected: {
    label: "Rejected",
    dot: "bg-red-400",
    border: "border-red-400/30",
    bg: "bg-red-400/10",
    text: "text-red-400",
  },
};

const formatDate = (d: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
};

const StatusBadge = ({ status }: { status: StatusKey }) => {
  const meta = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${meta.bg} ${meta.text} ${meta.border}`}>
      <span className={`inline-block h-1.5 w-1.5 rounded-full ${meta.dot}`} />
      {meta.label}
    </span>
  );
};

const ListingCard = ({ t, showStatus = false }: { t: TokenListing; showStatus?: boolean }) => (
  <div className="card-modern hover-scale-subtle no-center">
    <div className="flex items-start justify-between gap-3 mb-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
          {t.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={t.logo_url} alt={t.token_symbol} className="h-full w-full object-cover" />
          ) : (
            <span className="font-bold text-primary text-xs">{t.token_symbol.slice(0, 3)}</span>
          )}
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm truncate" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
            {t.project_name}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {t.token_name} · <span className="font-mono">{t.token_symbol}</span>
          </p>
        </div>
      </div>
      {showStatus && <StatusBadge status={t.status} />}
    </div>
    {t.description && (
      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{t.description}</p>
    )}
    <div className="grid grid-cols-2 gap-2 text-[11px]">
      <div>
        <p className="text-muted-foreground uppercase tracking-wider text-[9px]">Chain</p>
        <p className="font-medium">{t.chain}</p>
      </div>
      <div>
        <p className="text-muted-foreground uppercase tracking-wider text-[9px]">Decimals</p>
        <p className="font-mono">{t.decimals}</p>
      </div>
      <div className="col-span-2">
        <p className="text-muted-foreground uppercase tracking-wider text-[9px]">Contract</p>
        <p className="font-mono text-[10px] truncate">{t.contract_address}</p>
      </div>
    </div>
    {(t.website || t.twitter || t.telegram) && (
      <div className="mt-3 pt-3 border-t border-border/30 flex flex-wrap gap-1.5">
        {t.website && (
          <a href={t.website} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded-md border border-border/40 hover:bg-primary/10 hover:border-primary/40 transition-colors">Website</a>
        )}
        {t.twitter && (
          <a href={t.twitter} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded-md border border-border/40 hover:bg-primary/10 hover:border-primary/40 transition-colors">Twitter</a>
        )}
        {t.telegram && (
          <a href={t.telegram} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded-md border border-border/40 hover:bg-primary/10 hover:border-primary/40 transition-colors">Telegram</a>
        )}
        {t.whitepaper && (
          <a href={t.whitepaper} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded-md border border-border/40 hover:bg-primary/10 hover:border-primary/40 transition-colors">Whitepaper</a>
        )}
      </div>
    )}
  </div>
);

const ApplicationCard = ({ t }: { t: TokenListing }) => {
  const meta = STATUS_META[t.status];
  return (
    <div className="card-modern hover-scale-subtle no-center">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
            {t.logo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={t.logo_url} alt={t.token_symbol} className="h-full w-full object-cover" />
            ) : (
              <span className="font-bold text-primary text-xs">{t.token_symbol.slice(0, 3)}</span>
            )}
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm truncate" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
              {t.project_name}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {t.token_name} · <span className="font-mono">{t.token_symbol}</span>
            </p>
          </div>
        </div>
        <StatusBadge status={t.status} />
      </div>

      {/* Status timeline */}
      <div className={`rounded-xl border p-3 mb-3 ${meta.bg} ${meta.border}`}>
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-medium">Submitted</span>
          <span className="text-muted-foreground">{formatDate(t.created_at)}</span>
        </div>
        {t.reviewed_at && (
          <div className="flex items-center justify-between text-[11px] mt-1">
            <span className="font-medium">{t.status === "approved" ? "Approved" : "Reviewed"}</span>
            <span className="text-muted-foreground">{formatDate(t.reviewed_at)}</span>
          </div>
        )}
        {t.review_notes && (
          <p className={`text-[11px] mt-2 pt-2 border-t ${meta.border} ${meta.text}`}>
            {t.review_notes}
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div>
          <p className="text-muted-foreground uppercase tracking-wider text-[9px]">Chain</p>
          <p className="font-medium">{t.chain}</p>
        </div>
        <div>
          <p className="text-muted-foreground uppercase tracking-wider text-[9px]">Contract</p>
          <p className="font-mono text-[10px] truncate">{t.contract_address}</p>
        </div>
      </div>
    </div>
  );
};

const Listings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: approved, isLoading: approvedLoading } = useApprovedListings();
  const { data: mine, isLoading: mineLoading } = useMyListings();
  const [applyOpen, setApplyOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [chainFilter, setChainFilter] = useState<string>("All");
  const [view, setView] = useState<"directory" | "applications">("directory");
  const [statusFilter, setStatusFilter] = useState<StatusKey | "all">("all");

  const chains = useMemo(() => {
    const set = new Set<string>(["All"]);
    (approved ?? []).forEach((t) => set.add(t.chain));
    return Array.from(set);
  }, [approved]);

  const filteredApproved = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (approved ?? []).filter((t) => {
      if (chainFilter !== "All" && t.chain !== chainFilter) return false;
      if (!q) return true;
      return (
        t.project_name.toLowerCase().includes(q) ||
        t.token_symbol.toLowerCase().includes(q) ||
        t.token_name.toLowerCase().includes(q)
      );
    });
  }, [approved, query, chainFilter]);

  const filteredMine = useMemo(() => {
    return (mine ?? []).filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      return true;
    });
  }, [mine, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts: Record<StatusKey, number> = { pending: 0, approved: 0, rejected: 0 };
    (mine ?? []).forEach((t) => { counts[t.status] = (counts[t.status] || 0) + 1; });
    return counts;
  }, [mine]);

  const handleApply = () => {
    if (!user) {
      navigate("/auth");
      return;
    }
    setApplyOpen(true);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />

        <section className="page-header">
          <div className="absolute inset-0 gradient-hero" />
          <div className="page-header-content">
            <div className="max-w-7xl mx-auto animate-slide-up">
              <span className="section-badge">Token Listings</span>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mt-2">
                <div>
                  <h1 className="page-title">
                    Listed <span className="text-gradient">Tokens</span>
                  </h1>
                  <p className="page-subtitle">
                    Official directory of approved tokens · {approved?.length ?? 0} live
                  </p>
                </div>
                <Button onClick={handleApply} className="gradient-primary shadow-glow rounded-xl">
                  Apply to List Token
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="section-container py-8">
          <div className="max-w-7xl mx-auto">
            {/* View tabs */}
            <div className="flex gap-1 p-1 rounded-xl bg-muted w-fit mb-6">
              <button
                onClick={() => setView("directory")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  view === "directory"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Directory
              </button>
              <button
                onClick={() => setView("applications")}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  view === "applications"
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                My Applications
                {user && mine && mine.length > 0 && (
                  <span className="ml-1.5 inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-primary text-primary-foreground text-[9px]">
                    {mine.length}
                  </span>
                )}
              </button>
            </div>

            {view === "directory" && (
              <>
                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-2 mb-5 no-center">
                  <Input
                    placeholder="Search by project, symbol, or name…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="sm:max-w-sm"
                  />
                  <div className="flex gap-1.5 flex-wrap no-center-flex">
                    {chains.map((c) => (
                      <button
                        key={c}
                        onClick={() => setChainFilter(c)}
                        className={`px-3 h-9 rounded-lg text-xs font-bold border transition-colors ${
                          chainFilter === c
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border/40 hover:bg-primary/10 hover:border-primary/40"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Approved directory */}
                {approvedLoading ? (
                  <div className="flex justify-center py-16">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : filteredApproved.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredApproved.map((t) => <ListingCard key={t.id} t={t} />)}
                  </div>
                ) : (
                  <div className="data-card text-center py-16">
                    <p className="font-bold mb-1" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                      No listings match yet
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Be the first to list your project on VyronexVNX.
                    </p>
                    <Button onClick={handleApply} className="gradient-primary">
                      Apply to List
                    </Button>
                  </div>
                )}
              </>
            )}

            {view === "applications" && (
              <>
                {!user ? (
                  <div className="data-card text-center py-16">
                    <p className="font-bold mb-2" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                      Sign in to view your applications
                    </p>
                    <p className="text-xs text-muted-foreground mb-4">
                      Track the status of your token listing submissions.
                    </p>
                    <Button onClick={() => navigate("/auth")} className="gradient-primary">
                      Sign In
                    </Button>
                  </div>
                ) : (
                  <>
                    {/* Status filters */}
                    <div className="flex flex-wrap gap-2 mb-5 no-center-flex">
                      {(["all", "pending", "approved", "rejected"] as const).map((s) => {
                        const count = s === "all" ? (mine?.length ?? 0) : statusCounts[s];
                        const isActive = statusFilter === s;
                        return (
                          <button
                            key={s}
                            onClick={() => setStatusFilter(s)}
                            className={`inline-flex items-center gap-2 px-3 h-9 rounded-lg text-xs font-bold border transition-colors ${
                              isActive
                                ? s === "all"
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : `${STATUS_META[s].bg} ${STATUS_META[s].text} ${STATUS_META[s].border}`
                                : "border-border/40 hover:bg-primary/10 hover:border-primary/40 text-muted-foreground"
                            }`}
                          >
                            {s === "all" ? "All" : STATUS_META[s].label}
                            <span className={`inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full text-[9px] font-bold ${
                              isActive
                                ? s === "all"
                                  ? "bg-primary-foreground/20 text-primary-foreground"
                                  : "bg-current text-background"
                                : "bg-muted-foreground/15 text-muted-foreground"
                            }`}>
                              {count}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {mineLoading ? (
                      <div className="flex justify-center py-16">
                        <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : filteredMine.length > 0 ? (
                      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredMine.map((t) => <ApplicationCard key={t.id} t={t} />)}
                      </div>
                    ) : (
                      <div className="data-card text-center py-16">
                        <p className="font-bold mb-1" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                          No applications yet
                        </p>
                        <p className="text-xs text-muted-foreground mb-4">
                          Submit your first token listing application to see it here.
                        </p>
                        <Button onClick={handleApply} className="gradient-primary">
                          Apply to List Token
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <Footer />

        <ListingApplyDialog open={applyOpen} onOpenChange={setApplyOpen} />
      </div>
    </PageTransition>
  );
};

export default Listings;
