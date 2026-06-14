require('dotenv').config();

const express = require('express');
const cors = require('cors');
const { initDb } = require('./db/index');

const customersRouter = require('./routes/customers');
const ordersRouter = require('./routes/orders');
const segmentsRouter = require('./routes/segments');
const campaignsRouter = require('./routes/campaigns');
const receiptsRouter = require('./routes/receipts');
const aiRouter = require('./routes/ai');
const analyticsRouter = require('./routes/analytics');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json({ limit: '10mb' }));

// Routes
app.use('/api/customers', customersRouter);
app.use('/api/orders', ordersRouter);
app.use('/api/segments', segmentsRouter);
app.use('/api/campaigns', campaignsRouter);
app.use('/api/receipts', receiptsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/analytics', analyticsRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'crm-backend', timestamp: new Date().toISOString() });
});

// Initialize DB then start server
try {
  initDb();
  app.listen(PORT, () => {
    console.log(`🚀 CRM Backend running on http://localhost:${PORT}`);
    console.log(`📦 Database initialized successfully`);
    console.log(`🔑 Gemini AI: ${process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here' ? 'Connected' : 'Mock Mode'}`);
  });
} catch (err) {
  console.error('Failed to start server:', err);
  process.exit(1);
}
