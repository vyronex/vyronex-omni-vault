import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const About = () => {
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
              About <span className="text-gradient">VyronexVNX</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Building the future of decentralized finance with innovation, security, and trust.
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,hsl(25_95%_53%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Our <span className="text-gradient">Mission</span>
                </h2>
                <p className="text-muted-foreground mb-4">
                  VyronexVNX was founded with a simple yet powerful vision: to make decentralized finance accessible to everyone, everywhere. We believe that financial freedom is a fundamental right, not a privilege.
                </p>
                <p className="text-muted-foreground mb-4">
                  Our platform bridges the gap between traditional finance and the blockchain world, providing users with secure, efficient, and user-friendly tools to manage their digital assets.
                </p>
                <p className="text-muted-foreground">
                  We are committed to transparency, security, and innovation, ensuring that our users can trade with confidence in an ever-evolving market.
                </p>
              </div>
              <div className="p-8 rounded-lg glass-card shadow-elevated">
                <h3 className="text-xl font-bold mb-6">Our Values</h3>
                <div className="space-y-4">
                  {[
                    { title: "Security First", desc: "Your assets are protected with industry-leading security measures" },
                    { title: "Transparency", desc: "Open and honest communication with our community" },
                    { title: "Innovation", desc: "Constantly improving and adapting to market needs" },
                    { title: "User-Centric", desc: "Every decision is made with our users in mind" },
                  ].map((item, i) => (
                    <div key={i} className="p-4 rounded-lg bg-background/50">
                      <h4 className="font-semibold mb-1">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_60%,hsl(1_99%_48%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Meet Our <span className="text-gradient">Team</span>
              </h2>
              <p className="text-muted-foreground">Experienced professionals driving innovation</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { name: "Marcus Chen", role: "CEO & Founder", bio: "Former Goldman Sachs VP with 15+ years in fintech" },
                { name: "Elena Rodriguez", role: "CTO", bio: "Blockchain architect with experience at Coinbase and Binance" },
                { name: "David Kim", role: "Head of Security", bio: "Cybersecurity expert with NSA and Pentagon background" },
                { name: "Sarah Mitchell", role: "Head of Product", bio: "Product leader with experience at Stripe and PayPal" },
                { name: "James Okonkwo", role: "Head of Operations", bio: "Operations specialist from traditional banking sector" },
                { name: "Lisa Wang", role: "Head of Marketing", bio: "Growth expert who scaled multiple crypto startups" },
              ].map((member, i) => (
                <div key={i} className="p-6 rounded-lg glass-card hover-lift text-center">
                  <div className="h-20 w-20 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary-foreground">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg">{member.name}</h3>
                  <p className="text-sm text-primary mb-2">{member.role}</p>
                  <p className="text-sm text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* History Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,hsl(45_93%_58%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Our <span className="text-gradient">Journey</span>
              </h2>
              <p className="text-muted-foreground">From idea to industry leader</p>
            </div>
            <div className="space-y-8">
              {[
                { year: "2022", title: "The Beginning", desc: "VyronexVNX was founded with a vision to democratize DeFi" },
                { year: "2023", title: "Platform Launch", desc: "Launched multi-chain wallet with support for 6 blockchains" },
                { year: "2024", title: "VNX Token", desc: "Introduced VNX token and staking rewards program" },
                { year: "2025", title: "Global Expansion", desc: "Reached 50,000+ users across 100+ countries" },
              ].map((milestone, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="text-4xl font-bold text-gradient min-w-[100px]">{milestone.year}</div>
                  <div className="p-6 rounded-lg glass-card flex-1 hover-lift">
                    <h3 className="font-bold text-lg mb-2">{milestone.title}</h3>
                    <p className="text-muted-foreground">{milestone.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default About;
