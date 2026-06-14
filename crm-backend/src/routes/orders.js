const express = require('express');
const { getDb } = require('../db');

const router = express.Router();

// GET /api/orders
router.get('/', (req, res) => {
  try {
    const db = getDb();
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const offset = (page - 1) * limit;

    const countSql = `SELECT COUNT(id) as count FROM orders`;
    const total = db.prepare(countSql).get().count;

    const dataSql = `
      SELECT o.*, c.name as customer_name, c.email as customer_email
      FROM orders o
      JOIN customers c ON o.customer_id = c.id
      ORDER BY o.created_at DESC
      LIMIT @limit OFFSET @offset
    `;
    const orders = db.prepare(dataSql).all({ limit, offset });

    res.json({
      orders,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/orders/customer/:customerId
router.get('/customer/:customerId', (req, res) => {
  try {
    const db = getDb();
    const orders = db.prepare('SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC').all(req.params.customerId);
    res.json(orders);
  } catch (error) {
    console.error('Error fetching customer orders:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
