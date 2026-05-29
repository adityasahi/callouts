import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Search, SlidersHorizontal } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import TaskCard from '@/components/challenges/TaskCard';

const categories = [
  { value: 'all', label: 'All', emoji: '🎯' },
  { value: 'photography', label: 'Photo', emoji: '📸' },
  { value: 'fitness', label: 'Fitness', emoji: '💪' },
  { value: 'exploration', label: 'Explore', emoji: '🧭' },
  { value: 'food', label: 'Food', emoji: '🍕' },
  { value: 'art', label: 'Art', emoji: '🎨' },
  { value: 'social', label: 'Social', emoji: '👋' },
  { value: 'nature', label: 'Nature', emoji: '🌿' },
  { value: 'culture', label: 'Culture', emoji: '🏛️' },
];

export default function Challenges() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks-all'],
    queryFn: () => base44.entities.Task.list('-created_date', 50),
  });

  const filtered = tasks.filter(t => {
    const matchSearch = !search || t.prompt_text?.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === 'all' || t.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-heading text-2xl font-bold">Challenges</h1>
        <p className="text-sm text-muted-foreground mt-1">Find your next adventure</p>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search challenges..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 rounded-xl bg-card border-border"
        />
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border ${
              activeCategory === cat.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-card text-foreground border-border hover:border-primary/30'
            }`}
          >
            <span>{cat.emoji}</span>
            {cat.label}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((task, i) => (
          <TaskCard key={task.id} task={task} index={i} />
        ))}
      </div>

      {!isLoading && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 text-muted-foreground"
        >
          <SlidersHorizontal className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No challenges found</p>
          <p className="text-xs mt-1">Try adjusting your filters</p>
        </motion.div>
      )}
    </div>
  );
}