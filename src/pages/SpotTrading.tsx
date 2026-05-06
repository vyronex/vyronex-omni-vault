import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import OrderBook from "@/components/OrderBook";
import AdvancedOrderForm from "@/components/trading/AdvancedOrderForm";
import TradeHistory from "@/components/TradeHistory";
import PriceChart from "@/components/PriceChart";
import OpenOrdersPanel from "@/components/OpenOrdersPanel";
import MarketTickerBar from "@/components/trading/MarketTickerBar";
import DepthChart from "@/components/trading/DepthChart";
import AccountSummary from "@/components/trading/AccountSummary";
import { useAuth } from "@/hooks/useAuth";
import { useTradeNotifications } from "@/hooks/useTradeNotifications";
import { useOrderBook } from "@/hooks/useOrderBook";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageTransition from "@/components/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface TradingPair {
  id: string;
  base_token: string;
  quote_token: string;
}

const COIN_MAP: Record<string, string> = {
  btc: "bitcoin", eth: "ethereum", bnb: "binancecoin", sol: "solana",
  doge: "dogecoin", xrp: "ripple", ada: "cardano", dot: "polkadot",
};

const SpotTrading = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  useTradeNotifications();
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>("");
  const [bottomTab, setBottomTab] = useState<"orders" | "history" | "trades">("orders");

  useEffect(() => {
    loadTradingPairs();
  }, []);

  const loadTradingPairs = async () => {
    const { data, error } = await supabase
      .from("trading_pairs")
      .select("*")
      .eq("is_active", true);

    if (!error && data) {
      setTradingPairs(data);
      if (data.length > 0) setSelectedPair(data[0].id);
    }
  };

  if (!user) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background">
          <Navigation />
          <div className="section-container py-24 text-center">
            <div className="max-w-md mx-auto animate-slide-up">
              <span className="section-badge">Spot</span>
              <h1 className="text-4xl font-bold mb-4 mt-4">Spot Trading</h1>
              <p className="text-muted-foreground mb-8">Sign in to access the institutional trading terminal</p>
              <Button onClick={() => navigate("/auth")} className="rounded-xl gradient-primary shadow-glow hover:shadow-glow-lg active-press transition-all h-12 px-8">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </PageTransition>
    );
  }

  const currentPair = tradingPairs.find((p) => p.id === selectedPair);
  const coinId = currentPair
    ? COIN_MAP[currentPair.base_token.toLowerCase()] || currentPair.base_token.toLowerCase()
    : "bitcoin";

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="px-2 md:px-4 lg:px-6 py-3">
          {/* Top bar: pair selector + ticker */}
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3 mb-3 animate-slide-up">
            <div className="flex items-center gap-3 shrink-0">
              <select
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="px-4 py-2 rounded-xl border border-border/40 bg-card text-foreground text-sm font-bold focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                style={{ fontFamily: "'Space Grotesk', system-ui" }}
              >
                {tradingPairs.map((pair) => (
                  <option key={pair.id} value={pair.id}>
                    {pair.base_token}/{pair.quote_token}
                  </option>
                ))}
              </select>
              <span className="text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-[hsl(var(--vnx-green))]/15 text-[hsl(var(--vnx-green))] border border-[hsl(var(--vnx-green))]/30">
                LIVE
              </span>
            </div>
            {currentPair && (
              <MarketTickerBar coinId={coinId} baseToken={currentPair.base_token} quoteToken={currentPair.quote_token} />
            )}
          </div>

          {!currentPair ? (
            <div className="card-modern text-center py-12 animate-slide-up">
              <p className="text-muted-foreground">No trading pairs available</p>
            </div>
          ) : (
            <>
              {/* Main 4-column terminal layout */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 animate-slide-up stagger-1">
                {/* Col 1: Order Book */}
                <div className="lg:col-span-3 space-y-3">
                  <div className="rounded-2xl bg-card border border-border/40 shadow-card overflow-hidden">
                    <OrderBook tradingPairId={selectedPair} />
                  </div>
                </div>

                {/* Col 2: Chart + Depth */}
                <div className="lg:col-span-5 space-y-3">
                  <div className="rounded-2xl bg-card border border-border/40 shadow-card overflow-hidden">
                    <PriceChart coinId={coinId} coinName={`${currentPair.base_token}/${currentPair.quote_token}`} />
                  </div>
                  <DepthChartWrapper tradingPairId={selectedPair} />
                </div>

                {/* Col 3: Order Form */}
                <div className="lg:col-span-2">
                  <AdvancedOrderForm
                    tradingPairId={selectedPair}
                    baseToken={currentPair.base_token}
                    quoteToken={currentPair.quote_token}
                  />
                </div>

                {/* Col 4: Trades + Account */}
                <div className="lg:col-span-2 space-y-3">
                  <AccountSummary />
                  <div className="rounded-2xl bg-card border border-border/40 shadow-card overflow-hidden">
                    <TradeHistory tradingPairId={selectedPair} />
                  </div>
                </div>
              </div>

              {/* Bottom panel: open orders / order history */}
              <div className="mt-3 rounded-2xl bg-card border border-border/40 shadow-card overflow-hidden animate-slide-up stagger-2">
                <div className="flex items-center gap-1 p-3 border-b border-border/40">
                  {(["orders", "history", "trades"] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setBottomTab(tab)}
                      className={`text-[10px] uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg transition-all ${
                        bottomTab === tab
                          ? "bg-primary/15 text-primary"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab === "orders" ? "Open Orders" : tab === "history" ? "Order History" : "Trade History"}
                    </button>
                  ))}
                </div>
                <div className="p-3">
                  {bottomTab === "orders" && <OpenOrdersPanel tradingPairId={selectedPair} />}
                  {bottomTab === "history" && <OpenOrdersPanel />}
                  {bottomTab === "trades" && <TradeHistory tradingPairId={selectedPair} />}
                </div>
              </div>
            </>
          )}
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

// Wrapper to pass order book data to depth chart
const DepthChartWrapper = ({ tradingPairId }: { tradingPairId: string }) => {
  const { orderBook } = useOrderBook(tradingPairId);
  return (
    <div className="rounded-2xl bg-card border border-border/40 shadow-card p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
          Market Depth
        </h3>
        <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
          {(orderBook?.bids?.length ?? 0) + (orderBook?.asks?.length ?? 0)} levels
        </span>
      </div>
      <DepthChart bids={orderBook?.bids ?? []} asks={orderBook?.asks ?? []} />
    </div>
  );
};

export default SpotTrading;
