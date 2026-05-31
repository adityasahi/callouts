import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Trophy, Sparkles, Plus } from 'lucide-react';
import EmptyFeedState from '@/components/dashboard/EmptyFeedState';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import RadiusSlider from '@/components/dashboard/RadiusSlider';
import GeoStatusBanner from '@/components/dashboard/GeoStatusBanner';
import TaskFeedItem from '@/components/dashboard/TaskFeedItem';
import SuggestChallengeModal from '@/components/voting/SuggestChallengeModal';
import GeoBlockedScreen from '@/components/dashboard/GeoBlockedScreen';

// Haversine formula — returns distance in miles between two lat/lng points
function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8; // Earth radius in miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [radius, setRadius] = useState(20);
  const [userCoords, setUserCoords] = useState(null); // { lat, lng }
  const [geoStatus, setGeoStatus] = useState('loading'); // loading | granted | denied

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const requestLocation = () => {
    setGeoStatus('loading');
    if (!navigator.geolocation) {
      setGeoStatus('denied');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setGeoStatus('granted');
      },
      () => setGeoStatus('denied'),
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    requestLocation();
  }, []);

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks-all'],
    queryFn: () => base44.entities.Task.list('-created_date', 100),
  });

  const { data: topUsers = [] } = useQuery({
    queryKey: ['top-users'],
    queryFn: () => base44.entities.User.list('-total_points', 3),
  });

  // Filter tasks by radius when coords are available; show all if no coords
  const filteredTasks = useMemo(() => {
    if (!userCoords) return tasks;
    return tasks.filter((task) => {
      if (task.latitude == null || task.longitude == null) return true; // no coords → always show
      const dist = haversineDistance(userCoords.lat, userCoords.lng, task.latitude, task.longitude);
      return dist <= radius;
    });
  }, [tasks, userCoords, radius]);

  const nearbyCount = filteredTasks.length;

  if (geoStatus === 'denied') {
    return <GeoBlockedScreen onRetry={requestLocation} />;
  }

  return (
    <div className="min-h-screen relative">
      {/* Hero Header */}
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
            Complete real-world challenges near you, snap proof, earn points, and climb the leaderboard.
          </p>
        </motion.div>
      </div>

      <div className="max-w-lg mx-auto px-4">
        {/* Quick Stats */}
        {user && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-3 -mt-6 relative z-10 mb-5"
          >
            <div className="flex-1 bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Trophy className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="text-lg font-heading font-bold">{user.total_points || 0}</p>
                  <p className="text-xs text-muted-foreground">My Points</p>
                </div>
              </div>
            </div>
            <div className="flex-1 bg-card rounded-xl border border-border p-4 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <div>
                  <p className="text-lg font-heading font-bold">{nearbyCount}</p>
                  <p className="text-xs text-muted-foreground">Nearby</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Geo Status */}
        <div className={user ? 'mb-4' : 'mt-6 mb-4'}>
          <GeoStatusBanner status={geoStatus} onRetry={requestLocation} />
        </div>

        {/* Radius Slider */}
        <div className="mb-6">
          <RadiusSlider radius={radius} onChange={setRadius} />
        </div>

        {/* Feed Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-heading font-bold text-lg">Nearby Challenges</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              {geoStatus === 'granted'
                ? `${nearbyCount} challenge${nearbyCount !== 1 ? 's' : ''} within ${radius} miles`
                : 'Showing all challenges'}
            </p>
          </div>
        </div>

        {/* Task Feed */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-muted animate-pulse h-52" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTasks.length > 0 ? (
              <div className="space-y-4">
                {filteredTasks.map((task, i) => (
                  <TaskFeedItem key={task.id} task={task} user={user} index={i} />
                ))}
              </div>
            ) : (
              <EmptyFeedState radius={radius} />
            )}
          </AnimatePresence>
        )}

      {/* FAB */}
      {user && (
        <motion.button
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.4, type: 'spring', stiffness: 300, damping: 20 }}
          onClick={() => setSuggestOpen(true)}
          className="fixed bottom-24 right-4 z-40 flex items-center gap-2 bg-primary text-primary-foreground font-heading font-semibold text-sm px-4 py-3 rounded-full shadow-lg shadow-primary/30 hover:bg-primary/90 active:scale-95 transition-transform"
        >
          <Plus className="w-4 h-4" />
          Suggest a Challenge
        </motion.button>
      )}

      <SuggestChallengeModal
        open={suggestOpen}
        onClose={() => setSuggestOpen(false)}
        user={user}
      />

        {/* Top Players */}
        {topUsers.length > 0 && (
          <div className="mt-10 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-heading font-bold text-lg">Top Players</h2>
              <Link to="/leaderboard" className="flex items-center gap-1 text-primary text-sm font-medium hover:underline">
                Full Rankings
              </Link>
            </div>
            <div className="space-y-2">
              {topUsers.map((u, i) => (
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