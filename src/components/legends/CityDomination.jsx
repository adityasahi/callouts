import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';

const FACTION_COLORS = {
  Northside: { bar: 'bg-sky-500',     text: 'text-sky-600',     light: 'bg-sky-50 border-sky-200'     },
  Southside: { bar: 'bg-orange-500',  text: 'text-orange-600',  light: 'bg-orange-50 border-orange-200'  },
  Eastside:  { bar: 'bg-violet-500',  text: 'text-violet-600',  light: 'bg-violet-50 border-violet-200'  },
  Westside:  { bar: 'bg-emerald-500', text: 'text-emerald-600', light: 'bg-emerald-50 border-emerald-200' },
};

const FACTIONS = ['Northside', 'Southside', 'Eastside', 'Westside'];

export default function CityDomination({ users, userFaction }) {
  const totals = FACTIONS.reduce((acc, f) => {
    acc[f] = users
      .filter((u) => u.faction === f)
      .reduce((sum, u) => sum + (u.total_points || 0), 0);
    return acc;
  }, {});

  const grandTotal = Object.values(totals).reduce((a, b) => a + b, 0) || 1;
  const sorted = [...FACTIONS].sort((a, b) => totals[b] - totals[a]);
  const leader = sorted[0];

  return (
    <div className="bg-card border border-border rounded-2xl p-4 mb-5 shadow-sm">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-sm">City Domination</h2>
          <p className="text-[10px] text-muted-foreground">
            <span className={`font-semibold ${FACTION_COLORS[leader]?.text}`}>{leader}</span> is winning the city
          </p>
        </div>
      </div>

      {/* Stacked progress bar */}
      <div className="h-5 rounded-full overflow-hidden flex w-full bg-muted mb-3">
        {sorted.map((faction) => {
          const pct = (totals[faction] / grandTotal) * 100;
          if (pct < 0.5) return null;
          const colors = FACTION_COLORS[faction];
          return (
            <motion.div
              key={faction}
              initial={{ width: 0 }}
              animate={{ width: `${pct}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className={`${colors.bar} h-full first:rounded-l-full last:rounded-r-full`}
              title={`${faction}: ${totals[faction]} pts`}
            />
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-2">
        {sorted.map((faction) => {
          const colors = FACTION_COLORS[faction];
          const pct = ((totals[faction] / grandTotal) * 100).toFixed(1);
          const isUser = faction === userFaction;
          return (
            <div
              key={faction}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg border text-xs ${colors.light} ${isUser ? 'ring-1 ring-primary/40' : ''}`}
            >
              <div className={`w-2 h-2 rounded-full ${colors.bar}`} />
              <span className={`font-semibold ${colors.text}`}>{faction}</span>
              <span className="text-muted-foreground">{pct}%</span>
              {isUser && <span className="text-[9px] font-bold text-primary ml-0.5">YOU</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}