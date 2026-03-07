import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { useState } from "react";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out successfully");
    navigate("/");
  };

  const navItems = [
    { label: "Wallet", path: "/wallet" },
    { label: "Swap", path: "/swap" },
    { label: "Stake", path: "/stake" },
    { label: "Markets", path: "/markets" },
    { label: "Spot", path: "/spot" },
    { label: "Trade", path: "/trade" },
    { label: "Futures", path: "/futures" },
    { label: "VNX", path: "/vnx" },
  ];

  return (
    <nav className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
      <div className="section-container py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all">
              <span className="text-primary-foreground font-bold text-lg">V</span>
            </div>
            <span className="font-bold text-xl tracking-tight" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
              Vyronex<span className="text-gradient">VNX</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path}>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`text-sm font-medium rounded-xl px-3 ${
                    location.pathname === item.path
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
          </div>

          <div className="hidden lg:flex items-center gap-3">
            {user ? (
              <>
                <Button variant="ghost" size="sm" className="rounded-xl" asChild>
                  <Link to="/wallet">Account</Link>
                </Button>
                <Button variant="outline" size="sm" className="rounded-xl" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" className="rounded-xl" asChild>
                  <Link to="/auth">Sign In</Link>
                </Button>
                <Button size="sm" className="rounded-xl gradient-primary shadow-glow hover:shadow-glow-lg transition-all" asChild>
                  <Link to="/auth">Get Started</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="lg:hidden flex flex-col gap-1.5 p-2"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className={`block w-5 h-0.5 bg-foreground transition-all ${mobileOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-5 h-0.5 bg-foreground transition-all ${mobileOpen ? "opacity-0" : ""}`} />
            <span className={`block w-5 h-0.5 bg-foreground transition-all ${mobileOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border/30 pt-4 space-y-2 animate-fade-in">
            {navItems.map((item) => (
              <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}>
                <Button
                  variant="ghost"
                  className={`w-full justify-start rounded-xl ${
                    location.pathname === item.path ? "bg-primary/10 text-primary" : "text-muted-foreground"
                  }`}
                >
                  {item.label}
                </Button>
              </Link>
            ))}
            <div className="pt-2 border-t border-border/30 flex gap-2">
              {user ? (
                <Button variant="outline" size="sm" className="w-full rounded-xl" onClick={handleSignOut}>
                  Sign Out
                </Button>
              ) : (
                <Button size="sm" className="w-full rounded-xl gradient-primary" asChild>
                  <Link to="/auth" onClick={() => setMobileOpen(false)}>Get Started</Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
