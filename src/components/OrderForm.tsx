import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from "@/hooks/useOrders";
import { useWallets } from "@/hooks/useWallets";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";

const orderSchema = z.object({
  price: z.number().positive().finite().max(1000000, "Price too high"),
  quantity: z.number().positive().finite().min(0.0001, "Quantity too small").max(1000000, "Quantity too high"),
});

const FEE_RATE = 0.001; // 0.1% standard taker fee

interface OrderFormProps {
  tradingPairId: string;
  baseToken: string;
  quoteToken: string;
}

const OrderForm = ({ tradingPairId, baseToken, quoteToken }: OrderFormProps) => {
  const { placeOrder } = useOrders();
  const { balances } = useWallets();
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const baseBalance = Number(balances?.find(b => b.token_symbol === baseToken)?.balance ?? 0);
  const quoteBalance = Number(balances?.find(b => b.token_symbol === quoteToken)?.balance ?? 0);

  const handlePlaceOrder = async (side: "buy" | "sell") => {
    if (!quantity) { toast.error("Please enter a quantity"); return; }
    if (orderType === "limit" && !price) { toast.error("Please enter a price"); return; }

    const parsedQuantity = parseFloat(quantity);
    const parsedPrice = orderType === "limit" ? parseFloat(price) : undefined;
    if (!isFinite(parsedQuantity)) { toast.error("Invalid quantity"); return; }
    if (orderType === "limit" && !isFinite(parsedPrice!)) { toast.error("Invalid price"); return; }

    const validation = orderSchema.safeParse({
      price: parsedPrice ?? 1,
      quantity: parsedQuantity,
    });
    if (!validation.success) {
      toast.error(validation.error.errors[0].message);
      return;
    }

    // Pre-flight balance check (defense in depth — server-side enforced too)
    if (side === "buy" && parsedPrice && (parsedPrice * parsedQuantity) > quoteBalance) {
      toast.error(`Insufficient ${quoteToken} balance`);
      return;
    }
    if (side === "sell" && parsedQuantity > baseBalance) {
      toast.error(`Insufficient ${baseToken} balance`);
      return;
    }

    try {
      await placeOrder.mutateAsync({
        trading_pair_id: tradingPairId,
        side,
        order_type: orderType,
        price: parsedPrice,
        quantity: parsedQuantity,
      });
      setPrice("");
      setQuantity("");
    } catch {
      // handled by mutation
    }
  };

  // Quick percent buttons of available balance
  const applyPercent = (side: "buy" | "sell", pct: number) => {
    if (side === "buy") {
      const px = parseFloat(price);
      if (orderType === "limit" && (!isFinite(px) || px <= 0)) {
        toast.error("Set a price first");
        return;
      }
      const refPrice = orderType === "limit" ? px : 1;
      const usable = (quoteBalance * pct) / refPrice;
      setQuantity(usable > 0 ? usable.toFixed(6) : "");
    } else {
      setQuantity((baseBalance * pct).toFixed(6));
    }
  };

  const renderSide = (side: "buy" | "sell") => {
    const px = parseFloat(price);
    const qty = parseFloat(quantity);
    const total = orderType === "limit" && isFinite(px) && isFinite(qty) ? px * qty : 0;
    const fee = total * FEE_RATE;
    const isBuy = side === "buy";
    const balance = isBuy ? quoteBalance : baseBalance;
    const balanceToken = isBuy ? quoteToken : baseToken;

    return (
      <div className="space-y-4 mt-0">
        {/* Balance display */}
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Available</span>
          <button
            type="button"
            onClick={() => applyPercent(side, 1)}
            className="font-mono font-semibold hover:text-primary transition-colors"
          >
            {balance.toFixed(6)} {balanceToken}
          </button>
        </div>

        {orderType === "limit" && (
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">Price ({quoteToken})</Label>
            <Input
              type="number" step="0.000001" placeholder="0.00"
              value={price} onChange={(e) => setPrice(e.target.value)} className="font-mono"
            />
          </div>
        )}

        <div>
          <Label className="text-xs text-muted-foreground mb-1.5 block">Amount ({baseToken})</Label>
          <Input
            type="number" step="0.0001" placeholder="0.00"
            value={quantity} onChange={(e) => setQuantity(e.target.value)} className="font-mono"
          />
        </div>

        {/* Quick % buttons */}
        <div className="grid grid-cols-4 gap-1.5">
          {[0.25, 0.5, 0.75, 1].map(pct => (
            <Button
              key={pct} type="button" variant="outline" size="sm"
              onClick={() => applyPercent(side, pct)}
              className="h-7 text-xs"
            >
              {pct === 1 ? "MAX" : `${pct * 100}%`}
            </Button>
          ))}
        </div>

        {/* Order summary */}
        {orderType === "limit" && total > 0 && (
          <div className="p-3 bg-muted/20 rounded-lg space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Total</span>
              <span className="font-mono font-semibold">{total.toFixed(6)} {quoteToken}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Fee (0.1%)</span>
              <span className="font-mono">{fee.toFixed(6)} {quoteToken}</span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-border/30">
              <span className="text-muted-foreground">You {isBuy ? "pay" : "receive"}</span>
              <span className="font-mono font-bold">
                {(isBuy ? total + fee : total - fee).toFixed(6)} {quoteToken}
              </span>
            </div>
          </div>
        )}

        <Button
          onClick={() => handlePlaceOrder(side)}
          disabled={placeOrder.isPending || !quantity || (orderType === "limit" && !price)}
          className={`w-full shadow-glow ${isBuy ? "bg-[hsl(var(--vnx-green))] hover:bg-[hsl(var(--vnx-green))]/90" : "bg-destructive hover:bg-destructive/90"} text-white`}
        >
          {placeOrder.isPending ? "Placing order..." : `${isBuy ? "Buy" : "Sell"} ${baseToken}`}
        </Button>
      </div>
    );
  };

  return (
    <div className="glass-card rounded-lg p-6 shadow-card">
      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="buy" className="data-[state=active]:bg-[hsl(var(--vnx-green))]/20 data-[state=active]:text-[hsl(var(--vnx-green))]">
            Buy {baseToken}
          </TabsTrigger>
          <TabsTrigger value="sell" className="data-[state=active]:bg-destructive/20 data-[state=active]:text-destructive">
            Sell {baseToken}
          </TabsTrigger>
        </TabsList>

        {/* Order Type */}
        <div className="mb-5">
          <Label className="text-xs text-muted-foreground mb-1.5 block">Order Type</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={orderType === "limit" ? "default" : "outline"}
              size="sm"
              onClick={() => setOrderType("limit")}
            >
              Limit
            </Button>
            <Button
              variant={orderType === "market" ? "default" : "outline"}
              size="sm"
              onClick={() => setOrderType("market")}
            >
              Market
            </Button>
          </div>
        </div>

        <TabsContent value="buy">{renderSide("buy")}</TabsContent>
        <TabsContent value="sell">{renderSide("sell")}</TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderForm;
