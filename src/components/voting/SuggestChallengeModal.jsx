import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQueryClient } from '@tanstack/react-query';

const CATEGORIES = [
  { value: 'photography', label: '📸 Photography' },
  { value: 'fitness',     label: '💪 Fitness' },
  { value: 'exploration', label: '🧭 Exploration' },
  { value: 'food',        label: '🍕 Food' },
  { value: 'art',         label: '🎨 Art' },
  { value: 'social',      label: '👋 Social' },
  { value: 'nature',      label: '🌿 Nature' },
  { value: 'culture',     label: '🏛️ Culture' },
  { value: 'creative',    label: '✨ Creative' },
  { value: 'wildcard',    label: '🃏 Wildcard' },
];

export default function SuggestChallengeModal({ open, onClose, user }) {
  const [promptText, setPromptText] = useState('');
  const [category, setCategory] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!promptText.trim() || !category) return;
    setSubmitting(true);
    await base44.entities.PendingTask.create({
      prompt_text: promptText.trim(),
      category,
      submitted_by_id: user.id,
      submitted_by_name: user.alter_ego || user.full_name || 'Anonymous',
      upvotes: 0,
      voters: [],
      status: 'pending',
    });
    queryClient.invalidateQueries({ queryKey: ['pending-tasks'] });
    setSubmitting(false);
    setDone(true);
  };

  const handleClose = () => {
    setPromptText('');
    setCategory('');
    setDone(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">
            {done ? '🎉 Challenge Submitted!' : '+ Suggest a Challenge'}
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="text-center py-4 space-y-3">
            <p className="text-sm text-muted-foreground">
              Your challenge is now live in the Voting Booth. Get 15 upvotes and it becomes an official challenge!
            </p>
            <Button onClick={handleClose} className="w-full rounded-xl">
              Back to Feed
            </Button>
          </div>
        ) : (
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Challenge Prompt</Label>
              <Textarea
                placeholder="e.g. Find a stranger wearing a hat and compliment it loudly"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                className="rounded-xl resize-none h-24 text-sm"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Category</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="rounded-xl">
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!promptText.trim() || !category || submitting}
              className="w-full rounded-xl font-heading font-semibold"
            >
              {submitting ? 'Submitting…' : 'Submit to Voting Booth'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}