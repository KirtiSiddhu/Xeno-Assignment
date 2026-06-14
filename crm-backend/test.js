const axios = require('axios');

async function testFlow() {
  try {
    console.log('1. Creating Segment...');
    const segRes = await axios.post('http://localhost:4000/api/segments', {
      name: 'High Spenders in Delhi',
      rules: {
        logic: 'AND',
        conditions: [
          { field: 'total_spend', operator: '>=', value: 5000 },
          { field: 'city', operator: '==', value: 'Delhi' }
        ]
      }
    });
    const segmentId = segRes.data.id;
    console.log('Segment Created:', segmentId, 'Customer Count:', segRes.data.customer_count);

    console.log('\n2. Creating Campaign...');
    const campRes = await axios.post('http://localhost:4000/api/campaigns', {
      name: 'Delhi High Spenders Promo',
      description: 'Promo for big spenders in Delhi',
      channel: 'email',
      segment_id: segmentId,
      message_template: 'Hi {{name}}, get 20% off your next purchase!'
    });
    const campaignId = campRes.data.id;
    console.log('Campaign Created:', campaignId);

    console.log('\n3. Launching Campaign...');
    const launchRes = await axios.post(`http://localhost:4000/api/campaigns/${campaignId}/launch`);
    console.log('Launch Response:', launchRes.data);

    console.log('\n4. Waiting for callbacks (15 seconds)...');
    await new Promise(resolve => setTimeout(resolve, 15000));

    console.log('\n5. Fetching Campaign Stats...');
    const statsRes = await axios.get(`http://localhost:4000/api/campaigns/${campaignId}`);
    console.log('Campaign Stats:', {
      total_sent: statsRes.data.total_sent,
      total_delivered: statsRes.data.total_delivered,
      total_opened: statsRes.data.total_opened,
      total_clicked: statsRes.data.total_clicked,
      total_converted: statsRes.data.total_converted,
      total_failed: statsRes.data.total_failed,
    });

  } catch (err) {
    console.error('Error:', err.response ? err.response.data : err.message);
  }
}

testFlow();
