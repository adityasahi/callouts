import { motion } from 'framer-motion';

const RANK_STYLES = {
  1: { bg: 'bg-amber-50 border-amber-300',   rank: 'text-amber-600 bg-amber-200',   label: '1st' },
  2: { bg: 'bg-slate-50 border-slate-300',   rank: 'text-slate-600 bg-slate-200',   label: '2nd' },
  3: { bg: 'bg-orange-50 border-orange-300', rank: 'text-orange-600 bg-orange-200', label: '3rd' },
};

const AVATAR_COLORS = {
  red:     'bg-red-100 text-red-700 border-red-300',
  orange:  'bg-orange-100 text-orange-700 border-orange-300',
  amber:   'bg-amber-100 text-amber-700 border-amber-300',
  emerald: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  teal:    'bg-teal-100 text-teal-700 border-teal-300',
  sky:     'bg-sky-100 text-sky-700 border-sky-300',
  violet:  'bg-violet-100 text-violet-700 border-violet-300',
  pink:    'bg-pink-100 text-pink-700 border-pink-300',
};

const FACTION_COLORS = {
  Northside: 'text-sky-600',
  Southside: 'text-orange-600',
  Eastside:  'text-violet-600',
  Westside:  'text-emerald-600',
};

export default function LeaderboardRow({ user, rank, isCurrentUser, index }) {
  const rankStyle = RANK_STYLES[rank];
  const avatarColor = AVATAR_COLORS[user.avatar_color] || AVATAR_COLORS.sky;
  const initials = (user.alter_ego || user.full_name || '?').slice(0, 2).toUpperCase();

  const baseClass = isCurrentUser
    ? 'bg-primary/5 border-primary/40 ring-1 ring-primary/30'
    : rankStyle
    ? rankStyle.bg
    : 'bg-card border-border';

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
      className={`flex items-center gap-3 border rounded-xl p-3 ${baseClass}`}
    >
      {/* Rank badge */}
      <div className={`w-9 h-9 rounded-lg flex items-center justify-center font-heading font-bold text-xs shrink-0 ${
        rankStyle ? rankStyle.rank : 'bg-muted text-muted-foreground'
      }`}>
        {rankStyle ? rankStyle.label : `#${rank}`}
      </div>

      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center font-heading font-bold text-sm shrink-0 ${avatarColor}`}>
        {initials}
      </div>

      {/* Name + Faction */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-heading font-semibold text-sm truncate">
            {user.alter_ego || user.full_name || 'Anonymous'}
          </p>
          {isCurrentUser && (
            <span className="text-[9px] font-bold bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full shrink-0">YOU</span>
          )}
        </div>
        {user.faction && (
          <p className={`text-[10px] font-medium ${FACTION_COLORS[user.faction] || 'text-muted-foreground'}`}>
            {user.faction}
          </p>
        )}
      </div>

      {/* Streak */}
      <div className="flex items-center gap-0.5 shrink-0">
        <span className="text-sm">🔥</span>
        <span className="font-heading font-bold text-xs text-muted-foreground">{user.current_streak || 0}</span>
      </div>

      {/* Score */}
      <div className="text-right shrink-0">
        <p className="font-heading font-bold text-sm text-primary">{(user.total_points || 0).toLocaleString()}</p>
        <p className="text-[9px] text-muted-foreground">pts</p>
      </div>
    </motion.div>
  );
}