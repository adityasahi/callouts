import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CATEGORY_MAP = {
  creative: 'art',
  social: 'social',
  exploration: 'exploration',
  fitness: 'fitness',
  wildcard: 'nature',
};

const DIFFICULTY_POINTS = { easy: 10, medium: 25, hard: 50 };

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const result = await base44.asServiceRole.integrations.Core.InvokeLLM({
      prompt: `You are a task generator for a location-based social challenge app. Generate 5 distinct, fun, and quirky real-world challenges for people in a local community. Each challenge must have: a Prompt Text (funny, specific, doable in under 15 minutes), a Category (creative, social, exploration, fitness, or wildcard), a Difficulty Level (easy = 10 points, medium = 25 points, hard = 50 points). Return ONLY a raw JSON array with no markdown, no code fences. Each item: { "prompt_text": string, "category": string, "difficulty": string }`,
      response_json_schema: {
        type: 'object',
        properties: {
          challenges: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                prompt_text: { type: 'string' },
                category: { type: 'string' },
                difficulty: { type: 'string' },
              },
            },
          },
        },
      },
    });

    const challenges = result?.challenges || [];

    const records = challenges.map((c) => {
      const difficulty = (c.difficulty || 'medium').toLowerCase();
      const category = CATEGORY_MAP[(c.category || 'wildcard').toLowerCase()] || 'nature';
      return {
        prompt_text: c.prompt_text,
        category,
        difficulty: ['easy', 'medium', 'hard'].includes(difficulty) ? difficulty : 'medium',
        point_value: DIFFICULTY_POINTS[difficulty] || 25,
        source: 'AI Generated',
      };
    });

    for (const record of records) {
      await base44.asServiceRole.entities.Task.create(record);
    }

    return Response.json({ success: true, inserted: records.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});