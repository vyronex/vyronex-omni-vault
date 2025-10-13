import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  change?: string;
}

const StatsCard = ({ icon: Icon, label, value, change }: StatsCardProps) => {
  return (
    <Card className="shadow-card hover:shadow-glow transition-smooth">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold">{value}</p>
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
