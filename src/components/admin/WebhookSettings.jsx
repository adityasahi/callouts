import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Webhook, CheckCircle, Circle, ExternalLink, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { format } from 'date-fns';

const AVAILABLE_EVENTS = [
  { key: 'user.new_signup',       label: 'New User Signup',         desc: 'Fires when a new user makes their first submission' },
  { key: 'submission.approved',   label: 'Submission Approved',     desc: 'Fires when a submission status is set to active' },
  { key: 'pending_task.promoted', label: 'Pending Task Promoted',   desc: 'Fires when a community suggestion goes live' },
];

function EventMultiSelect({ selected, onChange }) {
  const toggle = (key) => {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  };
  return (
    <div className="space-y-2">
      {AVAILABLE_EVENTS.map((ev) => {
        const active = selected.includes(ev.key);
        return (
          <button
            key={ev.key}
            type="button"
            onClick={() => toggle(ev.key)}
            className={`w-full flex items-start gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors ${
              active ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted/40'
            }`}
          >
            {active
              ? <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              : <Circle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />}
            <div>
              <p className="text-sm font-medium">{ev.label}</p>
              <p className="text-xs text-muted-foreground">{ev.desc}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function AddWebhookForm({ onSaved }) {
  const [url, setUrl] = useState('');
  const [label, setLabel] = useState('');
  const [events, setEvents] = useState([]);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!url.trim()) { toast.error('URL is required'); return; }
    if (events.length === 0) { toast.error('Select at least one event'); return; }
    setSaving(true);
    await base44.entities.WebhookConfig.create({ url: url.trim(), label: label.trim() || url.trim(), events, is_active: true });
    toast.success('Webhook saved');
    setUrl(''); setLabel(''); setEvents([]);
    setSaving(false);
    onSaved();
  };

  return (
    <div className="border border-border rounded-xl p-4 space-y-4 bg-muted/20">
      <h3 className="font-heading font-semibold text-sm">New Webhook</h3>

      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Friendly Label (optional)</label>
          <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="e.g. Slack Alerts" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">URL Endpoint *</label>
          <Input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://hooks.example.com/…" />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Trigger Events *</label>
          <EventMultiSelect selected={events} onChange={setEvents} />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="w-full gap-2">
        <Plus className="w-4 h-4" />
        {saving ? 'Saving…' : 'Add Webhook'}
      </Button>
    </div>
  );
}

function WebhookCard({ config, onDelete }) {
  const [deleting, setDeleting] = useState(false);
  const queryClient = useQueryClient();

  const handleToggle = async () => {
    await base44.entities.WebhookConfig.update(config.id, { is_active: !config.is_active });
    queryClient.invalidateQueries({ queryKey: ['webhook-configs'] });
  };

  const handleDelete = async () => {
    setDeleting(true);
    await base44.entities.WebhookConfig.delete(config.id);
    toast.success('Webhook removed');
    onDelete();
  };

  const eventLabels = (config.events || []).map(
    (k) => AVAILABLE_EVENTS.find((e) => e.key === k)?.label || k
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      className="border border-border rounded-xl p-4 bg-card"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-2.5 min-w-0">
          <div className={`mt-0.5 w-2.5 h-2.5 rounded-full shrink-0 ${config.is_active ? 'bg-emerald-500' : 'bg-muted-foreground'}`} />
          <div className="min-w-0">
            <p className="font-medium text-sm truncate">{config.label || config.url}</p>
            <a
              href={config.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 mt-0.5 truncate"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="w-3 h-3 shrink-0" />
              <span className="truncate">{config.url}</span>
            </a>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleToggle}
            className={`text-xs px-2 py-1 rounded-md border font-medium transition-colors ${
              config.is_active
                ? 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'
                : 'border-border text-muted-foreground hover:bg-muted'
            }`}
          >
            {config.is_active ? 'Active' : 'Paused'}
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-1.5 text-muted-foreground hover:text-destructive transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        {eventLabels.map((lbl) => (
          <span key={lbl} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            {lbl}
          </span>
        ))}
      </div>

      {config.last_triggered_at && (
        <p className="mt-2 text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />
          Last fired: {format(new Date(config.last_triggered_at), 'MMM d, yyyy HH:mm')}
        </p>
      )}
    </motion.div>
  );
}

export default function WebhookSettings() {
  const [showForm, setShowForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['webhook-configs'],
    queryFn: () => base44.entities.WebhookConfig.list('-created_date'),
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ['webhook-configs'] });
    setShowForm(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading font-bold text-base">Webhooks</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Send real-time HTTP POST notifications to external services when events occur.
          </p>
        </div>
        <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setShowForm((v) => !v)}>
          <Plus className="w-3.5 h-3.5" />
          Add
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <AddWebhookForm onSaved={refresh} />
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => <div key={i} className="h-24 rounded-xl bg-muted animate-pulse" />)}
        </div>
      ) : configs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <Webhook className="w-8 h-8 mx-auto mb-3 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">No webhooks configured yet.</p>
          <p className="text-xs text-muted-foreground mt-1">Click "Add" to create your first webhook.</p>
        </div>
      ) : (
        <AnimatePresence>
          <div className="space-y-3">
            {configs.map((cfg) => (
              <WebhookCard key={cfg.id} config={cfg} onDelete={refresh} />
            ))}
          </div>
        </AnimatePresence>
      )}
    </div>
  );
}