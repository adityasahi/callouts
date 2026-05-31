/**
 * webhookDispatch — called by entity automation handlers.
 * Payload: { event_key, event_label, data }
 * Finds all active WebhookConfigs subscribed to event_key and POSTs to each URL.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // This function is called internally from other backend functions,
    // so we use service role to read configs.
    const { event_key, event_label, data } = await req.json();

    if (!event_key) {
      return Response.json({ error: 'Missing event_key' }, { status: 400 });
    }

    const allConfigs = await base44.asServiceRole.entities.WebhookConfig.filter({ is_active: true });
    const matching = allConfigs.filter(
      (cfg) => Array.isArray(cfg.events) && cfg.events.includes(event_key)
    );

    if (matching.length === 0) {
      return Response.json({ ok: true, dispatched: 0 });
    }

    const payload = {
      event: event_key,
      event_label: event_label || event_key,
      timestamp: new Date().toISOString(),
      data: data || {},
    };

    const results = await Promise.allSettled(
      matching.map(async (cfg) => {
        const res = await fetch(cfg.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        // Update last_triggered_at regardless of remote status
        await base44.asServiceRole.entities.WebhookConfig.update(cfg.id, {
          last_triggered_at: new Date().toISOString(),
        });

        return { url: cfg.url, status: res.status };
      })
    );

    const dispatched = results.filter((r) => r.status === 'fulfilled').length;
    return Response.json({ ok: true, dispatched, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});