import { Button } from "@/components/ui/button";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

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
  ];

  const NavLinks = () => (
    <>
      {navItems.map((item) => (
        <Link key={item.path} to={item.path}>
          <Button
            variant={location.pathname === item.path ? "default" : "ghost"}
            className="w-full justify-start"
          >
            {item.label}
          </Button>
        </Link>
      ))}
    </>
  );

  return (
    <nav className="border-b border-border/50 glass-card backdrop-blur-xl sticky top-0 z-50 shadow-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center shadow-glow group-hover:shadow-glow-lg transition-all group-hover:scale-110 transition-bounce">
              <span className="text-primary-foreground font-bold text-xl">V</span>
            </div>
            <span className="font-bold text-xl">
              Vyronex<span className="text-gradient">VNX</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2">
            <NavLinks />
            {user ? (
              <div className="flex items-center gap-2 ml-4">
                <Button variant="outline" size="sm" asChild>
                  <Link to="/wallet">
                    Account
                  </Link>
                </Button>
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button variant="outline" asChild className="shadow-glow hover:shadow-glow-lg ml-4">
                <Link to="/auth">Sign In</Link>
              </Button>
            )}
          </div>

          {/* Mobile Navigation */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent>
              <div className="flex flex-col gap-2 mt-8">
                <NavLinks />
                {user ? (
                  <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-border">
                    <Button variant="outline" size="sm" asChild>
                      <Link to="/wallet">Account</Link>
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSignOut}>
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <Button variant="outline" asChild className="mt-4">
                    <Link to="/auth">Sign In</Link>
                  </Button>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
