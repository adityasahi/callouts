import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { MapPin, Flame, ArrowRight, Trophy, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import TaskCard from '@/components/challenges/TaskCard';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks-featured'],
    queryFn: () => base44.entities.Task.list('-created_date', 6),
  });

  const { data: topUsers = [] } = useQuery({
    queryKey: ['top-users'],
    queryFn: () => base44.entities.User.list('-total_points', 5),
  });

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent px-6 pt-12 pb-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 max-w-lg mx-auto"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-primary-foreground/80" />
            <span className="text-primary-foreground/80 text-sm font-medium">Location Challenges</span>
          </div>
          <h1 className="font-heading text-3xl md:text-4xl font-bold text-primary-foreground leading-tight">
            Explore. Challenge.{' '}
            <span className="text-primary-foreground/80">Conquer.</span>
          </h1>
          <p className="text-primary-foreground/70 mt-3 text-sm leading-relaxed max-w-sm">
            Complete real-world challenges, snap proof, earn points, and climb the leaderboard.
          </p>
          <Link to="/challenges">
            <Button className="mt-6 bg-white text-primary hover:bg-white/90 font-heading font-semibold rounded-full px-6">
              <Flame className="w-4 h-4 mr-2" />
              Start a Challenge
            </Button>
          </Link>
        </motion.div>
      </div>

      <div className="max-w-lg mx-auto px-4">
        {/* Quick Stats */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3 -mt-6 relative z-10 mb-8"
          >
            <div className="flex-1 bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-heading font-bold">{user.total_points || 0}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-lg font-heading font-bold">{tasks.length}</p>
                  <p className="text-xs text-muted-foreground">Challenges</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Featured Challenges */}
        <div className={!user ? 'mt-6' : ''}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-lg">Latest Challenges</h2>
            <Link to="/challenges" className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {tasks.map((task, i) => (
              <TaskCard key={task.id} task={task} index={i} />
            ))}
          </div>
          {tasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="text-sm">No challenges yet. Check back soon!</p>
            </div>
          )}
        </div>

        {/* Top Players */}
        {topUsers.length > 0 && (
          <div className="mt-8 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">Top Players</h2>
              <Link to="/leaderboard" className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
                Full Rankings <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="space-y-2">
              {topUsers.slice(0, 3).map((u, i) => (
                <div key={u.id} className="flex items-center gap-3 bg-card rounded-xl border border-border p-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-heading font-bold text-sm ${
                    i === 0 ? 'bg-amber-400/20 text-amber-600' :
                    i === 1 ? 'bg-slate-300/20 text-slate-500' :
                    'bg-orange-300/20 text-orange-500'
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{u.full_name || 'Anonymous'}</p>
                  </div>
                  <span className="font-heading font-bold text-sm text-primary">{u.total_points || 0} pts</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}