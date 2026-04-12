import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";
import { useState } from "react";

const blogPosts = [
  { id: 1, title: "VNX Token: The Future of Multi-Chain DeFi", excerpt: "Discover how VNX is revolutionizing cross-chain trading with our innovative token utility and governance features.", date: "February 5, 2025", category: "Announcements", readTime: "5 min" },
  { id: 2, title: "Understanding Staking Rewards and APY", excerpt: "A comprehensive guide to maximizing your staking rewards on the VyronexVNX platform with competitive APY rates.", date: "February 3, 2025", category: "Education", readTime: "8 min" },
  { id: 3, title: "Security Best Practices for Crypto Traders", excerpt: "Learn essential security practices to protect your digital assets from phishing, scams, and unauthorized access.", date: "January 28, 2025", category: "Security", readTime: "6 min" },
  { id: 4, title: "Q1 2025 Development Roadmap Update", excerpt: "Exciting updates on our development progress including new features, chain integrations, and partnership announcements.", date: "January 20, 2025", category: "Updates", readTime: "4 min" },
  { id: 5, title: "Multi-Chain Trading: A Beginner's Guide", excerpt: "Everything you need to know about trading across multiple blockchains including Ethereum, BNB, and Solana.", date: "January 15, 2025", category: "Education", readTime: "10 min" },
  { id: 6, title: "VyronexVNX Partners with Leading Liquidity Providers", excerpt: "Announcing our strategic partnerships to ensure deep liquidity and tight spreads for all trading pairs.", date: "January 10, 2025", category: "Announcements", readTime: "3 min" },
];

const categories = ["All", "Announcements", "Education", "Security", "Updates"];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } }),
};
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const Blog = () => {
  const [active, setActive] = useState("All");
  const filtered = active === "All" ? blogPosts : blogPosts.filter(p => p.category === active);
  const featured = blogPosts[0];

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Hero */}
        <section className="relative overflow-hidden py-24 md:py-32 flex items-center justify-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[120px]" />
          </div>
          <motion.div initial="hidden" animate="visible" variants={stagger} className="section-container relative text-center max-w-3xl mx-auto">
            <motion.span variants={fadeUp} custom={0} className="section-badge">Blog</motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="mt-4 text-5xl md:text-7xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
              News & <span className="text-gradient">insights.</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
              Stay updated with the latest from the VyronexVNX team.
            </motion.p>
          </motion.div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
        </section>

        {/* Categories */}
        <section className="py-6 border-b border-border/30">
          <div className="section-container">
            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all active-press ${
                    active === cat
                      ? 'gradient-primary text-primary-foreground shadow-glow'
                      : 'bg-card border border-border/40 text-muted-foreground hover:text-foreground hover:border-primary/30'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured */}
        <section className="py-16">
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="max-w-5xl mx-auto p-8 md:p-12 rounded-2xl bg-card border border-border/40 shadow-card hover-border-glow transition-all"
            >
              <div className="flex items-center gap-3 mb-5">
                <span className="px-3 py-1 rounded-full text-[11px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">Featured</span>
                <span className="text-sm text-muted-foreground">{featured.date}</span>
                <span className="text-sm text-muted-foreground">{featured.readTime}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4" style={{ fontFamily: "'Space Grotesk'" }}>{featured.title}</h2>
              <p className="text-lg text-muted-foreground mb-8 leading-relaxed max-w-3xl">{featured.excerpt}</p>
              <Button size="lg" className="rounded-full px-8 gradient-primary shadow-glow hover:shadow-glow-lg transition-all active-press">
                Read Article
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Grid */}
        <section className="py-16 relative">
          <div className="absolute inset-0 bg-card/30" />
          <div className="section-container relative">
            <div className="max-w-6xl mx-auto">
              <h2 className="text-2xl font-bold mb-8" style={{ fontFamily: "'Space Grotesk'" }}>Latest Articles</h2>
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.slice(1).map((post, i) => (
                  <motion.div
                    key={post.id}
                    variants={fadeUp}
                    custom={i}
                    className="p-6 rounded-2xl bg-card border border-border/40 shadow-card hover-border-glow hover-scale-subtle transition-all cursor-pointer group"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary/10 text-primary border border-primary/20">{post.category}</span>
                      <span className="text-xs text-muted-foreground">{post.readTime}</span>
                    </div>
                    <h3 className="text-lg font-bold mb-3 leading-snug group-hover:text-primary transition-colors" style={{ fontFamily: "'Space Grotesk'" }}>{post.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">{post.date}</span>
                      <span className="text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">Read more</span>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Newsletter */}
        <section className="py-24">
          <div className="section-container">
            <motion.div
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
              className="max-w-3xl mx-auto text-center p-10 md:p-14 rounded-2xl bg-card border border-border/40 shadow-card"
            >
              <span className="section-badge">Newsletter</span>
              <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk'" }}>
                Stay in the <span className="text-gradient">loop.</span>
              </h2>
              <p className="mt-3 text-muted-foreground max-w-md mx-auto">Get the latest articles and insights delivered directly to your inbox.</p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto mt-8">
                <input type="email" placeholder="Enter your email" className="flex-1 px-5 py-3 rounded-xl bg-background border border-border/40 text-foreground focus:outline-none focus:border-primary/50 transition-colors" />
                <Button size="lg" className="rounded-xl gradient-primary shadow-glow hover:shadow-glow-lg transition-all active-press">Subscribe</Button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Blog;
