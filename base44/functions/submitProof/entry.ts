import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { image_url, task_id, caption } = await req.json();

    if (!image_url || !task_id) {
      return Response.json({ error: 'Missing required fields: image_url, task_id' }, { status: 400 });
    }

    // Fetch the task server-side to validate expiry
    const task = await base44.asServiceRole.entities.Task.get(task_id);

    if (!task) {
      return Response.json({ error: 'Task not found' }, { status: 404 });
    }

    // Enforce flash task expiration server-side
    if (task.expires_at) {
      const expiresAt = new Date(task.expires_at);
      if (Date.now() > expiresAt.getTime()) {
        return Response.json({ error: 'This Flash challenge has expired!' }, { status: 410 });
      }
    }

    // Rate limit check
    const existing = await base44.entities.Submission.filter({ user_id: user.id }, '-created_date', 10);
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentCount = existing.filter(s => new Date(s.created_date) > oneHourAgo).length;
    if (recentCount >= 5) {
      return Response.json({ error: 'Submission limit reached. Try again later.', allowed: false }, { status: 429 });
    }

    const submission = await base44.entities.Submission.create({
      image_url,
      task_id,
      user_id: user.id,
      user_name: user.full_name || 'Anonymous',
      community_votes: 0,
      voters: [],
      caption: caption || '',
    });

    return Response.json({ ok: true, submission });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});