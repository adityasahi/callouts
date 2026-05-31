import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Trophy, Image, LogOut, MapPin, Zap, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export default function Profile() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: submissions = [] } = useQuery({
    queryKey: ['my-submissions', user?.id],
    queryFn: () => base44.entities.Submission.filter({ user_id: user.id }, '-created_date'),
    enabled: !!user?.id,
  });

  const totalVotes = submissions.reduce((sum, s) => sum + (s.community_votes || 0), 0);

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-4 pt-6">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent mx-auto flex items-center justify-center text-2xl font-bold text-white">
          {user.full_name?.[0]?.toUpperCase() || '?'}
        </div>
        <h1 className="font-heading font-bold text-xl mt-3">{user.alter_ego || user.full_name || 'Anonymous'}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
        {user.faction && (
          <span className="inline-block mt-2 text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            📍 {user.faction}
          </span>
        )}
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-8">
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Trophy className="w-5 h-5 text-primary mx-auto mb-1" />
          <p className="font-heading font-bold text-lg">{user.total_points || 0}</p>
          <p className="text-[10px] text-muted-foreground">Points</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Image className="w-5 h-5 text-accent mx-auto mb-1" />
          <p className="font-heading font-bold text-lg">{submissions.length}</p>
          <p className="text-[10px] text-muted-foreground">Submissions</p>
        </div>
        <div className="bg-card rounded-xl border border-border p-4 text-center">
          <Zap className="w-5 h-5 text-amber-500 mx-auto mb-1" />
          <p className="font-heading font-bold text-lg">{totalVotes}</p>
          <p className="text-[10px] text-muted-foreground">Votes</p>
        </div>
      </div>

      {/* My Submissions */}
      <div className="mb-8">
        <h2 className="font-heading font-bold text-base mb-3">My Submissions</h2>
        {submissions.length > 0 ? (
          <div className="grid grid-cols-3 gap-1.5">
            {submissions.map((sub, i) => (
              <motion.div
                key={sub.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                className="relative aspect-square rounded-lg overflow-hidden group"
              >
                <img src={sub.image_url} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                  <span className="opacity-0 group-hover:opacity-100 text-white text-xs font-medium transition-opacity">
                    ❤️ {sub.community_votes || 0}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-muted-foreground bg-card rounded-xl border border-border">
            <Image className="w-8 h-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No submissions yet</p>
            <p className="text-xs mt-1">Complete a challenge to get started!</p>
          </div>
        )}
      </div>

      {/* Logout */}
      <Button
        variant="outline"
        className="w-full rounded-xl mb-3"
        onClick={() => base44.auth.logout()}
      >
        <LogOut className="w-4 h-4 mr-2" />
        Log Out
      </Button>

      {/* Delete Account */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" className="w-full rounded-xl mb-8 text-destructive hover:text-destructive hover:bg-destructive/10">
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Account
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete your account?</AlertDialogTitle>
            <AlertDialogDescription>
              This action is permanent. All your submissions, points, and activity will be lost and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                await base44.entities.User.delete(user.id);
                base44.auth.logout();
              }}
            >
              Yes, delete my account
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}