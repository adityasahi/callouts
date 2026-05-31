import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MessageSquare, Twitter, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    await base44.integrations.Core.SendEmail({
      to: 'hello@callouts.app',
      subject: `Contact form: ${form.name}`,
      body: `From: ${form.name} <${form.email}>\n\n${form.message}`,
    });
    setLoading(false);
    setSent(true);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-7 h-7 text-primary" />
          </div>
          <h1 className="font-heading text-3xl font-bold mb-2">Contact Us</h1>
          <p className="text-muted-foreground text-sm">Have a question, idea, or issue? We'd love to hear from you.</p>
        </div>

        {/* Direct email */}
        <a
          href="mailto:hello@callouts.app"
          className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 mb-6 hover:border-primary/40 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Mail className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-sm">Email us directly</p>
            <p className="text-muted-foreground text-xs">hello@callouts.app</p>
          </div>
        </a>

        {/* Social */}
        <a
          href="https://twitter.com/calloutsapp"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 bg-card border border-border rounded-xl p-4 mb-8 hover:border-primary/40 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-sky-500/10 flex items-center justify-center shrink-0">
            <Twitter className="w-4 h-4 text-sky-500" />
          </div>
          <div>
            <p className="font-semibold text-sm">Follow on X / Twitter</p>
            <p className="text-muted-foreground text-xs">@calloutsapp</p>
          </div>
        </a>

        {/* Contact form */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="font-heading font-bold text-lg mb-4">Send a Message</h2>
          {sent ? (
            <div className="flex flex-col items-center py-8 text-center">
              <CheckCircle className="w-10 h-10 text-emerald-500 mb-3" />
              <p className="font-semibold text-sm">Message sent!</p>
              <p className="text-muted-foreground text-xs mt-1">We'll get back to you as soon as we can.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium mb-1 block">Your Name</label>
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="Jane Doe"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Email Address</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="jane@example.com"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block">Message</label>
                <textarea
                  required
                  rows={4}
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  placeholder="Tell us what's on your mind…"
                  className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                <Send className="w-4 h-4 mr-2" />
                {loading ? 'Sending…' : 'Send Message'}
              </Button>
            </form>
          )}
        </div>

      </motion.div>
    </div>
  );
}