const axios = require('axios');

async function testAI() {
  try {
    console.log('Testing AI chat...');
    const res = await axios.post('http://localhost:4000/api/ai/chat', {
      message: 'Create a segment of people from Mumbai with spend > 3000, draft an SMS promo code, and launch a campaign.'
    });
    console.log('AI Response:', res.data);
  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testAI();
