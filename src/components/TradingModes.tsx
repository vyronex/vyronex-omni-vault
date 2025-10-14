import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { BarChart3, TrendingUp, Zap } from "lucide-react";

const TradingModes = () => {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <Card className="glass-card hover-lift group shadow-card">
        <CardHeader>
          <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-glow group-hover:shadow-glow-lg transition-all group-hover:scale-110 transition-bounce">
            <BarChart3 className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Spot Trading</CardTitle>
          <CardDescription>
            Buy and sell cryptocurrencies at current market prices with instant settlement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/trade">
            <Button className="w-full shadow-glow hover:shadow-glow-lg transition-all">
              Start Spot Trading
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="glass-card hover-lift group shadow-card">
        <CardHeader>
          <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-glow group-hover:shadow-glow-lg transition-all group-hover:scale-110 transition-bounce">
            <TrendingUp className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Margin Trading</CardTitle>
          <CardDescription>
            Trade with leverage up to 10x to amplify your potential returns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/trade">
            <Button className="w-full shadow-glow hover:shadow-glow-lg transition-all">
              Trade with Margin
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="glass-card hover-lift group shadow-card">
        <CardHeader>
          <div className="h-14 w-14 rounded-full gradient-primary flex items-center justify-center mb-4 shadow-glow group-hover:shadow-glow-lg transition-all group-hover:scale-110 transition-bounce">
            <Zap className="h-7 w-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Futures Trading</CardTitle>
          <CardDescription>
            Access perpetual and quarterly futures contracts with advanced tools
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link to="/trade">
            <Button className="w-full shadow-glow hover:shadow-glow-lg transition-all">
              Trade Futures
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default TradingModes;
