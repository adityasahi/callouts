import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Medal, Crown, Flame } from 'lucide-react';

const podiumColors = [
  'from-amber-400/20 to-amber-500/5 border-amber-400/30',
  'from-slate-300/20 to-slate-400/5 border-slate-300/30',
  'from-orange-400/20 to-orange-500/5 border-orange-400/30',
];

const podiumIcons = [Crown, Medal, Medal];

export default function Leaderboard() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => base44.entities.User.list('-total_points', 50),
  });

  const topThree = users.slice(0, 3);
  const rest = users.slice(3);

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Leaderboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Top challengers this season</p>
      </div>

      {/* Top 3 Podium */}
      {topThree.length > 0 && (
        <div className="flex items-end justify-center gap-3 mb-8 pt-4">
          {/* 2nd Place */}
          {topThree[1] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex-1 text-center"
            >
              <div className={`bg-gradient-to-b ${podiumColors[1]} border rounded-2xl p-4`}>
                <div className="w-12 h-12 rounded-full bg-slate-200 mx-auto flex items-center justify-center text-lg font-bold text-slate-600 mb-2">
                  {topThree[1].full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <p className="font-medium text-xs truncate">{topThree[1].full_name || 'Anonymous'}</p>
                <p className="font-heading font-bold text-sm text-slate-500 mt-1">{topThree[1].total_points || 0}</p>
                <span className="text-[10px] text-muted-foreground">points</span>
              </div>
              <div className="bg-slate-200 rounded-b-lg mx-4 h-16 flex items-center justify-center font-heading font-bold text-lg text-slate-500">2</div>
            </motion.div>
          )}

          {/* 1st Place */}
          {topThree[0] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 text-center"
            >
              <Crown className="w-6 h-6 text-amber-500 mx-auto mb-1" />
              <div className={`bg-gradient-to-b ${podiumColors[0]} border rounded-2xl p-4`}>
                <div className="w-14 h-14 rounded-full bg-amber-100 mx-auto flex items-center justify-center text-xl font-bold text-amber-600 mb-2">
                  {topThree[0].full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <p className="font-medium text-sm truncate">{topThree[0].full_name || 'Anonymous'}</p>
                <p className="font-heading font-bold text-lg text-amber-600 mt-1">{topThree[0].total_points || 0}</p>
                <span className="text-[10px] text-muted-foreground">points</span>
              </div>
              <div className="bg-amber-200 rounded-b-lg mx-4 h-20 flex items-center justify-center font-heading font-bold text-xl text-amber-600">1</div>
            </motion.div>
          )}

          {/* 3rd Place */}
          {topThree[2] && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="flex-1 text-center"
            >
              <div className={`bg-gradient-to-b ${podiumColors[2]} border rounded-2xl p-4`}>
                <div className="w-12 h-12 rounded-full bg-orange-100 mx-auto flex items-center justify-center text-lg font-bold text-orange-600 mb-2">
                  {topThree[2].full_name?.[0]?.toUpperCase() || '?'}
                </div>
                <p className="font-medium text-xs truncate">{topThree[2].full_name || 'Anonymous'}</p>
                <p className="font-heading font-bold text-sm text-orange-500 mt-1">{topThree[2].total_points || 0}</p>
                <span className="text-[10px] text-muted-foreground">points</span>
              </div>
              <div className="bg-orange-200 rounded-b-lg mx-4 h-12 flex items-center justify-center font-heading font-bold text-lg text-orange-500">3</div>
            </motion.div>
          )}
        </div>
      )}

      {/* Rest of Rankings */}
      <div className="space-y-2 mb-8">
        {rest.map((u, i) => (
          <motion.div
            key={u.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-center gap-3 bg-card rounded-xl border border-border p-3"
          >
            <span className="w-8 text-center font-heading font-bold text-sm text-muted-foreground">
              {i + 4}
            </span>
            <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-bold">
              {u.full_name?.[0]?.toUpperCase() || '?'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{u.full_name || 'Anonymous'}</p>
            </div>
            <div className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-primary" />
              <span className="font-heading font-bold text-sm">{u.total_points || 0}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {users.length === 0 && !isLoading && (
        <div className="text-center py-16 text-muted-foreground">
          <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No rankings yet</p>
        </div>
      )}
    </div>
  );
}