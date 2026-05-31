import { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, MapPin, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/challenges', icon: MapPin, label: 'Explore' },
  { path: '/voting-booth', emoji: '🗳️', label: 'Vote' },
  { path: '/activity', emoji: '🔔', label: 'Activity', showBadge: true },
  { path: '/legends', emoji: '🏆', label: 'Legends' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export default function AppLayout() {
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ['unread-count', user?.id],
    queryFn: async () => {
      const items = await base44.entities.Activity.filter(
        { receiving_user_id: user.id, is_read: false },
        '-created_date',
        100
      );
      return items.length;
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  return (
    <div className="min-h-screen bg-background font-body">
      <main className="pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-xl border-t border-border">
        <div className="max-w-lg mx-auto flex items-center justify-around py-2 px-4">
          {navItems.map((item) => {
            const { path, label } = item;
            const isActive = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className="relative flex flex-col items-center gap-0.5 py-1 px-3"
              >
                {isActive && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute -top-2 w-8 h-1 rounded-full bg-primary"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div className="relative">
                  {item.emoji ? (
                    <span className={`text-xl leading-none transition-opacity ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                      {item.emoji}
                    </span>
                  ) : (
                    <item.icon
                      className={`w-5 h-5 transition-colors ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    />
                  )}
                  {item.showBadge && unreadCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center leading-none">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}