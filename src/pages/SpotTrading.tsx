import { useState, useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import OrderBook from "@/components/OrderBook";
import OrderForm from "@/components/OrderForm";
import TradeHistory from "@/components/TradeHistory";
import PriceChart from "@/components/PriceChart";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface TradingPair {
  id: string;
  base_token: string;
  quote_token: string;
}

const SpotTrading = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
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
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl font-bold mb-4">Spot Trading</h1>
          <p className="text-muted-foreground mb-8">
            Please sign in to access spot trading
          </p>
          <Button onClick={() => navigate("/auth")} className="shadow-glow">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const currentPair = tradingPairs.find((p) => p.id === selectedPair);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Spot Trading</h1>
            <p className="text-muted-foreground mt-1">
              Real-time order matching with live order book
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-muted-foreground">Trading Pair:</label>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="px-4 py-2 rounded-lg border border-border bg-card text-foreground"
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
          <div className="glass-card rounded-lg p-8 text-center">
            <p className="text-muted-foreground">No trading pairs available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Order Book - Left Column */}
            <div className="lg:col-span-1">
              <OrderBook tradingPairId={selectedPair} />
            </div>

            {/* Center Column - Chart Placeholder & Order Form */}
            <div className="lg:col-span-1 space-y-6">
              {/* Price Chart */}
              <PriceChart
                coinId={currentPair.base_token.toLowerCase() === "btc" ? "bitcoin" :
                        currentPair.base_token.toLowerCase() === "eth" ? "ethereum" :
                        currentPair.base_token.toLowerCase() === "bnb" ? "binancecoin" :
                        currentPair.base_token.toLowerCase()}
                coinName={`${currentPair.base_token}/${currentPair.quote_token}`}
              />

              {/* Order Form */}
              <OrderForm 
                tradingPairId={selectedPair}
                baseToken={currentPair.base_token}
                quoteToken={currentPair.quote_token}
              />
            </div>

            {/* Trade History - Right Column */}
            <div className="lg:col-span-1">
              <TradeHistory tradingPairId={selectedPair} />
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default SpotTrading;
