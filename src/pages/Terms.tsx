import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 md:py-24">
        <div className="absolute inset-0 gradient-hero" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-4">
              Terms of <span className="text-gradient">Service</span>
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
                <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
                <p className="text-muted-foreground mb-4">
                  By accessing or using VyronexVNX ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                </p>
                <p className="text-muted-foreground">
                  These terms apply to all users, visitors, and others who access or use the Platform, including traders, investors, and API users.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">2. Eligibility</h2>
                <p className="text-muted-foreground mb-4">
                  You must be at least 18 years old and have the legal capacity to enter into contracts to use our services. By using the Platform, you represent and warrant that you meet these eligibility requirements.
                </p>
                <p className="text-muted-foreground">
                  Users from restricted jurisdictions may not access the Platform. It is your responsibility to ensure that using cryptocurrency services is legal in your jurisdiction.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">3. Account Registration</h2>
                <p className="text-muted-foreground mb-4">
                  To access certain features, you must create an account. You agree to provide accurate, current, and complete information and to update your information as necessary.
                </p>
                <p className="text-muted-foreground">
                  You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">4. Trading Services</h2>
                <p className="text-muted-foreground mb-4">
                  VyronexVNX provides cryptocurrency trading services including spot trading, staking, and token swaps. All trades are executed at your own risk.
                </p>
                <p className="text-muted-foreground">
                  We do not provide investment advice. Past performance is not indicative of future results. You should consult a financial advisor before making investment decisions.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">5. Fees and Charges</h2>
                <p className="text-muted-foreground mb-4">
                  Trading fees are 0.1% per transaction. VNX token holders receive fee discounts based on their holdings. All fees are subject to change with prior notice.
                </p>
                <p className="text-muted-foreground">
                  Network fees (gas fees) for blockchain transactions are separate from platform fees and are determined by the respective blockchain networks.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">6. Risk Disclosure</h2>
                <p className="text-muted-foreground mb-4">
                  Cryptocurrency trading involves substantial risk of loss. The value of cryptocurrencies can fluctuate significantly. You should only trade with funds you can afford to lose.
                </p>
                <p className="text-muted-foreground">
                  We are not responsible for any losses incurred through trading, market volatility, or technical issues beyond our control.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">7. Prohibited Activities</h2>
                <p className="text-muted-foreground mb-4">
                  You agree not to engage in market manipulation, money laundering, terrorist financing, or any other illegal activities. Automated trading that violates these terms is prohibited.
                </p>
                <p className="text-muted-foreground">
                  We reserve the right to suspend or terminate accounts that violate these terms without prior notice.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">8. Intellectual Property</h2>
                <p className="text-muted-foreground">
                  All content, trademarks, and intellectual property on the Platform belong to VyronexVNX or its licensors. You may not use, reproduce, or distribute any content without prior written permission.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">9. Limitation of Liability</h2>
                <p className="text-muted-foreground">
                  To the maximum extent permitted by law, VyronexVNX shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold mb-4">10. Contact</h2>
                <p className="text-muted-foreground">
                  For questions about these Terms of Service, please contact us at legal@vyronexvnx.com
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Terms;
