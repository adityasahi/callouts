/**
 * Entity automation handler: Submission updated → status changed to "active"
 * (treated as "Submission Approved" event)
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { data, old_data, event } = body;

    // Only fire when status transitions TO "active" from something else
    if (
      event?.type !== 'update' ||
      data?.status !== 'active' ||
      old_data?.status === 'active'
    ) {
      return Response.json({ ok: true, skipped: true });
    }

    await base44.asServiceRole.functions.invoke('webhookDispatch', {
      event_key: 'submission.approved',
      event_label: 'Submission Approved',
      data: {
        submission_id: data.id,
        user_id: data.user_id,
        user_name: data.user_name,
        task_id: data.task_id,
        caption: data.caption,
        community_votes: data.community_votes,
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});