const { getDb } = require('../db');
const { getSegmentSample } = require('../services/segmentEngine');
const { runCampaign } = require('../services/campaignRunner');
const { v4: uuidv4 } = require('uuid');

const toolDefinitions = [{
  functionDeclarations: [
    {
      name: 'analyze_customers',
      description: 'Analyze the customer base and return insights like total customers, revenue, top cities, customer segments by spend and recency',
      parameters: { type: 'OBJECT', properties: {}, required: [] }
    },
    {
      name: 'preview_segment',
      description: 'Preview how many customers match given segment rules without creating a segment',
      parameters: {
        type: 'OBJECT',
        properties: {
          rules: {
            type: 'OBJECT',
            description: 'Segment rules object. Keys can be: min_total_spend, max_total_spend, min_orders, max_orders, min_days_since_last_order, max_days_since_last_order, city (array of strings), gender (M or F), min_age, max_age'
          }
        },
        required: ['rules']
      }
    },
    {
      name: 'create_segment',
      description: 'Create and save a named customer segment with rules',
      parameters: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING', description: 'Segment name' },
          description: { type: 'STRING', description: 'Human-readable description' },
          rules: { type: 'OBJECT', description: 'Segment rules object' }
        },
        required: ['name', 'description', 'rules']
      }
    },
    {
      name: 'draft_message',
      description: 'Generate a personalized message template for a campaign. Use {{name}}, {{city}}, {{first_name}}, {{total_spend}} as placeholders.',
      parameters: {
        type: 'OBJECT',
        properties: {
          goal: { type: 'STRING', description: 'Campaign goal or intent' },
          channel: { type: 'STRING', description: 'Delivery channel (email, sms, whatsapp, rcs)' },
          tone: { type: 'STRING', description: 'Message tone' },
          offer: { type: 'STRING', description: 'Any offer or discount to include' }
        },
        required: ['goal', 'channel']
      }
    },
    {
      name: 'create_campaign',
      description: 'Create a new campaign with a segment and message template (does not send yet)',
      parameters: {
        type: 'OBJECT',
        properties: {
          name: { type: 'STRING' },
          description: { type: 'STRING' },
          segment_id: { type: 'STRING', description: 'ID of the segment to target' },
          channel: { type: 'STRING', description: 'email, sms, whatsapp, or rcs' },
          message_template: { type: 'STRING', description: 'Message template with placeholders' }
        },
        required: ['name', 'segment_id', 'channel', 'message_template']
      }
    },
    {
      name: 'launch_campaign',
      description: 'Launch and send a campaign to all customers in its segment',
      parameters: {
        type: 'OBJECT',
        properties: {
          campaign_id: { type: 'STRING', description: 'ID of the campaign to launch' }
        },
        required: ['campaign_id']
      }
    },
    {
      name: 'get_campaign_stats',
      description: 'Get performance statistics for a campaign',
      parameters: {
        type: 'OBJECT',
        properties: {
          campaign_id: { type: 'STRING' }
        },
        required: ['campaign_id']
      }
    },
    {
      name: 'list_campaigns',
      description: 'List all campaigns with their current status and stats',
      parameters: { type: 'OBJECT', properties: {}, required: [] }
    },
    {
      name: 'list_segments',
      description: 'List all saved customer segments',
      parameters: { type: 'OBJECT', properties: {}, required: [] }
    }
  ]
}];

async function executeToolCall(name, args) {
  const db = getDb();
  
  try {
    switch (name) {
      case 'analyze_customers': {
        const stats = db.prepare('SELECT COUNT(id) as total, SUM(total_spend) as revenue FROM customer_stats').get();
        return { total_customers: stats.total, total_revenue: stats.revenue };
      }
      case 'preview_segment': {
        const sample = getSegmentSample(args.rules, 5);
        return { count: sample.length, sample_customers: sample.slice(0,3) }; // Simplified for AI context size
      }
      case 'create_segment': {
        const id = uuidv4();
        const sample = getSegmentSample(args.rules, 1); // just to get count easily here, normally use getSegmentCount
        db.prepare('INSERT INTO segments (id, name, description, rules) VALUES (?, ?, ?, ?)').run(id, args.name, args.description, JSON.stringify(args.rules));
        return { id, name: args.name, status: 'created' };
      }
      case 'draft_message': {
        // Simple mock generation since AI handles text generation better natively, but we expose it as a tool
        return { template: `Hi {{first_name}}, we noticed you love shopping at Lumière. Here is a special offer: ${args.offer || '10% off your next order'}. Valid for 48 hours!` };
      }
      case 'create_campaign': {
        const id = uuidv4();
        db.prepare(`
          INSERT INTO campaigns (id, name, description, channel, message_template, segment_id, status)
          VALUES (?, ?, ?, ?, ?, ?, 'draft')
        `).run(id, args.name, args.description || '', args.channel, args.message_template, args.segment_id);
        return { id, status: 'draft created' };
      }
      case 'launch_campaign': {
        const result = await runCampaign(args.campaign_id);
        return result;
      }
      case 'get_campaign_stats': {
        return db.prepare('SELECT * FROM campaigns WHERE id = ?').get(args.campaign_id);
      }
      case 'list_campaigns': {
        return db.prepare('SELECT id, name, status, channel FROM campaigns ORDER BY created_at DESC LIMIT 10').all();
      }
      case 'list_segments': {
        return db.prepare('SELECT id, name FROM segments ORDER BY created_at DESC LIMIT 10').all();
      }
      default:
        return { error: `Tool ${name} not found` };
    }
  } catch (error) {
    console.error(`Tool execution error [${name}]:`, error);
    return { error: error.message };
  }
}

module.exports = {
  toolDefinitions,
  executeToolCall
};
