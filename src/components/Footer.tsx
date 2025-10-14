import { Link } from "react-router-dom";
import { Twitter, Github, MessageCircle, Mail } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/30 mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-10 w-10 rounded-lg gradient-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-xl">V</span>
              </div>
              <span className="font-bold text-xl">
                Vyronex<span className="text-primary">VNX</span>
              </span>
            </div>
            <p className="text-muted-foreground text-sm">
              The future of decentralized trading. Multi-chain DeFi platform with enterprise-grade security.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Products</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/wallet" className="hover:text-primary transition-colors">Wallet</Link></li>
              <li><Link to="/swap" className="hover:text-primary transition-colors">Swap</Link></li>
              <li><Link to="/stake" className="hover:text-primary transition-colors">Stake</Link></li>
              <li><Link to="/trade" className="hover:text-primary transition-colors">Trade</Link></li>
              <li><Link to="/markets" className="hover:text-primary transition-colors">Markets</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">API Reference</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Whitepaper</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <div className="flex gap-3 mb-4">
              <a href="#" className="h-10 w-10 rounded-lg border border-border hover:border-primary flex items-center justify-center transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-lg border border-border hover:border-primary flex items-center justify-center transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-lg border border-border hover:border-primary flex items-center justify-center transition-colors">
                <MessageCircle className="h-5 w-5" />
              </a>
              <a href="#" className="h-10 w-10 rounded-lg border border-border hover:border-primary flex items-center justify-center transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
            <p className="text-sm text-muted-foreground">
              Join our community and stay updated with the latest news.
            </p>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <div>
              <p>© 2025 VyronexVNX. All rights reserved.</p>
              <p className="text-xs mt-1">Contract: 0xeb55a55c384095ced21587afbe7418b7c9ae40cb</p>
            </div>
            <div className="flex gap-6">
              <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-primary transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
