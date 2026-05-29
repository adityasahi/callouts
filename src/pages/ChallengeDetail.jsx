import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MapPin, Zap, Camera, Heart, MessageCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

const difficultyConfig = {
  easy: { label: 'Easy', class: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' },
  medium: { label: 'Medium', class: 'bg-amber-500/10 text-amber-600 border-amber-500/20' },
  hard: { label: 'Hard', class: 'bg-red-500/10 text-red-600 border-red-500/20' },
  extreme: { label: 'Extreme', class: 'bg-purple-500/10 text-purple-600 border-purple-500/20' },
};

export default function ChallengeDetail() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [user, setUser] = useState(null);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [caption, setCaption] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: task } = useQuery({
    queryKey: ['task', id],
    queryFn: async () => {
      const tasks = await base44.entities.Task.filter({ id });
      return tasks[0];
    },
  });

  const { data: submissions = [] } = useQuery({
    queryKey: ['submissions', id],
    queryFn: () => base44.entities.Submission.filter({ task_id: id }, '-community_votes'),
  });

  const voteMutation = useMutation({
    mutationFn: async (submission) => {
      const voters = submission.voters || [];
      if (voters.includes(user?.id)) {
        toast.error("You've already voted!");
        return;
      }
      await base44.entities.Submission.update(submission.id, {
        community_votes: (submission.community_votes || 0) + 1,
        voters: [...voters, user.id],
      });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['submissions', id] }),
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.entities.Submission.create({
      image_url: file_url,
      task_id: id,
      user_id: user.id,
      user_name: user.full_name || 'Anonymous',
      community_votes: 0,
      voters: [],
      caption,
    });
    // Award points
    const currentPoints = user.total_points || 0;
    await base44.auth.updateMe({ total_points: currentPoints + (task?.point_value || 0) });
    setUploading(false);
    setCaption('');
    setSubmitOpen(false);
    queryClient.invalidateQueries({ queryKey: ['submissions', id] });
    toast.success(`Challenge submitted! +${task?.point_value || 0} points`);
  };

  if (!task) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  const diff = difficultyConfig[task.difficulty] || difficultyConfig.medium;

  return (
    <div className="max-w-lg mx-auto">
      {/* Header Image */}
      <div className="relative">
        {task.image_url ? (
          <div className="h-56 overflow-hidden">
            <img src={task.image_url} alt="" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          </div>
        ) : (
          <div className="h-44 bg-gradient-to-br from-primary/20 to-accent/20" />
        )}
        <Link to="/challenges" className="absolute top-4 left-4 w-9 h-9 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center">
          <ArrowLeft className="w-5 h-5 text-white" />
        </Link>
      </div>

      <div className="px-4 -mt-6 relative z-10">
        {/* Info Card */}
        <div className="bg-card rounded-2xl border border-border p-5 shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge className={`${diff.class} border text-xs`}>{diff.label}</Badge>
                <Badge variant="outline" className="text-xs capitalize">{task.category}</Badge>
              </div>
              <h1 className="font-heading font-bold text-lg leading-snug">{task.prompt_text}</h1>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-center gap-1 text-primary font-heading font-bold text-xl">
                <Zap className="w-5 h-5" />
                {task.point_value}
              </div>
              <span className="text-xs text-muted-foreground">points</span>
            </div>
          </div>

          {task.location_name && (
            <div className="flex items-center gap-1.5 mt-3 text-muted-foreground">
              <MapPin className="w-3.5 h-3.5" />
              <span className="text-xs">{task.location_name}</span>
            </div>
          )}

          {/* Submit Button */}
          <Dialog open={submitOpen} onOpenChange={setSubmitOpen}>
            <DialogTrigger asChild>
              <Button className="w-full mt-4 rounded-xl font-heading font-semibold">
                <Camera className="w-4 h-4 mr-2" />
                Submit Proof
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-sm mx-auto">
              <DialogHeader>
                <DialogTitle className="font-heading">Submit Your Proof</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <Textarea
                  placeholder="Add a caption (optional)..."
                  value={caption}
                  onChange={e => setCaption(e.target.value)}
                  className="rounded-xl"
                />
                <label className="block">
                  <div className={`flex flex-col items-center justify-center gap-2 p-8 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${
                    uploading ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
                  }`}>
                    {uploading ? (
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Upload your photo</span>
                      </>
                    )}
                  </div>
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                </label>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Submissions */}
        <div className="mt-6 mb-8">
          <h2 className="font-heading font-bold text-base mb-3">
            Community Submissions ({submissions.length})
          </h2>
          <div className="space-y-4">
            {submissions.map((sub, i) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="bg-card rounded-xl border border-border overflow-hidden"
              >
                {sub.image_url && (
                  <img src={sub.image_url} alt="" className="w-full h-52 object-cover" />
                )}
                <div className="p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{sub.user_name || 'Anonymous'}</span>
                    <button
                      onClick={() => voteMutation.mutate(sub)}
                      className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Heart className={`w-4 h-4 ${sub.voters?.includes(user?.id) ? 'fill-primary text-primary' : ''}`} />
                      {sub.community_votes || 0}
                    </button>
                  </div>
                  {sub.caption && (
                    <p className="text-xs text-muted-foreground mt-1">{sub.caption}</p>
                  )}
                </div>
              </motion.div>
            ))}
            {submissions.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <Camera className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No submissions yet. Be the first!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}