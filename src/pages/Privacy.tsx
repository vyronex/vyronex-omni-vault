import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";

const Privacy = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Privacy <span className="text-gradient">Policy</span>
            </h1>
            <p className="text-muted-foreground">Last updated: February 7, 2025</p>
          </div>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="p-8 md:p-12 rounded-lg glass-card shadow-elevated space-y-8">
              
              <div>
                <h2 className="text-2xl font-bold mb-4">1. Information We Collect</h2>
                <p className="text-muted-foreground mb-4">
                  We collect information you provide directly, including your email address, name, and wallet addresses when you create an account or use our services.
                </p>
                <p className="text-muted-foreground">
                  We also collect usage data automatically, including IP addresses, browser type, device information, and interaction data with our Platform.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">2. How We Use Your Information</h2>
                <p className="text-muted-foreground mb-4">
                  We use your information to provide, maintain, and improve our services, process transactions, send notifications, and ensure Platform security.
                </p>
                <p className="text-muted-foreground">
                  We may use your email to send marketing communications, which you can opt out of at any time.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">3. Data Sharing</h2>
                <p className="text-muted-foreground mb-4">
                  We do not sell your personal information. We may share data with service providers who assist in operating our Platform, subject to confidentiality agreements.
                </p>
                <p className="text-muted-foreground">
                  We may disclose information when required by law, to protect our rights, or in connection with a business transfer.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">4. Data Security</h2>
                <p className="text-muted-foreground mb-4">
                  We implement industry-standard security measures including AES-256 encryption, secure data centers, and regular security audits.
                </p>
                <p className="text-muted-foreground">
                  While we strive to protect your information, no method of transmission over the Internet is 100% secure.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">5. Blockchain Data</h2>
                <p className="text-muted-foreground">
                  Blockchain transactions are public by nature. Your wallet addresses and transaction history on public blockchains are visible to anyone. We cannot delete or modify blockchain data.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">6. Cookies and Tracking</h2>
                <p className="text-muted-foreground mb-4">
                  We use cookies and similar technologies to enhance your experience, analyze usage patterns, and personalize content.
                </p>
                <p className="text-muted-foreground">
                  You can control cookie preferences through your browser settings, though some features may not function properly without cookies.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">7. Your Rights</h2>
                <p className="text-muted-foreground mb-4">
                  You have the right to access, correct, or delete your personal information. You can also object to processing or request data portability.
                </p>
                <p className="text-muted-foreground">
                  To exercise these rights, contact us at privacy@vyronexvnx.com
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">8. Data Retention</h2>
                <p className="text-muted-foreground">
                  We retain your information for as long as your account is active or as needed to provide services. Some data may be retained longer for legal or compliance purposes.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">9. International Transfers</h2>
                <p className="text-muted-foreground">
                  Your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for such transfers.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">10. Children's Privacy</h2>
                <p className="text-muted-foreground">
                  Our services are not intended for children under 18. We do not knowingly collect information from minors.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">11. Changes to This Policy</h2>
                <p className="text-muted-foreground">
                  We may update this policy periodically. We will notify you of significant changes via email or Platform notification.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">12. Contact Us</h2>
                <p className="text-muted-foreground">
                  For questions about this Privacy Policy, please contact us at privacy@vyronexvnx.com
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
    </PageTransition>
  );
};

export default Privacy;
