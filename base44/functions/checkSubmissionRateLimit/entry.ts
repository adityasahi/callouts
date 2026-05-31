import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const MAX_SUBMISSIONS_PER_HOUR = 5;

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();

    // Fetch this user's submissions in the last hour
    const recent = await base44.entities.Submission.filter(
      { user_id: user.id },
      '-created_date',
      MAX_SUBMISSIONS_PER_HOUR + 1
    );

    const recentInWindow = recent.filter(
      (s) => s.created_date && s.created_date > oneHourAgo
    );

    if (recentInWindow.length >= MAX_SUBMISSIONS_PER_HOUR) {
      return Response.json(
        {
          allowed: false,
          message: `You can only submit ${MAX_SUBMISSIONS_PER_HOUR} proofs per hour. Try again later!`,
          count: recentInWindow.length,
        },
        { status: 429 }
      );
    }

    return Response.json({
      allowed: true,
      count: recentInWindow.length,
      remaining: MAX_SUBMISSIONS_PER_HOUR - recentInWindow.length,
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});