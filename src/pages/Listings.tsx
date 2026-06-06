import { useMemo, useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useApprovedListings, useMyListings, type TokenListing } from "@/hooks/useTokenListings";
import { useAuth } from "@/hooks/useAuth";
import { ListingApplyDialog } from "@/components/listings/ListingApplyDialog";

const statusTone: Record<string, string> = {
  approved: "bg-[hsl(var(--vnx-green))]/15 text-[hsl(var(--vnx-green))] border-[hsl(var(--vnx-green))]/30",
  pending: "bg-[hsl(var(--vnx-gold))]/15 text-[hsl(var(--vnx-gold))] border-[hsl(var(--vnx-gold))]/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
};

const ListingCard = ({ t }: { t: TokenListing }) => (
  <div className="card-modern hover-scale-subtle">
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
      <span className={`text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border ${statusTone[t.status]}`}>
        {t.status}
      </span>
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
          <a href={t.website} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded-md border border-border/40 hover:bg-primary/10 hover:border-primary/40">Website</a>
        )}
        {t.twitter && (
          <a href={t.twitter} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded-md border border-border/40 hover:bg-primary/10 hover:border-primary/40">Twitter</a>
        )}
        {t.telegram && (
          <a href={t.telegram} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded-md border border-border/40 hover:bg-primary/10 hover:border-primary/40">Telegram</a>
        )}
        {t.whitepaper && (
          <a href={t.whitepaper} target="_blank" rel="noreferrer" className="text-[10px] px-2 py-1 rounded-md border border-border/40 hover:bg-primary/10 hover:border-primary/40">Whitepaper</a>
        )}
      </div>
    )}
  </div>
);

const Listings = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: approved, isLoading } = useApprovedListings();
  const { data: mine } = useMyListings();
  const [applyOpen, setApplyOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [chainFilter, setChainFilter] = useState<string>("All");

  const chains = useMemo(() => {
    const set = new Set<string>(["All"]);
    (approved ?? []).forEach((t) => set.add(t.chain));
    return Array.from(set);
  }, [approved]);

  const filtered = useMemo(() => {
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
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-2 mb-5">
              <Input
                placeholder="Search by project, symbol, or name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="sm:max-w-sm"
              />
              <div className="flex gap-1.5 flex-wrap">
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
            {isLoading ? (
              <div className="flex justify-center py-16">
                <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((t) => <ListingCard key={t.id} t={t} />)}
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

            {/* My submissions */}
            {user && mine && mine.length > 0 && (
              <section className="mt-10">
                <h2 className="text-base font-bold uppercase tracking-wider mb-3" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
                  Your Submissions
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mine.map((t) => <ListingCard key={t.id} t={t} />)}
                </div>
              </section>
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
