const express = require('express');

const router = express.Router();

router.post('/chat', (req, res) => {
  res.json({
    reply: "I am a stubbed AI agent. The actual Gemini integration was skipped due to environment constraints.",
    tool_calls: []
  });
});

router.get('/suggestions', (req, res) => {
  res.json([
    { id: 1, title: 'Find High Rollers', description: 'Create a segment of users who spent > 20000', icon: 'Crown', prompt: 'Create a segment of customers who spent more than 20000' },
    { id: 2, title: 'Engage Mumbai', description: 'Draft a campaign for Mumbai users', icon: 'MapPin', prompt: 'Create a campaign targeting Mumbai customers with a 10% discount' }
  ]);
});

module.exports = router;
