import { Card, CardContent } from "./ui/card";

interface PriceCardProps {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  volume?: string;
}

const PriceCard = ({ symbol, name, price, change24h, volume }: PriceCardProps) => {
  const isPositive = change24h >= 0;

  return (
    <Card className="shadow-card hover:shadow-glow transition-smooth">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-2xl font-bold">{symbol}</h3>
            <p className="text-sm text-muted-foreground">{name}</p>
          </div>
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
            }`}
          >
            <span className="text-sm font-medium">
              {isPositive ? "+" : ""}{Math.abs(change24h).toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-3xl font-bold">${price.toFixed(6)}</div>
          {volume && (
            <div className="text-sm text-muted-foreground">
              24h Volume: {volume}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceCard;
