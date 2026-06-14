const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../db');

const router = express.Router();

router.get('/stats/overview', (req, res) => {
  const db = getDb();
  const total_customers = db.customers.length;
  const total_revenue = db.customer_stats.reduce((acc, c) => acc + c.total_spend, 0);
  const avg_order_value = total_customers ? db.customer_stats.reduce((acc, c) => acc + c.avg_order_value, 0) / total_customers : 0;
  
  const monthAgo = new Date();
  monthAgo.setDate(monthAgo.getDate() - 30);
  const new_this_month = db.customers.filter(c => new Date(c.created_at) >= monthAgo).length;

  const cityCounts = {};
  db.customers.forEach(c => { if(c.city) cityCounts[c.city] = (cityCounts[c.city] || 0) + 1; });
  const top_cities = Object.entries(cityCounts).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([city, count]) => ({city, count}));

  const gender_split = { M: 0, F: 0 };
  db.customers.forEach(c => { if (c.gender === 'M') gender_split.M++; else if (c.gender === 'F') gender_split.F++; });

  res.json({ total_customers, total_revenue, avg_order_value, new_this_month, top_cities, gender_split });
});

router.get('/', (req, res) => {
  const db = getDb();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 50;
  const search = (req.query.search || '').toLowerCase();
  
  let filtered = db.customers;
  if (search) filtered = filtered.filter(c => c.name.toLowerCase().includes(search) || c.email.toLowerCase().includes(search));
  if (req.query.city) filtered = filtered.filter(c => c.city === req.query.city);
  if (req.query.gender) filtered = filtered.filter(c => c.gender === req.query.gender);

  // sort
  filtered.sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

  const total = filtered.length;
  const paginated = filtered.slice((page-1)*limit, page*limit).map(c => {
    const stats = db.customer_stats.find(s => s.customer_id === c.id) || {};
    let tags = [];
    try { tags = JSON.parse(c.tags || '[]'); } catch(e){}
    return { ...c, ...stats, tags };
  });

  res.json({ customers: paginated, total, page, limit, totalPages: Math.ceil(total/limit) });
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const c = db.customers.find(x => x.id === req.params.id);
  if (!c) return res.status(404).json({error: 'Not found'});
  
  const stats = db.customer_stats.find(s => s.customer_id === c.id) || {};
  let tags = [];
  try { tags = JSON.parse(c.tags || '[]'); } catch(e){}
  
  const orders = db.orders.filter(o => o.customer_id === c.id).sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  res.json({ customer: { ...c, ...stats, tags }, orders });
});

module.exports = router;
