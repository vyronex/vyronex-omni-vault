import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex flex-col">
      <Navigation />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="text-8xl font-bold text-gradient mb-4">404</div>
          <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
          <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist or has been moved.</p>
          <Link to="/">
            <Button size="lg" className="shadow-glow hover-glow">Return to Home</Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
    </PageTransition>
  );
};

export default NotFound;
