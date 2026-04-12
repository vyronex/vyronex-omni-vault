import { useState } from "react";
import { z } from "zod";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PageTransition from "@/components/PageTransition";
import { motion } from "framer-motion";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name too long"),
  email: z.string().trim().email("Invalid email").max(255, "Email too long"),
  subject: z.string().trim().min(1, "Subject is required").max(200, "Subject too long"),
  message: z.string().trim().min(1, "Message is required").max(2000, "Message too long"),
});

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  }),
};

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } };

const contactInfo = [
  { title: "General Inquiries", email: "support@vyronexvnx.com" },
  { title: "Business Partnerships", email: "partnerships@vyronexvnx.com" },
  { title: "Technical Support", email: "tech@vyronexvnx.com" },
  { title: "Press & Media", email: "press@vyronexvnx.com" },
];

const helpTopics = [
  { title: "Getting Started", desc: "Learn how to create an account and start trading" },
  { title: "Security", desc: "Two-factor authentication, wallet security, and more" },
  { title: "Trading Basics", desc: "Understanding orders, fees, and trading pairs" },
  { title: "Deposits & Withdrawals", desc: "How to fund your account and withdraw assets" },
  { title: "VNX Token", desc: "Learn about staking, rewards, and token utility" },
  { title: "API Documentation", desc: "Integrate with our platform using our REST API" },
];

const Contact = () => {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    const result = contactSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => { if (err.path[0]) fieldErrors[err.path[0] as string] = err.message; });
      setErrors(fieldErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("contact_submissions").insert({
        name: result.data.name, email: result.data.email, subject: result.data.subject, message: result.data.message,
      });
      if (error) throw error;
      toast.success("Message sent! We'll get back to you within 24 hours.");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      toast.error("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <motion.span variants={fadeUp} custom={0} className="section-badge">Contact</motion.span>
            <motion.h1 variants={fadeUp} custom={1} className="mt-4 text-4xl md:text-6xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk', system-ui" }}>
              Get in <span className="text-gradient">touch.</span>
            </motion.h1>
            <motion.p variants={fadeUp} custom={2} className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
              Have questions? We're here to help. Reach out to our team anytime.
            </motion.p>
          </motion.div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border/40 to-transparent" />
        </section>

        {/* Form + Info */}
        <section className="py-24">
          <div className="section-container">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-5 gap-12">
              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}
                className="lg:col-span-3 p-8 rounded-2xl bg-card border border-border/40 shadow-card"
              >
                <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk'" }}>Send a message</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-muted-foreground">Name</label>
                      <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Your name" className="h-12 rounded-xl" required />
                      {errors.name && <p className="text-xs text-destructive mt-1">{errors.name}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-muted-foreground">Email</label>
                      <Input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="your@email.com" className="h-12 rounded-xl" required />
                      {errors.email && <p className="text-xs text-destructive mt-1">{errors.email}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Subject</label>
                    <Input value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="How can we help?" className="h-12 rounded-xl" required />
                    {errors.subject && <p className="text-xs text-destructive mt-1">{errors.subject}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-muted-foreground">Message</label>
                    <Textarea value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Tell us more..." rows={5} className="rounded-xl" required />
                    {errors.message && <p className="text-xs text-destructive mt-1">{errors.message}</p>}
                  </div>
                  <Button type="submit" size="lg" className="w-full h-13 rounded-xl gradient-primary shadow-glow hover:shadow-glow-lg transition-all active-press" disabled={isSubmitting}>
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </motion.div>

              {/* Info */}
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                className="lg:col-span-2 space-y-4"
              >
                {contactInfo.map((c, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i} className="p-5 rounded-2xl bg-card border border-border/40 shadow-card hover-border-glow transition-all">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-1">{c.title}</p>
                    <p className="font-semibold">{c.email}</p>
                  </motion.div>
                ))}
                <motion.div variants={fadeUp} custom={4} className="p-5 rounded-2xl bg-card border border-border/40 shadow-card">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium mb-3">Response Times</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">General</span><span className="font-medium">24 hours</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Technical</span><span className="font-medium">4 hours</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Security</span><span className="font-medium text-primary">1 hour</span></div>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Help Center */}
        <section className="py-24 relative">
          <div className="absolute inset-0 bg-card/30" />
          <div className="section-container relative">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-14">
                <span className="section-badge">Help Center</span>
                <h2 className="mt-4 text-3xl md:text-4xl font-bold tracking-tight" style={{ fontFamily: "'Space Grotesk'" }}>
                  Quick <span className="text-gradient">answers.</span>
                </h2>
                <p className="mt-3 text-muted-foreground">Find solutions to common questions</p>
              </div>
              <motion.div
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-5"
              >
                {helpTopics.map((t, i) => (
                  <motion.div key={i} variants={fadeUp} custom={i} className="p-6 rounded-2xl bg-card border border-border/40 shadow-card hover-border-glow hover-scale-subtle transition-all cursor-pointer">
                    <h3 className="font-bold mb-2" style={{ fontFamily: "'Space Grotesk'" }}>{t.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{t.desc}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PageTransition>
  );
};

export default Contact;
