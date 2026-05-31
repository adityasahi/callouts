import { motion } from 'framer-motion';
import { MapPin, Users, Zap, Trophy } from 'lucide-react';

export default function About() {
  return (
    <div className="max-w-lg mx-auto px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

        {/* Hero */}
        <div className="rounded-2xl bg-gradient-to-br from-primary via-primary to-accent p-8 mb-8 text-center">
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-7 h-7 text-white" />
          </div>
          <h1 className="font-heading text-3xl font-bold text-white mb-2">About Callouts</h1>
          <p className="text-white/80 text-sm leading-relaxed">
            The real-world challenge platform that turns your city into a playground.
          </p>
        </div>

        {/* What is Callouts */}
        <section className="mb-8">
          <h2 className="font-heading font-bold text-xl mb-3">What is Callouts?</h2>
          <p className="text-muted-foreground leading-relaxed text-sm mb-3">
            Callouts is a location-based challenge app that transforms everyday life into an adventure. 
            Each day you'll find real-world challenges near you — from photography missions and fitness dares 
            to food discoveries and cultural explorations. Complete a challenge, snap your proof, and submit 
            it for the community to judge.
          </p>
          <p className="text-muted-foreground leading-relaxed text-sm mb-3">
            Every approved submission earns you points, builds your daily streak, and climbs you up the 
            leaderboard. The community votes on the best submissions, creating a fair and exciting way to 
            showcase your creativity and effort.
          </p>
          <p className="text-muted-foreground leading-relaxed text-sm">
            You can also suggest new challenges, vote on ideas proposed by others, and watch your favorite 
            suggestions go live — making Callouts a truly community-driven experience.
          </p>
        </section>

        {/* Who it's for */}
        <section className="mb-8">
          <h2 className="font-heading font-bold text-xl mb-4">Who is it for?</h2>
          <div className="grid grid-cols-1 gap-3">
            {[
              { icon: Users, title: 'Explorers & Adventurers', desc: 'People who love discovering hidden gems in their city and beyond.' },
              { icon: Zap, title: 'Competitive Spirits', desc: 'Anyone who thrives on leaderboards, streaks, and earning the top spot.' },
              { icon: Trophy, title: 'Creative Minds', desc: 'Photographers, foodies, and creators looking for daily inspiration and community recognition.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex gap-3 bg-card border border-border rounded-xl p-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-0.5">{title}</p>
                  <p className="text-muted-foreground text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Who builds it */}
        <section className="mb-8 bg-card border border-border rounded-2xl p-6">
          <h2 className="font-heading font-bold text-xl mb-3">Who builds Callouts?</h2>
          <p className="text-muted-foreground leading-relaxed text-sm mb-3">
            Callouts is built by a small, passionate team that believes technology should get people 
            off their screens and into the world — not the other way around. We're obsessed with community, 
            creativity, and healthy competition.
          </p>
          <p className="text-muted-foreground leading-relaxed text-sm">
            We're constantly improving the app based on feedback from our players. Every feature, every 
            challenge category, and every design decision is made with our community in mind.
          </p>
        </section>

      </motion.div>
    </div>
  );
}