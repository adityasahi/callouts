import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000).toISOString();

    const conversation = await base44.asServiceRole.agents.createConversation({
      agent_name: 'TaskMaster',
      metadata: { trigger: 'flash-6h', date: now.toISOString() }
    });

    await base44.asServiceRole.agents.addMessage(conversation, {
      role: 'user',
      content: `Directive 2: Generate exactly 1 Flash challenge right now. Save it to the Tasks table with difficulty "flash", point_value 75, source "AI Generated", and expires_at set to exactly "${expiresAt}". Make it funny, urgent, and wildcard category.`
    });

    return Response.json({ success: true, conversation_id: conversation.id, expires_at: expiresAt });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});