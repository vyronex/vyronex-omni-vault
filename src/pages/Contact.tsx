import { useState } from "react";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent! We'll get back to you within 24 hours.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

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
              Get In <span className="text-gradient">Touch</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Have questions? We're here to help. Reach out to our team anytime.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20 bg-card/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_60%_40%,hsl(25_95%_53%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div className="p-8 rounded-lg glass-card shadow-elevated">
                <h2 className="text-2xl font-bold mb-6">Send a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">Name</label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Your name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Subject</label>
                    <Input
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      placeholder="How can we help?"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Message</label>
                    <Textarea
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us more..."
                      rows={5}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full shadow-glow hover-glow">
                    Send Message
                  </Button>
                </form>
              </div>

              {/* Contact Info */}
              <div className="space-y-8">
                <div>
                  <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                  <div className="space-y-4">
                    <div className="p-6 rounded-lg glass-card hover-lift">
                      <h3 className="font-bold mb-2">General Inquiries</h3>
                      <p className="text-muted-foreground">support@vyronexvnx.com</p>
                    </div>
                    <div className="p-6 rounded-lg glass-card hover-lift">
                      <h3 className="font-bold mb-2">Business Partnerships</h3>
                      <p className="text-muted-foreground">partnerships@vyronexvnx.com</p>
                    </div>
                    <div className="p-6 rounded-lg glass-card hover-lift">
                      <h3 className="font-bold mb-2">Technical Support</h3>
                      <p className="text-muted-foreground">tech@vyronexvnx.com</p>
                    </div>
                    <div className="p-6 rounded-lg glass-card hover-lift">
                      <h3 className="font-bold mb-2">Press & Media</h3>
                      <p className="text-muted-foreground">press@vyronexvnx.com</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-lg glass-card">
                  <h3 className="font-bold mb-4">Response Times</h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <p>General inquiries: Within 24 hours</p>
                    <p>Technical support: Within 4 hours</p>
                    <p>Urgent security issues: Within 1 hour</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help Center */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_60%,hsl(1_99%_48%/0.08),transparent_50%)]" />
        <div className="container mx-auto px-4 relative">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                <span className="text-gradient">Help</span> Center
              </h2>
              <p className="text-muted-foreground">Find quick answers to common questions</p>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { title: "Getting Started", desc: "Learn how to create an account and start trading", link: "#" },
                { title: "Security", desc: "Two-factor authentication, wallet security, and more", link: "#" },
                { title: "Trading Basics", desc: "Understanding orders, fees, and trading pairs", link: "#" },
                { title: "Deposits & Withdrawals", desc: "How to fund your account and withdraw assets", link: "#" },
                { title: "VNX Token", desc: "Learn about staking, rewards, and token utility", link: "#" },
                { title: "API Documentation", desc: "Integrate with our platform using our REST API", link: "#" },
              ].map((item, i) => (
                <div key={i} className="p-6 rounded-lg glass-card hover-lift">
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{item.desc}</p>
                  <span className="text-sm text-primary font-medium">Learn more</span>
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

export default Contact;
