import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Flame } from 'lucide-react';
import PendingTaskCard from '@/components/voting/PendingTaskCard';

export default function VotingBooth() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: pendingTasks = [], isLoading } = useQuery({
    queryKey: ['pending-tasks'],
    queryFn: () => base44.entities.PendingTask.list('-upvotes', 100),
  });

  const active = pendingTasks.filter((t) => t.status !== 'promoted');
  const promoted = pendingTasks.filter((t) => t.status === 'promoted');

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-accent via-accent to-primary px-6 pt-12 pb-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🗳️</span>
            <span className="text-primary-foreground/80 text-sm font-medium">Voting Booth</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-primary-foreground">Community Picks</h1>
          <p className="text-primary-foreground/70 mt-2 text-sm">
            Vote for challenges you want to see go live. {' '}
            <span className="font-semibold text-primary-foreground">15 votes</span> = official challenge!
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 pb-8">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <>
            {/* Active Suggestions */}
            {active.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-3">
                  <Flame className="w-4 h-4 text-primary" />
                  <h2 className="font-heading font-bold text-base">Up for Vote</h2>
                  <span className="text-xs text-muted-foreground ml-auto">{active.length} suggestions</span>
                </div>
                <div className="space-y-3">
                  {active.map((task, i) => (
                    <PendingTaskCard key={task.id} task={task} user={user} index={i} />
                  ))}
                </div>
              </div>
            )}

            {/* Promoted */}
            {promoted.length > 0 && (
              <div>
                <h2 className="font-heading font-bold text-base mb-3">🎉 Gone Live</h2>
                <div className="space-y-3">
                  {promoted.map((task, i) => (
                    <PendingTaskCard key={task.id} task={task} user={user} index={i} />
                  ))}
                </div>
              </div>
            )}

            {pendingTasks.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <span className="text-4xl block mb-3">🗳️</span>
                <p className="text-sm font-medium">No suggestions yet</p>
                <p className="text-xs mt-1">Be the first — tap "+ Suggest a Challenge" on the home feed!</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}