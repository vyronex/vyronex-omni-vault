import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useOrders } from "@/hooks/useOrders";
import { Label } from "@/components/ui/label";

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
      return;
    }

    if (orderType === "limit" && !price) {
      return;
    }

    await placeOrder.mutateAsync({
      trading_pair_id: tradingPairId,
      side,
      order_type: orderType,
      price: orderType === "limit" ? parseFloat(price) : undefined,
      quantity: parseFloat(quantity),
    });

    // Reset form
    setPrice("");
    setQuantity("");
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
