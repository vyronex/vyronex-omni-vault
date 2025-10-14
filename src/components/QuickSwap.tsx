import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { ArrowDownUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const QuickSwap = () => {
  const [fromAmount, setFromAmount] = useState("");
  const [toAmount, setToAmount] = useState("");
  const { toast } = useToast();

  const handleSwap = () => {
    if (!fromAmount) {
      toast({
        title: "Enter amount",
        description: "Please enter an amount to swap",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Swap initiated",
      description: "Connecting to DEX for swap execution...",
    });
  };

  return (
    <Card className="max-w-md mx-auto glass-card shadow-elevated">
      <CardHeader>
        <CardTitle className="text-2xl">Quick Swap</CardTitle>
        <CardDescription>Instantly swap tokens across multiple chains</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>From</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.00"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
              className="flex-1"
            />
            <select className="px-4 py-2 rounded-md border border-border bg-background">
              <option>BNB</option>
              <option>ETH</option>
              <option>USDT</option>
              <option>VNX</option>
            </select>
          </div>
        </div>

        <div className="flex justify-center">
          <Button variant="ghost" size="icon" className="rounded-full">
            <ArrowDownUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-2">
          <Label>To</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              placeholder="0.00"
              value={toAmount}
              readOnly
              className="flex-1"
            />
            <select className="px-4 py-2 rounded-md border border-border bg-background">
              <option>USDT</option>
              <option>BNB</option>
              <option>ETH</option>
              <option>VNX</option>
            </select>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-accent/10 text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Rate</span>
            <span>1 BNB = ~$605.00</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Slippage</span>
            <span>1%</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Network Fee</span>
            <span>~$0.50</span>
          </div>
        </div>

        <Button className="w-full shadow-glow hover:shadow-glow-lg transition-all" onClick={handleSwap}>
          Swap Now
        </Button>
      </CardContent>
    </Card>
  );
};

export default QuickSwap;
