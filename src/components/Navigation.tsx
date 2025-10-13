import { Link, useLocation } from "react-router-dom";
import { Wallet, ArrowLeftRight, TrendingUp, Coins, Menu, LineChart } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { icon: Wallet, label: "Wallet", path: "/wallet" },
    { icon: ArrowLeftRight, label: "Swap", path: "/swap" },
    { icon: TrendingUp, label: "Stake", path: "/stake" },
    { icon: Coins, label: "Markets", path: "/markets" },
    { icon: LineChart, label: "Trade", path: "/trade" },
  ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link key={item.path} to={item.path}>
          <Button
            variant={location.pathname === item.path ? "default" : "ghost"}
            className="w-full justify-start gap-2"
          >
            <item.icon className="h-4 w-4" />
            {item.label}
          </Button>
        </Link>
      ))}
    </>
  );

  return (
    <nav className="border-b border-border bg-card/50 backdrop-blur-lg sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xl">V</span>
            </div>
            <span className="font-bold text-xl">
              Vyronex<span className="text-primary">VNX</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavLinks />
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-2 mt-8">
                <NavLinks />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
