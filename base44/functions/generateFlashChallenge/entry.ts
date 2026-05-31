import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a task generator for a location-based social challenge app. Generate 1 single flash challenge — something wild, funny, and completable in under 10 minutes. Return ONLY a JSON object with no markdown or code fences: { "prompt_text": string, "category": one of (creative, social, exploration, fitness, wildcard) }`,
      response_json_schema: {
        type: 'object',
        properties: {
          prompt_text: { type: 'string' },
          category: { type: 'string' },
        },
      },
    });

    const CATEGORY_MAP = {
      creative: 'art', social: 'social', exploration: 'exploration',
      fitness: 'fitness', wildcard: 'nature',
    };

    const category = CATEGORY_MAP[(result?.category || 'wildcard').toLowerCase()] || 'nature';
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now

    await base44.asServiceRole.entities.Task.create({
      prompt_text: result?.prompt_text || 'Do something spontaneous and photograph it!',
      category,
      difficulty: 'flash',
      point_value: 15,
      source: 'AI Generated',
      expires_at: expiresAt,
    });

    return Response.json({ success: true, expires_at: expiresAt });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});