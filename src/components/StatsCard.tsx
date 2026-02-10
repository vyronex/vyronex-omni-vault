import { Card, CardContent } from "./ui/card";

interface StatsCardProps {
  label: string;
  value: string;
  change?: string;
}

const StatsCard = ({ label, value, change }: StatsCardProps) => {
  return (
    <Card className="shadow-card hover:shadow-glow transition-smooth">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="font-bold text-primary text-sm">{label.substring(0, 2).toUpperCase()}</span>
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-xl font-bold">{value}</p>
            {change && (
              <p className="text-xs text-muted-foreground mt-1">{change}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
