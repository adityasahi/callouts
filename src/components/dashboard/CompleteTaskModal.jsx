import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Loader2, CheckCircle, Zap, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';

export default function CompleteTaskModal({ task, user, open, onClose, onSuccess }) {
  const [caption, setCaption] = useState('');
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [done, setDone] = useState(false);

  const handleFileChange = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSubmit = async () => {
    if (!file) { toast.error('Please select a photo first'); return; }
    setUploading(true);

    const { file_url } = await base44.integrations.Core.UploadFile({ file });

    const res = await base44.functions.invoke('submitProof', {
      image_url: file_url,
      task_id: task.id,
      caption,
    });

    if (!res.data?.ok) {
      toast.error(res.data?.error || 'Failed to submit. Try again.');
      setUploading(false);
      return;
    }

    const newPoints = (user.total_points || 0) + (task.point_value || 0);
    await base44.auth.updateMe({ total_points: newPoints });
    setUploading(false);
    setDone(true);
    onSuccess?.();
    setTimeout(() => {
      setDone(false);
      setFile(null);
      setPreview(null);
      setCaption('');
      onClose();
    }, 1800);
  };

  const handleClose = () => {
    if (uploading) return;
    setFile(null);
    setPreview(null);
    setCaption('');
    setDone(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm mx-4 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-heading text-base leading-snug pr-4">
            {done ? '🎉 Submitted!' : task?.prompt_text}
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-emerald-500" />
            </div>
            <p className="text-sm text-muted-foreground text-center">
              Great work! You earned{' '}
              <span className="font-heading font-bold text-primary">+{task?.point_value} pts</span>
            </p>
          </div>
        ) : (
          <div className="space-y-4 mt-1">
            {/* Point value badge */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-primary bg-primary/8 rounded-lg px-3 py-1.5 w-fit">
              <Zap className="w-3.5 h-3.5" />
              Complete for {task?.point_value} points
            </div>

            {/* Photo upload */}
            <label className="block cursor-pointer">
              <div className={`relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors overflow-hidden ${
                preview ? 'border-primary/40' : 'border-border hover:border-primary/40'
              }`} style={{ minHeight: '11rem' }}>
                {preview ? (
                  <>
                    <img src={preview} alt="preview" className="w-full h-44 object-cover" />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-medium">Change photo</p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-2 py-8 px-4 text-muted-foreground">
                    <ImagePlus className="w-8 h-8 opacity-40" />
                    <span className="text-xs">Tap to upload your proof photo</span>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </label>

            {/* Caption */}
            <Textarea
              placeholder="Add a caption… (optional)"
              value={caption}
              onChange={e => setCaption(e.target.value)}
              className="rounded-xl text-sm resize-none h-20"
            />

            <Button
              className="w-full rounded-xl font-heading font-semibold"
              onClick={handleSubmit}
              disabled={!file || uploading}
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading…</>
              ) : (
                <><Upload className="w-4 h-4 mr-2" /> Submit Proof</>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}