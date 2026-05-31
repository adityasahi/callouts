import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { entity, ids, action, status } = await req.json();

    if (!entity || !ids || !Array.isArray(ids) || ids.length === 0) {
      return Response.json({ error: 'Missing required fields: entity, ids' }, { status: 400 });
    }

    if (!['Task', 'Submission'].includes(entity)) {
      return Response.json({ error: 'Invalid entity. Must be Task or Submission.' }, { status: 400 });
    }

    const entityClient = base44.asServiceRole.entities[entity];
    const results = { success: 0, failed: 0 };

    for (const id of ids) {
      if (action === 'delete') {
        await entityClient.delete(id);
      } else if (action === 'archive') {
        await entityClient.update(id, { status: 'archived' });
      } else if (action === 'update_status' && status) {
        await entityClient.update(id, { status });
      } else {
        return Response.json({ error: 'Invalid action or missing status for update_status' }, { status: 400 });
      }
      results.success++;
    }

    return Response.json({ ok: true, results });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});