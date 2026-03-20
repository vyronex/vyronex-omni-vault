import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";

const Swap = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
      <Navigation />

      {/* Page Header */}
      <section className="page-header">
        <div className="absolute inset-0 gradient-hero" />
        <div className="page-header-content">
          <div className="max-w-2xl mx-auto text-center animate-slide-up">
            <span className="section-badge">Instant</span>
            <h1 className="page-title">
              Swap <span className="text-gradient">Tokens</span>
            </h1>
            <p className="page-subtitle mx-auto">Trade tokens instantly across multiple chains</p>
          </div>
        </div>
      </section>

      <div className="section-container py-8">
        <div className="max-w-2xl mx-auto">

          <div className="card-modern animate-slide-up stagger-1">
            <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', system-ui" }}>Token Swap</h2>
            <div className="aspect-square w-full max-w-md mx-auto bg-muted/10 rounded-2xl flex items-center justify-center border border-border/20">
              <div className="text-center px-6">
                <p className="text-muted-foreground font-medium mb-2">Thirdweb Swap Widget</p>
                <p className="text-sm text-muted-foreground">
                  Requires Thirdweb client initialization with clientId
                </p>
              </div>
            </div>

            <div className="mt-6 p-5 rounded-xl bg-background/50 border border-border/30">
              <h3 className="font-semibold text-sm mb-3">Quick Swap Info</h3>
              <div className="space-y-2.5 text-sm text-muted-foreground">
                {[
                  "Swap VNX on BNB Chain (Chain ID: 56)",
                  "VNX Contract: 0xeb55a55c384095ced21587afbe7418b7c9ae40cb",
                  "Powered by PancakeSwap liquidity",
                  "Low fees and instant settlement",
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary/60 shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 animate-slide-up stagger-2">
            {[
              { label: "PancakeSwap", desc: "Trade on DEX", url: "https://pancakeswap.finance/swap?outputCurrency=0xeb55a55c384095ced21587afbe7418b7c9ae40cb" },
              { label: "ApeSpace", desc: "Analytics & Trade", url: "https://apespace.io/bsc/0xeb55a55c384095ced21587afbe7418b7c9ae40cb" },
            ].map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="card-modern text-center !p-5"
              >
                <h3 className="font-bold text-sm mb-1">{link.label}</h3>
                <p className="text-xs text-muted-foreground">{link.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
    </PageTransition>
  );
};

export default Swap;
