import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from "@/hooks/useOrders";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { z } from "zod";

const orderSchema = z.object({
  price: z.number().positive().finite().max(1000000, "Price too high"),
  quantity: z.number().positive().finite().min(0.0001, "Quantity too small").max(1000000, "Quantity too high"),
});

interface OrderFormProps {
  tradingPairId: string;
  baseToken: string;
  quoteToken: string;
}

const OrderForm = ({ tradingPairId, baseToken, quoteToken }: OrderFormProps) => {
  const { placeOrder } = useOrders();
  const [orderType, setOrderType] = useState<"limit" | "market">("limit");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");

  const handlePlaceOrder = async (side: "buy" | "sell") => {
    if (!quantity) {
      toast.error("Please enter a quantity");
      return;
    }

    if (orderType === "limit" && !price) {
      toast.error("Please enter a price");
      return;
    }

    // Validate inputs
    const parsedQuantity = parseFloat(quantity);
    const parsedPrice = orderType === "limit" ? parseFloat(price) : undefined;

    if (isNaN(parsedQuantity) || !isFinite(parsedQuantity)) {
      toast.error("Invalid quantity value");
      return;
    }

    if (orderType === "limit" && (isNaN(parsedPrice!) || !isFinite(parsedPrice!))) {
      toast.error("Invalid price value");
      return;
    }

    try {
      const validation = orderSchema.safeParse({
        price: parsedPrice || 1, // Use dummy value for market orders
        quantity: parsedQuantity,
      });

      if (!validation.success) {
        const error = validation.error.errors[0];
        toast.error(error.message);
        return;
      }

      await placeOrder.mutateAsync({
        trading_pair_id: tradingPairId,
        side,
        order_type: orderType,
        price: parsedPrice,
        quantity: parsedQuantity,
      });

      // Reset form
      setPrice("");
      setQuantity("");
    } catch (error) {
      // Error already handled by mutation
    }
  };

  return (
    <div className="glass-card rounded-lg p-6 shadow-card">
      <Tabs defaultValue="buy" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="buy" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500">
            Buy {baseToken}
          </TabsTrigger>
          <TabsTrigger value="sell" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-500">
            Sell {baseToken}
          </TabsTrigger>
        </TabsList>

        {/* Order Type Selection */}
        <div className="mb-6">
          <Label className="text-sm text-muted-foreground mb-2 block">Order Type</Label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant={orderType === "limit" ? "default" : "outline"}
              onClick={() => setOrderType("limit")}
              className="w-full"
            >
              Limit
            </Button>
            <Button
              variant={orderType === "market" ? "default" : "outline"}
              onClick={() => setOrderType("market")}
              className="w-full"
            >
              Market
            </Button>
          </div>
        </div>

        <TabsContent value="buy" className="space-y-4 mt-0">
          {orderType === "limit" && (
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Price ({quoteToken})
              </Label>
              <Input
                type="number"
                step="0.000001"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="font-mono"
              />
            </div>
          )}

          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Amount ({baseToken})
            </Label>
            <Input
              type="number"
              step="0.0001"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="font-mono"
            />
          </div>

          {orderType === "limit" && price && quantity && (
            <div className="p-3 bg-muted/20 rounded-lg">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold font-mono">
                {(parseFloat(price) * parseFloat(quantity)).toFixed(6)} {quoteToken}
              </p>
            </div>
          )}

          <Button
            onClick={() => handlePlaceOrder("buy")}
            disabled={placeOrder.isPending || !quantity || (orderType === "limit" && !price)}
            className="w-full bg-green-600 hover:bg-green-700 text-white shadow-glow"
          >
            {placeOrder.isPending ? "Placing Order..." : `Buy ${baseToken}`}
          </Button>
        </TabsContent>

        <TabsContent value="sell" className="space-y-4 mt-0">
          {orderType === "limit" && (
            <div>
              <Label className="text-sm text-muted-foreground mb-2 block">
                Price ({quoteToken})
              </Label>
              <Input
                type="number"
                step="0.000001"
                placeholder="0.00"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="font-mono"
              />
            </div>
          )}

          <div>
            <Label className="text-sm text-muted-foreground mb-2 block">
              Amount ({baseToken})
            </Label>
            <Input
              type="number"
              step="0.0001"
              placeholder="0.00"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="font-mono"
            />
          </div>

          {orderType === "limit" && price && quantity && (
            <div className="p-3 bg-muted/20 rounded-lg">
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-bold font-mono">
                {(parseFloat(price) * parseFloat(quantity)).toFixed(6)} {quoteToken}
              </p>
            </div>
          )}

          <Button
            onClick={() => handlePlaceOrder("sell")}
            disabled={placeOrder.isPending || !quantity || (orderType === "limit" && !price)}
            className="w-full bg-red-600 hover:bg-red-700 text-white shadow-glow"
          >
            {placeOrder.isPending ? "Placing Order..." : `Sell ${baseToken}`}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrderForm;
