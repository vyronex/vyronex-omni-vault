import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

const Auth = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"signin" | "signup">("signin");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/` },
        });
        if (error) throw error;
        toast.success("Account created! Please check your email to verify.");
        navigate("/");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success("Welcome back!");
        navigate("/wallet");
      }
    } catch (error: any) {
      toast.error(error.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background flex items-center justify-center relative overflow-hidden p-4">
        {/* Background */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[150px]" />
          <div className="absolute top-[20%] right-[20%] w-1 h-1 rounded-full bg-primary/30 animate-pulse" />
          <div className="absolute bottom-[30%] left-[15%] w-1.5 h-1.5 rounded-full bg-accent/20 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <Link to="/" className="inline-block mb-6">
              <span className="text-2xl font-bold text-gradient" style={{ fontFamily: "'Space Grotesk'" }}>VyronexVNX</span>
            </Link>
            <h1 className="text-3xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk'" }}>
              {mode === "signin" ? "Welcome back." : "Create account."}
            </h1>
            <p className="text-sm text-muted-foreground mt-2">
              {mode === "signin" ? "Sign in to access your portfolio" : "Start your trading journey today"}
            </p>
          </div>

          {/* Card */}
          <div className="p-8 rounded-2xl bg-card border border-border/40 shadow-card">
            {/* Tabs */}
            <div className="flex rounded-xl bg-background p-1 mb-6">
              <button
                onClick={() => setMode("signin")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === "signin" ? 'gradient-primary text-primary-foreground shadow-glow' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => setMode("signup")}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  mode === "signup" ? 'gradient-primary text-primary-foreground shadow-glow' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Email</label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-12 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-muted-foreground mb-2">Password</label>
                <Input
                  type="password"
                  placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={mode === "signup" ? 6 : undefined}
                  className="h-12 rounded-xl"
                />
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full h-13 rounded-xl gradient-primary shadow-glow hover:shadow-glow-lg transition-all active-press mt-2"
                disabled={loading}
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                    {mode === "signin" ? "Signing in..." : "Creating account..."}
                  </span>
                ) : (
                  mode === "signin" ? "Sign In" : "Create Account"
                )}
              </Button>
            </form>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-6">
            <Link to="/" className="text-primary hover:underline">Back to home</Link>
          </p>
        </motion.div>
      </div>
    </PageTransition>
  );
};

export default Auth;
