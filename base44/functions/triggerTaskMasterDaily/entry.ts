import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Create a new conversation with TaskMaster and send the daily directive
    const conversation = await base44.asServiceRole.agents.createConversation({
      agent_name: 'TaskMaster',
      metadata: { trigger: 'daily-midnight', date: new Date().toISOString() }
    });

    await base44.asServiceRole.agents.addMessage(conversation, {
      role: 'user',
      content: 'Directive 1: Generate 5 daily community challenges and save them to the Tasks table now. Set source to "AI Generated". Use a good mix of easy, medium, and hard difficulties across creative, social, exploration, fitness, and wildcard categories.'
    });

    return Response.json({ success: true, conversation_id: conversation.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});