import { useState, useEffect, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Trophy, MapPin } from 'lucide-react';
import RadiusSlider from '@/components/dashboard/RadiusSlider';
import CityDomination from '@/components/legends/CityDomination';
import LeaderboardRow from '@/components/legends/LeaderboardRow';

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 3958.8;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export default function Legends() {
  const [currentUser, setCurrentUser] = useState(null);
  const [radius, setRadius] = useState(20);
  const [userCoords, setUserCoords] = useState(null);
  const [geoStatus, setGeoStatus] = useState('loading');

  useEffect(() => {
    base44.auth.me().then(setCurrentUser).catch(() => {});
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGeoStatus('granted');
        },
        () => setGeoStatus('denied'),
        { timeout: 10000 }
      );
    } else {
      setGeoStatus('denied');
    }
  }, []);

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['legends-users'],
    queryFn: () => base44.entities.User.list('-total_points', 200),
  });

  // Filter by radius
  const nearbyUsers = useMemo(() => {
    if (!userCoords) return allUsers;
    return allUsers.filter((u) => {
      if (u.latitude == null || u.longitude == null) return true;
      const dist = haversineDistance(userCoords.lat, userCoords.lng, u.latitude, u.longitude);
      return dist <= radius;
    });
  }, [allUsers, userCoords, radius]);

  // Sort by total_points descending
  const rankedUsers = useMemo(
    () => [...nearbyUsers].sort((a, b) => (b.total_points || 0) - (a.total_points || 0)),
    [nearbyUsers]
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-accent px-6 pt-12 pb-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10 max-w-lg mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-primary-foreground/80" />
            <span className="text-primary-foreground/80 text-sm font-medium">Legends</span>
          </div>
          <h1 className="font-heading text-3xl font-bold text-primary-foreground">Local Hall of Fame</h1>
          <p className="text-primary-foreground/70 mt-2 text-sm">
            {geoStatus === 'granted'
              ? `Top players within ${radius} miles of you`
              : 'Top players in your community'}
          </p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 pb-8">
        {/* Radius Slider */}
        <div className="mb-5">
          <RadiusSlider radius={radius} onChange={setRadius} />
          {geoStatus === 'denied' && (
            <p className="text-[11px] text-muted-foreground flex items-center gap-1 mt-1.5">
              <MapPin className="w-3 h-3" /> Location blocked — showing all nearby players
            </p>
          )}
        </div>

        {/* City Domination */}
        {rankedUsers.length > 0 && (
          <CityDomination
            users={rankedUsers}
            userFaction={currentUser?.faction}
          />
        )}

        {/* Leaderboard */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-heading font-bold text-base">Rankings</h2>
          <span className="text-xs text-muted-foreground">{rankedUsers.length} players</span>
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : rankedUsers.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Trophy className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No legends nearby yet</p>
            <p className="text-xs mt-1">Try increasing the radius slider</p>
          </div>
        ) : (
          <div className="space-y-2">
            {rankedUsers.map((user, i) => (
              <LeaderboardRow
                key={user.id}
                user={user}
                rank={i + 1}
                isCurrentUser={currentUser?.id === user.id}
                index={i}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}