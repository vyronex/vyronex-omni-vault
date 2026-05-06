import { useWallets } from "@/hooks/useWallets";
import { useOrders } from "@/hooks/useOrders";

const AccountSummary = () => {
  const { balances } = useWallets();
  const { orders } = useOrders();

  const openOrders = (orders ?? []).filter((o: any) => o.status === "open" || o.status === "partially_filled");
  const filledToday = (orders ?? []).filter((o: any) => {
    if (o.status !== "filled") return false;
    const d = new Date(o.updated_at || o.created_at);
    const now = new Date();
    return d.toDateString() === now.toDateString();
  });

  // Sum all USD-denominated balances
  const totalBalance = (balances ?? []).reduce((sum: number, b: any) => sum + Number(b.balance || 0), 0);

  const topBalances = (balances ?? [])
    .filter((b: any) => Number(b.balance) > 0)
    .sort((a: any, b: any) => Number(b.balance) - Number(a.balance))
    .slice(0, 5);

  return (
    <div className="glass-card rounded-lg p-4 shadow-card space-y-4">
      <h3 className="text-sm font-bold uppercase tracking-wider" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
        Account
      </h3>

      {/* Quick stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-2.5 rounded-lg bg-muted/20">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Open Orders</p>
          <p className="text-lg font-bold font-mono">{openOrders.length}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-muted/20">
          <p className="text-[9px] uppercase tracking-wider text-muted-foreground">Filled Today</p>
          <p className="text-lg font-bold font-mono">{filledToday.length}</p>
        </div>
      </div>

      {/* Top balances */}
      <div>
        <p className="text-[9px] uppercase tracking-wider text-muted-foreground mb-2">Holdings</p>
        {topBalances.length === 0 ? (
          <p className="text-xs text-muted-foreground">No balances</p>
        ) : (
          <div className="space-y-1.5">
            {topBalances.map((b: any) => (
              <div key={b.id} className="flex items-center justify-between text-xs">
                <span className="font-semibold">{b.token_symbol}</span>
                <span className="font-mono">{Number(b.balance).toFixed(4)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fee tier */}
      <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/10">
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">Fee Tier</span>
          <span className="font-bold text-primary">VIP 0</span>
        </div>
        <div className="flex items-center justify-between text-xs mt-1">
          <span className="text-muted-foreground">Maker / Taker</span>
          <span className="font-mono">0.10% / 0.10%</span>
        </div>
      </div>
    </div>
  );
};

export default AccountSummary;
