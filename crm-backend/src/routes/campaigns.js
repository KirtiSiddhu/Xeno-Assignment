const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../db');
const { runCampaign } = require('../services/campaignRunner');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  const sorted = [...db.campaigns].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  const resData = sorted.map(c => {
    const s = db.segments.find(x => x.id === c.segment_id);
    return { ...c, segment_name: s ? s.name : null };
  });
  res.json(resData);
});

router.post('/', (req, res) => {
  const { name, description, channel, segment_id, message_template } = req.body;
  if (!name || !channel || !segment_id || !message_template) return res.status(400).json({error: 'missing fields'});

  const db = getDb();
  const c = {
    id: uuidv4(),
    name, description, channel, segment_id, message_template,
    status: 'draft',
    total_sent: 0, total_delivered: 0, total_failed: 0, total_opened: 0, total_clicked: 0, total_converted: 0,
    created_at: new Date().toISOString()
  };
  db.campaigns.push(c);
  saveDb();
  res.status(201).json(c);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const c = db.campaigns.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({error: 'Not found'});
  const s = db.segments.find(x => x.id === c.segment_id);
  res.json({ ...c, segment_name: s ? s.name : null });
});

router.post('/:id/launch', async (req, res) => {
  try {
    const result = await runCampaign(req.params.id);
    res.json(result);
  } catch (err) {
    res.status(400).json({error: err.message});
  }
});

router.get('/:id/communications', (req, res) => {
  const db = getDb();
  const page = parseInt(req.query.page) || 1;
  const limit = 50;
  
  const comms = db.communications.filter(c => c.campaign_id === req.params.id).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  
  const paginated = comms.slice((page-1)*limit, page*limit).map(c => {
    const cust = db.customers.find(x => x.id === c.customer_id) || {};
    return { ...c, customer_name: cust.name, customer_email: cust.email, customer_phone: cust.phone };
  });
  
  res.json({ communications: paginated, total: comms.length, page, limit });
});

module.exports = router;
