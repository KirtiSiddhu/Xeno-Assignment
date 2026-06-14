const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

router.get('/overview', (req, res) => {
  const db = getDb();
  const total_customers = db.customers.length;
  const total_revenue = db.customer_stats.reduce((acc, c) => acc + c.total_spend, 0);
  const total_campaigns = db.campaigns.length;

  let sumSent = 0, sumDeliv = 0, sumOpen = 0, sumClick = 0;
  db.campaigns.forEach(c => {
    sumSent += c.total_sent; sumDeliv += c.total_delivered; sumOpen += c.total_opened; sumClick += c.total_clicked;
  });

  const avg_delivery_rate = sumSent ? (sumDeliv / sumSent) * 100 : 0;
  const avg_open_rate = sumDeliv ? (sumOpen / sumDeliv) * 100 : 0;
  const avg_click_rate = sumOpen ? (sumClick / sumOpen) * 100 : 0;

  res.json({ total_customers, total_revenue, total_campaigns, avg_delivery_rate, avg_open_rate, avg_click_rate });
});

router.get('/campaigns/performance', (req, res) => {
  const db = getDb();
  const perf = db.campaigns.sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).map(c => ({
    id: c.id,
    name: c.name,
    delivery_rate: c.total_sent ? (c.total_delivered / c.total_sent) * 100 : 0,
    open_rate: c.total_delivered ? (c.total_opened / c.total_delivered) * 100 : 0,
    click_rate: c.total_opened ? (c.total_clicked / c.total_opened) * 100 : 0,
    conversion_rate: c.total_clicked ? (c.total_converted / c.total_clicked) * 100 : 0
  }));
  res.json(perf);
});

router.get('/campaigns/:id/funnel', (req, res) => {
  const db = getDb();
  const c = db.campaigns.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({error: 'Not found'});

  res.json([
    { stage: 'Sent', count: c.total_sent },
    { stage: 'Delivered', count: c.total_delivered },
    { stage: 'Opened', count: c.total_opened },
    { stage: 'Clicked', count: c.total_clicked },
    { stage: 'Converted', count: c.total_converted }
  ]);
});

router.get('/customers/distribution', (req, res) => {
  res.json({ message: 'TBD' });
});

module.exports = router;
