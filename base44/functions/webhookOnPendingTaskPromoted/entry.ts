/**
 * Entity automation handler: PendingTask updated → status changed to "promoted"
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { data, old_data, event } = body;

    if (
      event?.type !== 'update' ||
      data?.status !== 'promoted' ||
      old_data?.status === 'promoted'
    ) {
      return Response.json({ ok: true, skipped: true });
    }

    await base44.asServiceRole.functions.invoke('webhookDispatch', {
      event_key: 'pending_task.promoted',
      event_label: 'Pending Task Promoted',
      data: {
        pending_task_id: data.id,
        prompt_text: data.prompt_text,
        category: data.category,
        submitted_by_id: data.submitted_by_id,
        submitted_by_name: data.submitted_by_name,
        upvotes: data.upvotes,
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});