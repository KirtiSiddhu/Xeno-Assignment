const { GoogleGenerativeAI } = require('@google/generative-ai');
const { toolDefinitions, executeToolCall } = require('./tools');

const apiKey = process.env.GEMINI_API_KEY;
const isMockMode = !apiKey || apiKey === 'your_gemini_api_key_here';

let genAI = null;
if (!isMockMode) {
  genAI = new GoogleGenerativeAI(apiKey);
}

const systemInstruction = `
You are Xena, an AI marketing assistant for Lumière — a premium fashion brand's CRM.
You help marketers segment customers, craft personalized campaigns, and track performance.
You have access to tools to analyze customers, create segments, draft messages, create campaigns, and launch them.
Always be proactive: when creating a segment, preview it first. When drafting a message, make it genuinely compelling.
Be concise but friendly. Use ₹ for currency.
When you launch a campaign, tell the marketer how many customers will be reached.
`;

async function chat(messages) {
  if (isMockMode) {
    // Simple mock logic for when there's no API key
    const lastMsg = messages[messages.length - 1].content.toLowerCase();
    let reply = "I'm currently in mock mode because no Gemini API key was provided. I can still help you navigate the CRM manually, or you can add an API key to enable full AI agent capabilities.";
    let tool_calls = [];

    if (lastMsg.includes('segment')) {
      reply = "I've analyzed your request and created a segment.";
      tool_calls.push({
        name: 'create_segment',
        args: { name: 'Mock Segment', description: 'Created in mock mode', rules: {} },
        result: await executeToolCall('create_segment', { name: 'Mock Segment', description: 'Created in mock mode', rules: {} })
      });
    } else if (lastMsg.includes('campaign')) {
      reply = "I've drafted a campaign for you. You can launch it now.";
      tool_calls.push({
        name: 'create_campaign',
        args: { name: 'Mock Campaign', segment_id: 'mock-id', channel: 'email', message_template: 'Mock message' },
        result: { id: 'mock', status: 'draft created' }
      });
    }

    return { reply, tool_calls, session_id: 'mock-session' };
  }

  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: systemInstruction,
      tools: toolDefinitions
    });

    // Convert messages to Gemini format
    const history = messages.slice(0, -1).map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const chatSession = model.startChat({ history });
    const lastMessage = messages[messages.length - 1].content;

    let response = await chatSession.sendMessage([{ text: lastMessage }]);
    let call = response.response.functionCalls && response.response.functionCalls()[0];
    
    let allToolCalls = [];

    // Loop to handle up to 8 sequential tool calls (full agentic flows can require 5+)
    let iterations = 0;
    while (call && iterations < 8) {
      iterations++;
      const functionName = call.name;
      const args = call.args;
      
      console.log(`[AI Agent] Calling tool: ${functionName}`);
      const result = await executeToolCall(functionName, args);
      
      allToolCalls.push({ name: functionName, args, result });

      response = await chatSession.sendMessage([{
        functionResponse: {
          name: functionName,
          response: result
        }
      }]);
      
      call = response.response.functionCalls && response.response.functionCalls()[0];
    }

    const replyText = response.response.text();
    return { reply: replyText, tool_calls: allToolCalls };

  } catch (error) {
    console.error('Agent chat error:', error);
    return { reply: "I encountered an error while processing that request.", error: error.message };
  }
}

module.exports = {
  chat
};
