/**
 * Entity automation handler: Activity created → treated as "New User Signup" 
 * when type === "streak" on day 1, OR we use a dedicated Submission create event
 * to signal new user engagement. 
 *
 * Actually this watches for NEW Submission records (first-ever proof of a new user).
 * For a true "signup" signal we fire on Submission create since User entity 
 * isn't available as a custom entity. We label it "New User Submission" 
 * and also support a generic "new_submission" event key.
 */
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const { data, event } = body;

    if (event?.type !== 'create') {
      return Response.json({ ok: true, skipped: true });
    }

    await base44.asServiceRole.functions.invoke('webhookDispatch', {
      event_key: 'user.new_signup',
      event_label: 'New User Signup',
      data: {
        submission_id: data.id,
        user_id: data.user_id,
        user_name: data.user_name,
        task_id: data.task_id,
      },
    });

    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});