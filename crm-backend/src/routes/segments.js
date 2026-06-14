const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDb, saveDb } = require('../db');
const { getSegmentCount, evaluateSegment } = require('../services/segmentEngine');

const router = express.Router();

router.get('/', (req, res) => {
  const db = getDb();
  const sorted = [...db.segments].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));
  res.json(sorted);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const segment = db.segments.find(s => s.id === req.params.id);
  if (!segment) return res.status(404).json({error: 'Not found'});
  res.json(segment);
});

router.post('/', (req, res) => {
  const { name, description, rules } = req.body;
  if (!name || !rules) return res.status(400).json({error: 'name and rules required'});

  const db = getDb();
  const count = getSegmentCount(rules);
  const segment = {
    id: uuidv4(),
    name,
    description: description || '',
    rules: typeof rules === 'object' ? JSON.stringify(rules) : rules,
    customer_count: count,
    created_at: new Date().toISOString()
  };

  db.segments.push(segment);
  saveDb();
  res.status(201).json(segment);
});

router.post('/preview', (req, res) => {
  const { rules } = req.body;
  if (!rules) return res.status(400).json({error: 'rules required'});
  
  const db = getDb();
  const ids = evaluateSegment(rules);
  const sample = ids.slice(0, 5).map(id => {
    const c = db.customers.find(x => x.id === id);
    return { id: c.id, name: c.name, email: c.email };
  });

  res.json({ count: ids.length, sample_customers: sample });
});

module.exports = router;
