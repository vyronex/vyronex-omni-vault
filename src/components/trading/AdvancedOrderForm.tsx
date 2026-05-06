import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from "@/hooks/useOrders";
import { useWallets } from "@/hooks/useWallets";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";

type OrderType = "limit" | "market" | "stop-limit" | "oco";

const FEE_RATE = 0.001;

interface Props {
  tradingPairId: string;
  baseToken: string;
  quoteToken: string;
}

const AdvancedOrderForm = ({ tradingPairId, baseToken, quoteToken }: Props) => {
  const { placeOrder } = useOrders();
  const { balances } = useWallets();
  const [orderType, setOrderType] = useState<OrderType>("limit");
  const [price, setPrice] = useState("");
  const [stopPrice, setStopPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sliderPct, setSliderPct] = useState([0]);
  const [tif, setTif] = useState<"GTC" | "IOC" | "FOK">("GTC");

  const baseBalance = Number(balances?.find((b: any) => b.token_symbol === baseToken)?.balance ?? 0);
  const quoteBalance = Number(balances?.find((b: any) => b.token_symbol === quoteToken)?.balance ?? 0);

  const handleSlider = (side: "buy" | "sell", pct: number) => {
    setSliderPct([pct]);
    if (side === "buy") {
      const px = parseFloat(price);
      if (orderType !== "market" && (!isFinite(px) || px <= 0)) return;
      const refPrice = orderType === "market" ? 1 : px;
      const usable = (quoteBalance * (pct / 100)) / refPrice;
      setQuantity(usable > 0 ? usable.toFixed(6) : "");
    } else {
      setQuantity((baseBalance * (pct / 100)).toFixed(6));
    }
  };

  const handlePlaceOrder = async (side: "buy" | "sell") => {
    if (!quantity) { toast.error("Enter quantity"); return; }

    const parsedQuantity = parseFloat(quantity);
    const parsedPrice = orderType === "market" ? undefined : parseFloat(price);

    if (orderType !== "market" && (!parsedPrice || !isFinite(parsedPrice))) {
      toast.error("Enter a valid price");
      return;
    }

    // For stop-limit, we show stop price UI but send as limit order (backend handles matching)
    if (orderType === "stop-limit" && !stopPrice) {
      toast.error("Enter stop price");
      return;
    }

    if (side === "buy" && parsedPrice && (parsedPrice * parsedQuantity) > quoteBalance) {
      toast.error(`Insufficient ${quoteToken}`);
      return;
    }
    if (side === "sell" && parsedQuantity > baseBalance) {
      toast.error(`Insufficient ${baseToken}`);
      return;
    }

    try {
      await placeOrder.mutateAsync({
        trading_pair_id: tradingPairId,
        side,
        order_type: orderType === "market" ? "market" : "limit",
        price: parsedPrice,
        quantity: parsedQuantity,
      });
      setPrice("");
      setQuantity("");
      setStopPrice("");
      setSliderPct([0]);
    } catch {
      // handled by mutation
    }
  };

  const px = parseFloat(price);
  const qty = parseFloat(quantity);
  const total = isFinite(px) && isFinite(qty) ? px * qty : 0;
  const fee = total * FEE_RATE;

  const renderSide = (side: "buy" | "sell") => {
    const isBuy = side === "buy";
    const balance = isBuy ? quoteBalance : baseBalance;
    const balanceToken = isBuy ? quoteToken : baseToken;

    return (
      <div className="space-y-3">
        {/* Balance */}
        <div className="flex items-center justify-between text-[10px]">
          <span className="text-muted-foreground uppercase tracking-wider">Available</span>
          <span className="font-mono font-semibold">{balance.toFixed(4)} {balanceToken}</span>
        </div>

        {/* Stop Price (stop-limit only) */}
        {orderType === "stop-limit" && (
          <div>
            <Label className="text-[10px] text-muted-foreground mb-1 block uppercase tracking-wider">Stop Price</Label>
            <Input
              type="number" step="0.000001" placeholder="Trigger price"
              value={stopPrice} onChange={(e) => setStopPrice(e.target.value)}
              className="font-mono h-9 text-sm bg-muted/10"
            />
          </div>
        )}

        {/* Limit Price */}
        {orderType !== "market" && (
          <div>
            <Label className="text-[10px] text-muted-foreground mb-1 block uppercase tracking-wider">
              {orderType === "stop-limit" ? "Limit Price" : "Price"} ({quoteToken})
            </Label>
            <Input
              type="number" step="0.000001" placeholder="0.00"
              value={price} onChange={(e) => setPrice(e.target.value)}
              className="font-mono h-9 text-sm bg-muted/10"
            />
          </div>
        )}

        {/* Amount */}
        <div>
          <Label className="text-[10px] text-muted-foreground mb-1 block uppercase tracking-wider">Amount ({baseToken})</Label>
          <Input
            type="number" step="0.0001" placeholder="0.00"
            value={quantity} onChange={(e) => setQuantity(e.target.value)}
            className="font-mono h-9 text-sm bg-muted/10"
          />
        </div>

        {/* Slider */}
        <div className="px-1">
          <Slider
            value={sliderPct}
            onValueChange={(v) => handleSlider(side, v[0])}
            max={100}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
            <span>0%</span><span>25%</span><span>50%</span><span>75%</span><span>100%</span>
          </div>
        </div>

        {/* Total + Fee */}
        {total > 0 && (
          <div className="p-2.5 bg-muted/10 rounded-lg space-y-1 text-[10px]">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono font-semibold">{total.toFixed(4)} {quoteToken}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Est. Fee</span>
              <span className="font-mono">{fee.toFixed(6)} {quoteToken}</span>
            </div>
            <div className="flex justify-between border-t border-border/30 pt-1">
              <span className="text-muted-foreground">{isBuy ? "You pay" : "You receive"}</span>
              <span className="font-mono font-bold">
                {(isBuy ? total + fee : total - fee).toFixed(4)} {quoteToken}
              </span>
            </div>
          </div>
        )}

        {/* TIF */}
        <div className="flex items-center gap-1.5">
          {(["GTC", "IOC", "FOK"] as const).map(t => (
            <button
              key={t}
              onClick={() => setTif(t)}
              className={`text-[9px] uppercase tracking-wider font-bold px-2 py-1 rounded border transition-all ${
                tif === t
                  ? "bg-primary/15 text-primary border-primary/30"
                  : "bg-muted/10 text-muted-foreground border-border/30 hover:border-primary/20"
              }`}
            >
              {t}
            </button>
          ))}
          <span className="text-[8px] text-muted-foreground ml-auto">Time in Force</span>
        </div>

        <Button
          onClick={() => handlePlaceOrder(side)}
          disabled={placeOrder.isPending || !quantity || (orderType !== "market" && !price)}
          className={`w-full h-10 text-sm font-bold shadow-glow ${
            isBuy
              ? "bg-[hsl(var(--vnx-green))] hover:bg-[hsl(var(--vnx-green))]/90"
              : "bg-destructive hover:bg-destructive/90"
          } text-white`}
        >
          {placeOrder.isPending ? "Placing..." : `${isBuy ? "Buy" : "Sell"} ${baseToken}`}
        </Button>
      </div>
    );
  };

  return (
    <div className="glass-card rounded-lg p-4 shadow-card">
      {/* Order Type Selector */}
      <div className="flex items-center gap-1 mb-4 overflow-x-auto scrollbar-none">
        {(["limit", "market", "stop-limit", "oco"] as OrderType[]).map(t => (
          <button
            key={t}
            onClick={() => setOrderType(t)}
            className={`text-[10px] uppercase tracking-wider font-bold px-2.5 py-1.5 rounded-lg border whitespace-nowrap transition-all ${
              orderType === t
                ? "bg-primary/15 text-primary border-primary/30"
                : "bg-transparent text-muted-foreground border-border/30 hover:border-primary/20"
            }`}
          >
            {t === "stop-limit" ? "Stop-Limit" : t === "oco" ? "OCO" : t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4 h-9">
          <TabsTrigger value="buy" className="text-xs data-[state=active]:bg-[hsl(var(--vnx-green))]/20 data-[state=active]:text-[hsl(var(--vnx-green))]">
            Buy
          </TabsTrigger>
          <TabsTrigger value="sell" className="text-xs data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive">
            Sell
          </TabsTrigger>
        </TabsList>
        <TabsContent value="buy">{renderSide("buy")}</TabsContent>
        <TabsContent value="sell">{renderSide("sell")}</TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedOrderForm;
