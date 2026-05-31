import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const body = await req.json();

    const submission = body.data;
    const submissionId = body.event?.entity_id;

    if (!submissionId || !submission) {
      return Response.json({ skipped: true, reason: 'no data' });
    }

    const votes = submission.community_votes ?? 0;

    // Already buried — nothing to do
    if (submission.status === 'buried') {
      return Response.json({ skipped: true, reason: 'already buried' });
    }

    if (votes <= -5) {
      await base44.asServiceRole.entities.Submission.update(submissionId, { status: 'buried' });
      return Response.json({ action: 'buried', submissionId });
    }

    return Response.json({ action: 'none', votes });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});