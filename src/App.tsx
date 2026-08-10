import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Wallet from "./pages/Wallet";
import Swap from "./pages/Swap";
import Stake from "./pages/Stake";
import Markets from "./pages/Markets";
import Trade from "./pages/Trade";
import Futures from "./pages/Futures";
import SpotTrading from "./pages/SpotTrading";
import Auth from "./pages/Auth";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Blog from "./pages/Blog";
import CoinDetail from "./pages/CoinDetail";
import VNXToken from "./pages/VNXToken";
import NotFound from "./pages/NotFound";
import Listings from "./pages/Listings";
import AdminWithdrawals from "./pages/AdminWithdrawals";
import ExchangeShell from "./components/exchange/ExchangeShell";
import ExchangeOverview from "./pages/exchange/Overview";

const queryClient = new QueryClient();

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/swap" element={<Swap />} />
        <Route path="/stake" element={<Stake />} />
        <Route path="/markets" element={<Markets />} />
        <Route path="/coin/:coinId" element={<CoinDetail />} />
        <Route path="/trade" element={<Trade />} />
        <Route path="/futures" element={<Futures />} />
        <Route path="/spot" element={<SpotTrading />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/vnx" element={<VNXToken />} />
        <Route path="/listings" element={<Listings />} />
        <Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
        <Route path="/app" element={<ExchangeShell />}>
          <Route index element={<ExchangeOverview />} />
        </Route>
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AnimatedRoutes />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
