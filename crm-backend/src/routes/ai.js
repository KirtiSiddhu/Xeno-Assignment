const express = require('express');

const router = express.Router();

const { chat } = require('../agent');

router.post('/chat', async (req, res) => {
  try {
    const { messages, message, session_id } = req.body;
    let chatHistory = messages || [{ role: 'user', content: message }];
    const sessionId = session_id || 'session-123';
    
    const result = await chat(chatHistory);
    // add session_id to result so frontend updates it
    res.json({ ...result, session_id: sessionId });
  } catch (error) {
    console.error('Error in /chat route:', error);
    res.status(500).json({ reply: 'Sorry, an error occurred on the server.' });
  }
});
router.get('/suggestions', (req, res) => {
  res.json([
    { id: 1, title: 'Find High Rollers', description: 'Create a segment of users who spent > 20000', icon: 'Crown', prompt: 'Create a segment of customers who spent more than 20000' },
    { id: 2, title: 'Engage Mumbai', description: 'Draft a campaign for Mumbai users', icon: 'MapPin', prompt: 'Create a campaign targeting Mumbai customers with a 10% discount' }
  ]);
});

module.exports = router;
