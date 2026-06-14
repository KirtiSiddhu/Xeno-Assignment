require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { simulateDelivery } = require('./simulator');

const app = express();
const PORT = process.env.PORT || 4001;

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'channel-service', port: PORT });
});

app.post('/send', (req, res) => {
  const { communication_id, recipient, message, channel, customer_name } = req.body;

  if (!communication_id || !recipient || !message || !channel) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  console.log(`[Channel] Queuing ${channel.toUpperCase()} message to ${recipient} (${communication_id})`);

  // Fire and forget — simulate delivery asynchronously
  simulateDelivery(req.body).catch(err => {
    console.error(`[Channel] Error simulating delivery for ${communication_id}:`, err);
  });

  // Immediately respond with 202 Accepted
  res.status(202).json({ 
    accepted: true, 
    communication_id, 
    queued_at: new Date().toISOString() 
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`📨 Channel Service (Stub) running on port ${PORT}`);
  console.log(`🔗 Callbacks routing to: ${process.env.CRM_BACKEND_URL}`);
});
