import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const values = [
  { title: "Security First", desc: "Your assets are protected with industry-leading security measures" },
  { title: "Transparency", desc: "Open and honest communication with our community" },
  { title: "Innovation", desc: "Constantly improving and adapting to market needs" },
  { title: "User-Centric", desc: "Every decision is made with our users in mind" },
];

const team = [
  { name: "Marcus Chen", role: "CEO & Founder", bio: "Former Goldman Sachs VP with 15+ years in fintech" },
  { name: "Elena Rodriguez", role: "CTO", bio: "Blockchain architect with experience at Coinbase and Binance" },
  { name: "David Kim", role: "Head of Security", bio: "Cybersecurity expert with NSA and Pentagon background" },
  { name: "Sarah Mitchell", role: "Head of Product", bio: "Product leader with experience at Stripe and PayPal" },
  { name: "James Okonkwo", role: "Head of Operations", bio: "Operations specialist from traditional banking sector" },
  { name: "Lisa Wang", role: "Head of Marketing", bio: "Growth expert who scaled multiple crypto startups" },
];

const milestones = [
  { year: "2022", title: "The Beginning", desc: "VyronexVNX was founded with a vision to democratize DeFi" },
  { year: "2023", title: "Platform Launch", desc: "Launched multi-chain wallet with support for 6 blockchains" },
  { year: "2024", title: "VNX Token", desc: "Introduced VNX token and staking rewards program" },
  { year: "2025", title: "Global Expansion", desc: "Reached 50,000+ users across 100+ countries" },
];

const About = () => {
  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navigation />

        {/* Hero */}
        <section className="relative overflow-hidden py-24 md:py-36 flex items-center justify-center">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />
          </div>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="section-container relative text-center max-w-3xl mx-auto"
          >
            <motion.span variants={fadeUp} custom={0} className="section-badge">About Us</motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="mt-4 text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
              Building the future of <span className="text-gradient">finance.</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mt-6 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
              Innovation, security, and trust — the pillars that drive everything we do at VyronexVNX.
            </motion.p>
          </motion.div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
        </section>

        {/* Mission + Values */}
        <section className="py-24 relative">
          <div className="section-container">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-start">
              <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
                <span className="section-badge">Mission</span>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk'" }}>
                  Democratizing <span className="text-gradient">DeFi</span> for everyone.
                </h2>
                <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
                  <p>VyronexVNX was founded with a simple yet powerful vision: to make decentralized finance accessible to everyone, everywhere. Financial freedom is a fundamental right, not a privilege.</p>
                  <p>Our platform bridges the gap between traditional finance and the blockchain world, providing secure, efficient, and user-friendly tools to manage digital assets.</p>
                  <p>We are committed to transparency, security, and innovation, ensuring our users trade with confidence in an ever-evolving market.</p>
                </div>
              </motion.div>

              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                {values.map((v, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    className="p-6 rounded-2xl bg-card border border-border/40 shadow-card hover-border-glow transition-all"
                  >
                    <h4 className="font-semibold mb-2" style={{ fontFamily: "'Space Grotesk'" }}>{v.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{v.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Team */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-card/30" />
          <div className="section-container relative">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-16">
                <span className="section-badge">Team</span>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk'" }}>
                  The people behind <span className="text-gradient">VyronexVNX.</span>
                </h2>
                <p className="mt-3 text-muted-foreground">Experienced professionals driving innovation</p>
              </div>
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={stagger}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {team.map((member, i) => (
                  <motion.div
                    key={i}
                    variants={fadeUp}
                    custom={i}
                    className="p-6 rounded-2xl bg-card border border-border/40 shadow-card hover-border-glow hover-scale-subtle transition-all text-center"
                  >
                    <div className="h-16 w-16 rounded-full gradient-primary mx-auto mb-4 flex items-center justify-center shadow-glow">
                      <span className="text-xl font-bold text-primary-foreground" style={{ fontFamily: "'Space Grotesk'" }}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg" style={{ fontFamily: "'Space Grotesk'" }}>{member.name}</h3>
                    <p className="text-sm text-primary font-medium mb-2">{member.role}</p>
                    <p className="text-sm text-muted-foreground leading-relaxed">{member.bio}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        {/* Journey Timeline */}
        <section className="py-24 relative">
          <div className="section-container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-16">
                <span className="section-badge">Journey</span>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk'" }}>
                  From idea to <span className="text-gradient">industry leader.</span>
                </h2>
              </div>
              <div className="relative">
                <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-border/40" />
                {milestones.map((m, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className={`relative flex items-start gap-6 mb-12 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} md:text-${i % 2 === 0 ? 'right' : 'left'}`}
                  >
                    <div className="hidden md:block flex-1" />
                    <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full gradient-primary shadow-glow z-10 mt-2" />
                    <div className="flex-1 ml-14 md:ml-0 p-6 rounded-2xl bg-card border border-border/40 shadow-card hover-border-glow transition-all">
                      <span className="text-sm font-bold text-gradient">{m.year}</span>
                      <h3 className="font-bold text-lg mt-1" style={{ fontFamily: "'Space Grotesk'" }}>{m.title}</h3>
                      <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{m.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default About;
