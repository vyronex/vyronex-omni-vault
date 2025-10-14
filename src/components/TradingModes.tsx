import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { BarChart3, TrendingUp, Zap } from "lucide-react";

const TradingModes = () => {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="border-border hover:border-primary/50 transition-all">
        <CardHeader>
          <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mb-4">
            <BarChart3 className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle>Spot Trading</CardTitle>
          <CardDescription>
            Buy and sell cryptocurrencies at current market prices with instant settlement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/trade">
            <Button className="w-full" variant="outline">Start Spot Trading</Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="border-border hover:border-primary/50 transition-all">
        <CardHeader>
          <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mb-4">
            <TrendingUp className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle>Margin Trading</CardTitle>
          <CardDescription>
            Trade with leverage up to 10x to amplify your potential returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/trade">
            <Button className="w-full" variant="outline">Trade with Margin</Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="border-border hover:border-primary/50 transition-all">
        <CardHeader>
          <div className="h-12 w-12 rounded-full gradient-primary flex items-center justify-center mb-4">
            <Zap className="h-6 w-6 text-primary-foreground" />
          </div>
          <CardTitle>Futures Trading</CardTitle>
          <CardDescription>
            Access perpetual and quarterly futures contracts with advanced tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/trade">
            <Button className="w-full" variant="outline">Trade Futures</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingModes;
