import { useEffect, useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';

function formatMessage(item) {
  switch (item.type) {
    case 'upvote':
      return (
        <span>
          <span className="font-semibold">{item.actor_alter_ego || 'Someone'}</span>
          {' upvoted your submission'}
          {item.task_prompt_text ? (
            <span className="text-muted-foreground"> on "{item.task_prompt_text}"</span>
          ) : null}
        </span>
      );
    case 'comment':
      return (
        <span>
          <span className="font-semibold">{item.actor_alter_ego || 'Someone'}</span>
          {' commented on your submission'}
          {item.task_prompt_text ? (
            <span className="text-muted-foreground"> on "{item.task_prompt_text}"</span>
          ) : null}
        </span>
      );
    case 'approved':
      return (
        <span>
          {'Your submission was approved! You earned '}
          <span className="font-semibold text-primary">{item.points_earned || 0} points</span>
          {' 🎉'}
        </span>
      );
    case 'streak':
      return (
        <span>
          {"You're on a "}
          <span className="font-semibold text-orange-500">{item.streak_days || 0} day streak!</span>
          {' 🔥'}
        </span>
      );
    default:
      return <span>New activity</span>;
  }
}

const TYPE_ICON = {
  upvote:   { emoji: '👍', bg: 'bg-sky-100',     border: 'border-sky-200'    },
  comment:  { emoji: '💬', bg: 'bg-violet-100',  border: 'border-violet-200' },
  approved: { emoji: '✅', bg: 'bg-emerald-100', border: 'border-emerald-200'},
  streak:   { emoji: '🔥', bg: 'bg-orange-100',  border: 'border-orange-200' },
};

export default function Activity() {
  const [user, setUser] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ['activities', user?.id],
    queryFn: () =>
      base44.entities.Activity.filter(
        { receiving_user_id: user.id },
        '-created_date',
        100
      ),
    enabled: !!user,
  });

  const markRead = async (item) => {
    if (item.is_read) return;
    await base44.entities.Activity.update(item.id, { is_read: true });
    queryClient.invalidateQueries({ queryKey: ['activities', user?.id] });
    queryClient.invalidateQueries({ queryKey: ['unread-count', user?.id] });
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent px-6 pt-12 pb-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="w-5 h-5 text-primary-foreground/80" />
            <span className="text-primary-foreground/80 text-sm font-medium">Notifications</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-primary-foreground">Activity</h1>
          <p className="text-primary-foreground/70 mt-1 text-sm">Your latest interactions and milestones</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 pb-8">
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No activity yet</p>
            <p className="text-xs mt-1">Complete challenges to start earning notifications</p>
          </div>
        ) : (
          <AnimatePresence>
            <div className="space-y-2">
              {activities.map((item, i) => {
                const config = TYPE_ICON[item.type] || { emoji: '🔔', bg: 'bg-muted', border: 'border-border' };
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.03 }}
                    onClick={() => markRead(item)}
                    className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition-colors ${
                      item.is_read
                        ? 'bg-card border-border opacity-70'
                        : 'bg-card border-border shadow-sm ring-1 ring-primary/10'
                    }`}
                  >
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-lg shrink-0 ${config.bg} ${config.border}`}>
                      {config.emoji}
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <p className="text-sm leading-snug">{formatMessage(item)}</p>
                      <p className="text-[11px] text-muted-foreground mt-1">
                        {new Date(item.created_date).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                        })}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!item.is_read && (
                      <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}