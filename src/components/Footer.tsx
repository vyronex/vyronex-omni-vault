import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/30 bg-card/50 mt-0">
      <div className="section-container py-16">
        <div className="grid md:grid-cols-5 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="h-10 w-10 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
                <span className="text-primary-foreground font-bold text-xl">V</span>
              </div>
              <span className="font-bold text-xl tracking-tight" style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}>
                Vyronex<span className="text-gradient">VNX</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-sm mb-6">
              The future of decentralized trading. Multi-chain DeFi platform with enterprise-grade security and seamless user experience.
            </p>
            <div className="flex gap-3">
              {["Twitter", "Discord", "Telegram", "GitHub"].map((social) => (
                <a key={social} href="#" className="px-3 py-1.5 rounded-lg bg-muted/50 text-muted-foreground text-xs font-medium hover:bg-primary/10 hover:text-primary transition-all">
                  {social}
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Products</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/wallet" className="hover:text-foreground transition-colors">Wallet</Link></li>
              <li><Link to="/swap" className="hover:text-foreground transition-colors">Swap</Link></li>
              <li><Link to="/stake" className="hover:text-foreground transition-colors">Stake</Link></li>
              <li><Link to="/trade" className="hover:text-foreground transition-colors">Trade</Link></li>
              <li><Link to="/vnx" className="hover:text-foreground transition-colors">VNX Token</Link></li>
              <li><Link to="/markets" className="hover:text-foreground transition-colors">Markets</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Resources</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
              <li><Link to="/about" className="hover:text-foreground transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">API Reference</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/terms" className="hover:text-foreground transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-foreground transition-colors">Privacy Policy</Link></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Cookie Policy</a></li>
              <li><a href="#" className="hover:text-foreground transition-colors">Security</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/30 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>
              <p>© 2025 VyronexVNX. All rights reserved.</p>
              <p className="text-xs mt-1 opacity-60">Contract: 0xeb55a55c384095ced21587afbe7418b7c9ae40cb</p>
            </div>
            <p className="text-xs opacity-60">Built for the future of DeFi</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
