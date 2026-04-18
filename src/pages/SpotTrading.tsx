import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import OrderBook from "@/components/OrderBook";
import OrderForm from "@/components/OrderForm";
import TradeHistory from "@/components/TradeHistory";
import PriceChart from "@/components/PriceChart";
import { useAuth } from "@/hooks/useAuth";
import { useTradeNotifications } from "@/hooks/useTradeNotifications";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import PageTransition from "@/components/PageTransition";

interface TradingPair {
  id: string;
  base_token: string;
  quote_token: string;
}

const SpotTrading = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  useTradeNotifications();
  const [tradingPairs, setTradingPairs] = useState<TradingPair[]>([]);
  const [selectedPair, setSelectedPair] = useState<string>("");

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
      if (data.length > 0) {
        setSelectedPair(data[0].id);
      }
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
            <p className="text-muted-foreground mb-8">Please sign in to access spot trading</p>
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

  return (
    <PageTransition>
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="section-container py-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4 animate-slide-up">
          <div>
            <span className="section-badge">Live</span>
            <h1 className="text-3xl font-bold mt-2" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
              Spot <span className="text-gradient">Trading</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-1">Real-time order matching with live order book</p>
          </div>
          <div className="flex items-center gap-3">
            <label className="text-xs text-muted-foreground uppercase tracking-wider">Trading Pair:</label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-border/40 bg-card text-foreground text-sm focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
            >
              {tradingPairs.map((pair) => (
                <option key={pair.id} value={pair.id}>
                  {pair.base_token}/{pair.quote_token}
                </option>
              ))}
            </select>
          </div>
        </div>

        {!currentPair ? (
          <div className="card-modern text-center py-12 animate-slide-up stagger-1">
            <p className="text-muted-foreground">No trading pairs available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 animate-slide-up stagger-1">
            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-card border border-border/40 shadow-card overflow-hidden">
                <OrderBook tradingPairId={selectedPair} />
              </div>
            </div>

            <div className="lg:col-span-1 space-y-5">
              <div className="rounded-2xl bg-card border border-border/40 shadow-card overflow-hidden">
                <PriceChart
                  coinId={currentPair.base_token.toLowerCase() === "btc" ? "bitcoin" :
                          currentPair.base_token.toLowerCase() === "eth" ? "ethereum" :
                          currentPair.base_token.toLowerCase() === "bnb" ? "binancecoin" :
                          currentPair.base_token.toLowerCase()}
                  coinName={`${currentPair.base_token}/${currentPair.quote_token}`}
                />
              </div>
              <div className="rounded-2xl bg-card border border-border/40 shadow-card overflow-hidden">
                <OrderForm
                  tradingPairId={selectedPair}
                  baseToken={currentPair.base_token}
                  quoteToken={currentPair.quote_token}
                />
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-card border border-border/40 shadow-card overflow-hidden">
                <TradeHistory tradingPairId={selectedPair} />
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
    </PageTransition>
  );
};

export default SpotTrading;
