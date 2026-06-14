/**
 * 🎬 DEMO SIMULATOR
 * Run this script before a presentation to pre-populate the CRM with
 * realistic campaigns, segments, and slowly trickling live events so
 * the dashboard looks alive during your demo.
 *
 * Usage: node simulate_demo.js
 */

const axios = require('axios');

const BASE = 'http://localhost:4000/api';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

async function simulateDemo() {
  console.log('\n🚀 Xeno CRM Demo Simulator\n');

  // ─── Step 1: Create Segments ───────────────────────────────────────────
  console.log('📦 Creating audience segments...');

  const segments = [
    {
      name: 'Mumbai High Spenders',
      description: 'Premium shoppers from Mumbai with LTV > ₹8,000',
      rules: { logic: 'AND', conditions: [{ field: 'city', operator: '==', value: 'Mumbai' }, { field: 'total_spend', operator: '>=', value: 8000 }] }
    },
    {
      name: 'Dormant Delhi Shoppers',
      description: 'Delhi users who haven\'t purchased in 60+ days',
      rules: { logic: 'AND', conditions: [{ field: 'city', operator: '==', value: 'Delhi' }, { field: 'days_since_last_order', operator: '>=', value: 60 }] }
    },
    {
      name: 'VIP Loyalists',
      description: 'Top 10% customers by lifetime spend across India',
      rules: { logic: 'AND', conditions: [{ field: 'total_spend', operator: '>=', value: 15000 }] }
    },
    {
      name: 'New Customers (Last 30 Days)',
      description: 'Customers who joined in the last month — perfect for onboarding campaigns',
      rules: { logic: 'AND', conditions: [{ field: 'days_since_joined', operator: '<=', value: 30 }] }
    }
  ];

  const createdSegments = [];
  for (const seg of segments) {
    try {
      const res = await axios.post(`${BASE}/segments`, seg);
      createdSegments.push(res.data);
      console.log(`  ✅ Segment: "${seg.name}" (${res.data.customer_count} customers)`);
    } catch (e) {
      console.log(`  ⚠️  Skipping "${seg.name}": ${e.response?.data?.error || e.message}`);
    }
    await sleep(200);
  }

  if (createdSegments.length === 0) {
    console.log('\n❌ No segments could be created. Is the backend running on port 4000?\n');
    process.exit(1);
  }

  // ─── Step 2: Create Campaigns ──────────────────────────────────────────
  console.log('\n📣 Creating campaigns...');

  const campaignDefs = [
    {
      name: 'Diwali VIP Collection Drop',
      description: 'Exclusive pre-sale access for our VIP loyalists',
      channel: 'whatsapp',
      message_template: 'Hi {{name}}! 🪔 As one of our VIP members, you get EXCLUSIVE early access to our Diwali collection. Use code VIP25 for 25% off. Shop now: lumiere.in/diwali',
      segmentIdx: 2
    },
    {
      name: 'Mumbai Monsoon Sale',
      description: 'Rain-season clearance for Mumbai\'s top spenders',
      channel: 'email',
      message_template: 'Dear {{name}}, Monsoon is here and so are our biggest deals! As a Lumière premium member from Mumbai, enjoy free shipping + 15% off everything. Code: MUMBAI15',
      segmentIdx: 0
    },
    {
      name: 'Win-Back Delhi Campaign',
      description: 'Re-engage dormant Delhi shoppers',
      channel: 'sms',
      message_template: 'Hi {{name}}, we miss you! It\'s been a while since your last Lumière order. Here\'s ₹500 off your next purchase. Code: COMEBACK500. Valid 48hrs.',
      segmentIdx: 1
    }
  ];

  const createdCampaigns = [];
  for (const def of campaignDefs) {
    if (!createdSegments[def.segmentIdx]) continue;
    try {
      const res = await axios.post(`${BASE}/campaigns`, {
        name: def.name,
        description: def.description,
        channel: def.channel,
        segment_id: createdSegments[def.segmentIdx].id,
        message_template: def.message_template
      });
      createdCampaigns.push(res.data);
      console.log(`  ✅ Campaign: "${def.name}" (${def.channel})`);
    } catch (e) {
      console.log(`  ⚠️  Skipping "${def.name}": ${e.response?.data?.error || e.message}`);
    }
    await sleep(200);
  }

  // ─── Step 3: Launch Campaigns ──────────────────────────────────────────
  console.log('\n🚀 Launching campaigns...');
  for (const camp of createdCampaigns) {
    try {
      const res = await axios.post(`${BASE}/campaigns/${camp.id}/launch`);
      console.log(`  ✅ Launched "${camp.name}": ${res.data.sent} messages dispatched`);
    } catch (e) {
      console.log(`  ⚠️  Could not launch "${camp.name}": ${e.response?.data?.error || e.message}`);
    }
    await sleep(500);
  }

  // ─── Step 4: Wait for callbacks ───────────────────────────────────────
  console.log('\n⏳ Waiting 12 seconds for delivery callbacks to stream in...');
  for (let i = 12; i > 0; i--) {
    process.stdout.write(`\r   ${i} seconds remaining...   `);
    await sleep(1000);
  }
  process.stdout.write('\n');

  // ─── Step 5: Show final stats ──────────────────────────────────────────
  console.log('\n📊 Final Campaign Stats:');
  console.log('─'.repeat(70));
  for (const camp of createdCampaigns) {
    try {
      const res = await axios.get(`${BASE}/campaigns/${camp.id}`);
      const d = res.data;
      console.log(`\n  📣 ${d.name} (${d.channel.toUpperCase()})`);
      console.log(`     Segment: ${d.segment_name}`);
      console.log(`     Sent: ${d.total_sent} | Delivered: ${d.total_delivered} | Opened: ${d.total_opened} | Clicked: ${d.total_clicked} | Converted: ${d.total_converted}`);
      if (d.total_sent > 0) {
        const delivRate = ((d.total_delivered / d.total_sent) * 100).toFixed(1);
        const openRate = d.total_delivered > 0 ? ((d.total_opened / d.total_delivered) * 100).toFixed(1) : 0;
        const convRate = d.total_delivered > 0 ? ((d.total_converted / d.total_delivered) * 100).toFixed(1) : 0;
        console.log(`     Delivery: ${delivRate}% | Open Rate: ${openRate}% | Conversion: ${convRate}%`);
      }
    } catch (e) { /* skip */ }
  }

  console.log('\n─'.repeat(70));
  console.log('\n✨ Demo environment is ready! Open http://localhost:3000 to showcase.\n');
  console.log('  📌 Tip: The analytics dashboard will now show live data from these campaigns.\n');
}

simulateDemo().catch(console.error);
