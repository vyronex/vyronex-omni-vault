import { Link } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const blogPosts = [
  {
    id: 1,
    title: "VNX Token: The Future of Multi-Chain DeFi",
    excerpt: "Discover how VNX is revolutionizing cross-chain trading with our innovative token utility and governance features.",
    date: "February 5, 2025",
    category: "Announcements",
    readTime: "5 min read",
  },
  {
    id: 2,
    title: "Understanding Staking Rewards and APY",
    excerpt: "A comprehensive guide to maximizing your staking rewards on the VyronexVNX platform with competitive APY rates.",
    date: "February 3, 2025",
    category: "Education",
    readTime: "8 min read",
  },
  {
    id: 3,
    title: "Security Best Practices for Crypto Traders",
    excerpt: "Learn essential security practices to protect your digital assets from phishing, scams, and unauthorized access.",
    date: "January 28, 2025",
    category: "Security",
    readTime: "6 min read",
  },
  {
    id: 4,
    title: "Q1 2025 Development Roadmap Update",
    excerpt: "Exciting updates on our development progress including new features, chain integrations, and partnership announcements.",
    date: "January 20, 2025",
    category: "Updates",
    readTime: "4 min read",
  },
  {
    id: 5,
    title: "Multi-Chain Trading: A Beginner's Guide",
    excerpt: "Everything you need to know about trading across multiple blockchains including Ethereum, BNB, and Solana.",
    date: "January 15, 2025",
    category: "Education",
    readTime: "10 min read",
  },
  {
    id: 6,
    title: "VyronexVNX Partners with Leading Liquidity Providers",
    excerpt: "Announcing our strategic partnerships to ensure deep liquidity and tight spreads for all trading pairs.",
    date: "January 10, 2025",
    category: "Announcements",
    readTime: "3 min read",
  },
];

const categories = ["All", "Announcements", "Education", "Security", "Updates"];

const Blog = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 md:py-32">
        <div className="absolute inset-0 gradient-hero" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,hsl(1_99%_48%/0.15),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="text-gradient">Blog</span> & News
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stay updated with the latest news, insights, and updates from the VyronexVNX team.
            </p>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-card/30 border-b border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={category === "All" ? "default" : "outline"}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Post */}
      <section className="py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,hsl(25_95%_53%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="p-8 md:p-12 rounded-lg glass-card shadow-elevated hover-lift">
              <div className="flex items-center gap-4 mb-4">
                <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                  Featured
                </span>
                <span className="text-sm text-muted-foreground">{blogPosts[0].date}</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">{blogPosts[0].title}</h2>
              <p className="text-lg text-muted-foreground mb-6">{blogPosts[0].excerpt}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{blogPosts[0].readTime}</span>
                <Button className="shadow-glow hover-glow">Read Article</Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Grid */}
      <section className="py-16 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_60%,hsl(1_99%_48%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold mb-8">Latest Articles</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.slice(1).map((post) => (
                <div key={post.id} className="p-6 rounded-lg glass-card hover-lift">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                      {post.category}
                    </span>
                    <span className="text-xs text-muted-foreground">{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-bold mb-3 line-clamp-2">{post.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{post.date}</span>
                    <span className="text-sm text-primary font-medium">Read more</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(25_95%_53%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 md:p-12 rounded-lg glass-card shadow-elevated text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Subscribe to Our <span className="text-gradient">Newsletter</span>
              </h2>
              <p className="text-muted-foreground mb-6">
                Get the latest articles and insights delivered directly to your inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-lg bg-background border border-border focus:outline-none focus:border-primary"
                />
                <Button size="lg" className="shadow-glow hover-glow">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Blog;
