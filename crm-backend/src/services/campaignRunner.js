const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../db');
const { evaluateSegment } = require('./segmentEngine');

const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL || 'http://localhost:4001';

async function runCampaign(campaignId) {
  const db = getDb();
  const campaign = db.campaigns.find(c => c.id === campaignId);
  if (!campaign) throw new Error('Campaign not found');
  if (campaign.status === 'completed' || campaign.status === 'running') throw new Error('Campaign already launched');

  const segment = db.segments.find(s => s.id === campaign.segment_id);
  if (!segment) throw new Error('Segment not found');

  let rules = {};
  try { rules = typeof segment.rules === 'string' ? JSON.parse(segment.rules) : segment.rules; } catch(e){}

  const matchingCustomerIds = evaluateSegment(rules);
  if (matchingCustomerIds.length === 0) throw new Error('Segment has no customers');

  campaign.status = 'running';
  campaign.sent_at = new Date().toISOString();
  saveDb(); // save running status

  let sent = 0;
  let failed = 0;

  for (const cid of matchingCustomerIds) {
    const customer = db.customers.find(c => c.id === cid);
    const stats = db.customer_stats.find(s => s.customer_id === cid) || {};
    
    // Personalize message
    let msg = campaign.message_template;
    msg = msg.replace(/{{name}}/g, customer.name);
    msg = msg.replace(/{{first_name}}/g, customer.name.split(' ')[0]);
    msg = msg.replace(/{{city}}/g, customer.city || 'your city');
    msg = msg.replace(/{{total_spend}}/g, stats.total_spend?.toString() || '0');

    const commId = uuidv4();
    const comm = {
      id: commId,
      campaign_id: campaign.id,
      customer_id: customer.id,
      channel: campaign.channel,
      message: msg,
      status: 'pending',
      created_at: new Date().toISOString()
    };
    db.communications.push(comm);

    const recipient = campaign.channel === 'email' ? customer.email : customer.phone;

    try {
      await axios.post(`${CHANNEL_SERVICE_URL}/send`, {
        communication_id: commId,
        recipient,
        message: msg,
        channel: campaign.channel,
        customer_name: customer.name
      });
      
      comm.status = 'sent';
      comm.sent_at = new Date().toISOString();
      sent++;
    } catch (err) {
      console.error(`Failed to send to ${recipient}`, err.message);
      comm.status = 'failed';
      comm.failed_at = new Date().toISOString();
      failed++;
    }
  }

  campaign.total_sent += sent;
  campaign.total_failed += failed;
  if (sent === 0) campaign.status = 'completed'; // everything failed
  saveDb();

  return { sent, failed };
}

module.exports = { runCampaign };
