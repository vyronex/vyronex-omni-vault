import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { useWallets } from "@/hooks/useWallets";
import { useTransactions } from "@/hooks/useTransactions";
import { useVNXPrice } from "@/hooks/useVNXPrice";
import { useMarketData } from "@/hooks/useCoinGecko";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

type Tab = "overview" | "wallets" | "history" | "convert" | "kyc" | "settings";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.06, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { wallets, balances, loading: walletsLoading, addWallet } = useWallets();
  const { transactions, loading: txLoading } = useTransactions();
  const { data: vnxPrice } = useVNXPrice();
  const { data: marketData } = useCoinGecko();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [profile, setProfile] = useState<{ username: string; avatar_url: string }>({ username: "", avatar_url: "" });
  const [kycStatus, setKycStatus] = useState<"none" | "pending" | "verified">("none");

  // Convert state
  const [fromToken, setFromToken] = useState("BTC");
  const [toToken, setToToken] = useState("USDT");
  const [convertAmount, setConvertAmount] = useState("");

  // Settings state
  const [newUsername, setNewUsername] = useState("");

  // KYC state
  const [kycData, setKycData] = useState({ fullName: "", country: "", idNumber: "" });

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      supabase.from("profiles").select("*").eq("id", user.id).single().then(({ data }) => {
        if (data) {
          setProfile({ username: data.username || "", avatar_url: data.avatar_url || "" });
          setNewUsername(data.username || "");
        }
      });
    }
  }, [user]);

  if (authLoading || walletsLoading) {
    return (
      <PageTransition>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      </PageTransition>
    );
  }

  if (!user) return null;

  const totalValue = balances?.reduce((sum, b) => sum + Number(b.usd_value), 0) || 0;
  const vnxBalance = balances?.find(b => b.token_symbol === "VNX");

  const tabs: { key: Tab; label: string }[] = [
    { key: "overview", label: "Overview" },
    { key: "wallets", label: "Wallets" },
    { key: "history", label: "History" },
    { key: "convert", label: "Convert" },
    { key: "kyc", label: "KYC" },
    { key: "settings", label: "Settings" },
  ];

  const getPrice = (symbol: string) => {
    const coinMap: Record<string, string> = { BTC: "bitcoin", ETH: "ethereum", BNB: "binancecoin", USDT: "tether", SOL: "solana", VNX: "vnx" };
    const coin = marketData?.find((c: any) => c.id === coinMap[symbol]);
    return coin?.current_price || 0;
  };

  const convertedAmount = convertAmount && getPrice(fromToken) && getPrice(toToken)
    ? ((parseFloat(convertAmount) * getPrice(fromToken)) / getPrice(toToken)).toFixed(6)
    : "0";

  const handleUpdateProfile = async () => {
    const { error } = await supabase.from("profiles").update({ username: newUsername }).eq("id", user.id);
    if (error) toast.error("Failed to update profile");
    else { toast.success("Profile updated"); setProfile(p => ({ ...p, username: newUsername })); }
  };

  const handleKycSubmit = () => {
    if (!kycData.fullName || !kycData.country || !kycData.idNumber) {
      toast.error("Please fill all KYC fields");
      return;
    }
    setKycStatus("pending");
    toast.success("KYC submitted for review");
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success("Signed out");
    navigate("/");
  };

  const tokenOptions = ["BTC", "ETH", "BNB", "USDT", "SOL", "VNX"];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="section-container py-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Welcome back,</p>
                  <h1 className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>
                    {profile.username || user.email?.split("@")[0] || "Trader"}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-xl" onClick={handleSignOut}>
                    Sign Out
                  </Button>
                </div>
              </div>
            </motion.div>

            {/* Tabs */}
            <motion.div initial="hidden" animate="visible" custom={1} variants={fadeUp} className="mb-6">
              <div className="flex gap-1 overflow-x-auto pb-2 rounded-xl bg-card border border-border/40 p-1">
                {tabs.map(t => (
                  <button
                    key={t.key}
                    onClick={() => setActiveTab(t.key)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                      activeTab === t.key
                        ? "gradient-primary text-primary-foreground shadow-glow"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
                {/* Portfolio Value */}
                <motion.div custom={0} variants={fadeUp} className="card-modern mb-6">
                  <p className="text-sm text-muted-foreground mb-1">Total Portfolio Value</p>
                  <p className="text-4xl font-bold" style={{ fontFamily: "'Space Grotesk'" }}>${totalValue.toFixed(2)}</p>
                  <div className="flex gap-4 mt-4 text-sm">
                    <span className="text-muted-foreground">Assets: {balances?.length || 0}</span>
                    <span className="text-muted-foreground">Wallets: {wallets?.length || 0}</span>
                    {vnxPrice && <span className="text-muted-foreground">VNX: ${vnxPrice.price.toFixed(4)}</span>}
                  </div>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: "VNX Holdings", value: vnxBalance ? Number(vnxBalance.balance).toLocaleString() : "0" },
                    { label: "24h Change", value: `${vnxPrice?.change24h ? (vnxPrice.change24h > 0 ? "+" : "") + vnxPrice.change24h.toFixed(2) : "0.00"}%` },
                    { label: "Transactions", value: (transactions?.length || 0).toString() },
                    { label: "KYC Status", value: kycStatus === "verified" ? "Verified" : kycStatus === "pending" ? "Pending" : "Not Started" },
                  ].map((s, i) => (
                    <motion.div key={i} custom={i + 1} variants={fadeUp} className="card-modern p-4">
                      <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                      <p className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk'" }}>{s.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Asset Holdings */}
                <motion.div custom={5} variants={fadeUp} className="data-card mb-6">
                  <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>Asset Holdings</h2>
                  {balances && balances.length > 0 ? (
                    <div className="space-y-2">
                      {balances.map((b) => (
                        <div key={b.id} className="data-row">
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
                              <span className="font-bold text-primary text-xs">{b.token_symbol.slice(0, 3)}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-sm">{b.token_symbol}</p>
                              <p className="text-xs text-muted-foreground">{Number(b.balance).toLocaleString()}</p>
                            </div>
                          </div>
                          <p className="font-semibold text-sm">${Number(b.usd_value).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8 text-sm">No assets yet. Start trading to build your portfolio.</p>
                  )}
                </motion.div>

                {/* Recent Transactions */}
                <motion.div custom={6} variants={fadeUp} className="data-card mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold" style={{ fontFamily: "'Space Grotesk'" }}>Recent Activity</h2>
                    <button onClick={() => setActiveTab("history")} className="text-sm text-primary hover:underline">View All</button>
                  </div>
                  {transactions && transactions.length > 0 ? (
                    <div className="space-y-2">
                      {transactions.slice(0, 5).map(tx => (
                        <div key={tx.id} className="data-row">
                          <div>
                            <p className="font-semibold text-sm">{tx.tx_type}</p>
                            <p className="text-xs text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-sm">{Number(tx.amount).toFixed(4)} {tx.token_symbol}</p>
                            <p className={`text-xs font-medium ${tx.status === 'confirmed' ? 'text-[hsl(var(--vnx-green))]' : 'text-[hsl(var(--vnx-gold))]'}`}>{tx.status}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8 text-sm">No transactions yet</p>
                  )}
                </motion.div>

                {/* Quick Actions */}
                <motion.div custom={7} variants={fadeUp} className="data-card">
                  <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>Quick Actions</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {[
                      { label: "Trade", path: "/trade" },
                      { label: "Swap", path: "/swap" },
                      { label: "Stake VNX", path: "/stake" },
                      { label: "Markets", path: "/markets" },
                    ].map(a => (
                      <Link key={a.path} to={a.path}>
                        <Button variant="outline" className="w-full rounded-xl h-11 hover-border-glow active-press text-sm">{a.label}</Button>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* WALLETS TAB */}
            {activeTab === "wallets" && (
              <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
                <motion.div custom={0} variants={fadeUp} className="data-card mb-6">
                  <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>Connected Wallets</h2>
                  {wallets && wallets.length > 0 ? (
                    <div className="space-y-3">
                      {wallets.map(w => (
                        <div key={w.id} className="data-row">
                          <div>
                            <p className="font-semibold text-sm">{w.chain}</p>
                            <p className="text-xs text-muted-foreground font-mono">{w.address.slice(0, 8)}...{w.address.slice(-6)}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-lg ${w.is_primary ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                            {w.is_primary ? "Primary" : "Secondary"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8 text-sm">No wallets connected</p>
                  )}
                </motion.div>

                <motion.div custom={1} variants={fadeUp} className="data-card mb-6">
                  <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>All Assets</h2>
                  {balances && balances.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="text-muted-foreground text-left border-b border-border/40">
                            <th className="pb-3 font-medium">Asset</th>
                            <th className="pb-3 font-medium text-right">Balance</th>
                            <th className="pb-3 font-medium text-right">USD Value</th>
                          </tr>
                        </thead>
                        <tbody>
                          {balances.map(b => (
                            <tr key={b.id} className="border-b border-border/20">
                              <td className="py-3 font-semibold">{b.token_symbol}</td>
                              <td className="py-3 text-right">{Number(b.balance).toLocaleString()}</td>
                              <td className="py-3 text-right">${Number(b.usd_value).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8 text-sm">No assets found</p>
                  )}
                </motion.div>

                <motion.div custom={2} variants={fadeUp} className="data-card">
                  <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>Supported Networks</h2>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {["BNB Chain", "Ethereum", "Tron", "Bitcoin", "Solana", "Fantom"].map(n => (
                      <div key={n} className="p-3 rounded-xl border border-border/40 text-center text-sm font-medium">{n}</div>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            )}

            {/* HISTORY TAB */}
            {activeTab === "history" && (
              <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp} className="data-card">
                <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>Transaction History</h2>
                {txLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : transactions && transactions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-muted-foreground text-left border-b border-border/40">
                          <th className="pb-3 font-medium">Type</th>
                          <th className="pb-3 font-medium">Token</th>
                          <th className="pb-3 font-medium text-right">Amount</th>
                          <th className="pb-3 font-medium text-right">Status</th>
                          <th className="pb-3 font-medium text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map(tx => (
                          <tr key={tx.id} className="border-b border-border/20">
                            <td className="py-3 font-semibold">{tx.tx_type}</td>
                            <td className="py-3">{tx.token_symbol}</td>
                            <td className="py-3 text-right">{Number(tx.amount).toFixed(4)}</td>
                            <td className="py-3 text-right">
                              <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${tx.status === 'confirmed' ? 'bg-[hsl(var(--vnx-green))]/10 text-[hsl(var(--vnx-green))]' : 'bg-[hsl(var(--vnx-gold))]/10 text-[hsl(var(--vnx-gold))]'}`}>
                                {tx.status}
                              </span>
                            </td>
                            <td className="py-3 text-right text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground py-12 text-sm">No transactions yet</p>
                )}
              </motion.div>
            )}

            {/* CONVERT TAB */}
            {activeTab === "convert" && (
              <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
                <div className="card-modern max-w-lg mx-auto">
                  <h2 className="text-lg font-bold mb-6" style={{ fontFamily: "'Space Grotesk'" }}>Convert Crypto</h2>
                  <p className="text-sm text-muted-foreground mb-6">Exchange one crypto asset for another using live market prices.</p>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">From</label>
                      <div className="flex gap-3">
                        <select
                          value={fromToken}
                          onChange={e => setFromToken(e.target.value)}
                          className="h-12 rounded-xl border border-border/40 bg-background px-3 text-sm font-medium min-w-[100px]"
                        >
                          {tokenOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <Input
                          type="number"
                          placeholder="0.00"
                          value={convertAmount}
                          onChange={e => setConvertAmount(e.target.value)}
                          className="h-12 rounded-xl flex-1"
                        />
                      </div>
                      {getPrice(fromToken) > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">1 {fromToken} = ${getPrice(fromToken).toLocaleString()}</p>
                      )}
                    </div>

                    <div className="flex justify-center">
                      <button
                        onClick={() => { setFromToken(toToken); setToToken(fromToken); }}
                        className="h-10 w-10 rounded-xl border border-border/40 flex items-center justify-center hover:bg-muted/50 transition-colors text-muted-foreground"
                      >
                        ↕
                      </button>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">To</label>
                      <div className="flex gap-3">
                        <select
                          value={toToken}
                          onChange={e => setToToken(e.target.value)}
                          className="h-12 rounded-xl border border-border/40 bg-background px-3 text-sm font-medium min-w-[100px]"
                        >
                          {tokenOptions.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <Input
                          type="text"
                          value={convertedAmount}
                          readOnly
                          className="h-12 rounded-xl flex-1 bg-muted/30"
                        />
                      </div>
                      {getPrice(toToken) > 0 && (
                        <p className="text-xs text-muted-foreground mt-1">1 {toToken} = ${getPrice(toToken).toLocaleString()}</p>
                      )}
                    </div>

                    {convertAmount && parseFloat(convertAmount) > 0 && (
                      <div className="p-4 rounded-xl bg-muted/30 border border-border/30">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Rate</span>
                          <span>1 {fromToken} = {(getPrice(fromToken) / getPrice(toToken)).toFixed(6)} {toToken}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-muted-foreground">Fee</span>
                          <span>0.1%</span>
                        </div>
                        <div className="flex justify-between text-sm font-semibold">
                          <span>You receive</span>
                          <span>{convertedAmount} {toToken}</span>
                        </div>
                      </div>
                    )}

                    <Button
                      className="w-full h-12 rounded-xl gradient-primary shadow-glow hover:shadow-glow-lg active-press"
                      disabled={!convertAmount || parseFloat(convertAmount) <= 0}
                      onClick={() => toast.info("Conversion feature coming soon with live blockchain integration")}
                    >
                      Convert {fromToken} to {toToken}
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}

            {/* KYC TAB */}
            {activeTab === "kyc" && (
              <motion.div initial="hidden" animate="visible" custom={0} variants={fadeUp}>
                <div className="card-modern max-w-lg mx-auto">
                  <h2 className="text-lg font-bold mb-2" style={{ fontFamily: "'Space Grotesk'" }}>Identity Verification</h2>
                  <p className="text-sm text-muted-foreground mb-6">Complete KYC to unlock higher trading limits and withdrawals.</p>

                  {kycStatus === "verified" ? (
                    <div className="text-center py-8">
                      <div className="h-16 w-16 rounded-full bg-[hsl(var(--vnx-green))]/10 flex items-center justify-center mx-auto mb-4">
                        <span className="text-[hsl(var(--vnx-green))] text-2xl font-bold">✓</span>
                      </div>
                      <p className="font-semibold text-lg">Verified</p>
                      <p className="text-sm text-muted-foreground">Your identity has been verified successfully.</p>
                    </div>
                  ) : kycStatus === "pending" ? (
                    <div className="text-center py-8">
                      <div className="h-16 w-16 rounded-full bg-[hsl(var(--vnx-gold))]/10 flex items-center justify-center mx-auto mb-4">
                        <div className="h-6 w-6 border-2 border-[hsl(var(--vnx-gold))] border-t-transparent rounded-full animate-spin" />
                      </div>
                      <p className="font-semibold text-lg">Under Review</p>
                      <p className="text-sm text-muted-foreground">Your documents are being reviewed. This usually takes 1-3 business days.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Tier Info */}
                      <div className="grid grid-cols-2 gap-3 mb-6">
                        <div className="p-4 rounded-xl border border-border/40">
                          <p className="text-xs text-muted-foreground mb-1">Tier 1 - Basic</p>
                          <p className="font-semibold text-sm">$2,000/day</p>
                          <p className="text-xs text-muted-foreground">Email verification only</p>
                        </div>
                        <div className="p-4 rounded-xl border border-primary/30 bg-primary/5">
                          <p className="text-xs text-primary mb-1">Tier 2 - Full</p>
                          <p className="font-semibold text-sm">$50,000/day</p>
                          <p className="text-xs text-muted-foreground">ID + Proof of address</p>
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Full Legal Name</label>
                        <Input
                          placeholder="John Doe"
                          value={kycData.fullName}
                          onChange={e => setKycData(d => ({ ...d, fullName: e.target.value }))}
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Country of Residence</label>
                        <Input
                          placeholder="United States"
                          value={kycData.country}
                          onChange={e => setKycData(d => ({ ...d, country: e.target.value }))}
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="text-sm font-medium text-muted-foreground mb-2 block">Government ID Number</label>
                        <Input
                          placeholder="ID / Passport number"
                          value={kycData.idNumber}
                          onChange={e => setKycData(d => ({ ...d, idNumber: e.target.value }))}
                          className="h-12 rounded-xl"
                        />
                      </div>
                      <Button
                        className="w-full h-12 rounded-xl gradient-primary shadow-glow hover:shadow-glow-lg active-press"
                        onClick={handleKycSubmit}
                      >
                        Submit for Verification
                      </Button>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === "settings" && (
              <motion.div initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.06 } } }}>
                <motion.div custom={0} variants={fadeUp} className="card-modern max-w-lg mx-auto mb-6">
                  <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>Profile Settings</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Email</label>
                      <Input value={user.email || ""} disabled className="h-12 rounded-xl bg-muted/30" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-muted-foreground mb-2 block">Username</label>
                      <Input
                        value={newUsername}
                        onChange={e => setNewUsername(e.target.value)}
                        placeholder="Choose a username"
                        className="h-12 rounded-xl"
                      />
                    </div>
                    <Button className="w-full h-12 rounded-xl gradient-primary shadow-glow active-press" onClick={handleUpdateProfile}>
                      Save Changes
                    </Button>
                  </div>
                </motion.div>

                <motion.div custom={1} variants={fadeUp} className="card-modern max-w-lg mx-auto mb-6">
                  <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>Security</h2>
                  <div className="space-y-3">
                    <div className="data-row">
                      <div>
                        <p className="font-semibold text-sm">Two-Factor Authentication</p>
                        <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => toast.info("2FA setup coming soon")}>Enable</Button>
                    </div>
                    <div className="data-row">
                      <div>
                        <p className="font-semibold text-sm">Change Password</p>
                        <p className="text-xs text-muted-foreground">Update your account password</p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => toast.info("Password change coming soon")}>Update</Button>
                    </div>
                    <div className="data-row">
                      <div>
                        <p className="font-semibold text-sm">Active Sessions</p>
                        <p className="text-xs text-muted-foreground">Manage logged-in devices</p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => toast.info("Session management coming soon")}>Manage</Button>
                    </div>
                  </div>
                </motion.div>

                <motion.div custom={2} variants={fadeUp} className="card-modern max-w-lg mx-auto">
                  <h2 className="text-lg font-bold mb-4" style={{ fontFamily: "'Space Grotesk'" }}>Preferences</h2>
                  <div className="space-y-3">
                    <div className="data-row">
                      <div>
                        <p className="font-semibold text-sm">Currency</p>
                        <p className="text-xs text-muted-foreground">Display currency for values</p>
                      </div>
                      <span className="text-sm font-medium">USD</span>
                    </div>
                    <div className="data-row">
                      <div>
                        <p className="font-semibold text-sm">Notifications</p>
                        <p className="text-xs text-muted-foreground">Email alerts for trades</p>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-xl" onClick={() => toast.info("Notification settings coming soon")}>Configure</Button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </div>
        </div>
        <Footer />
      </div>
    </PageTransition>
  );
};

export default Dashboard;
