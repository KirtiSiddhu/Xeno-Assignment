require('dotenv').config();
const axios = require('axios');

const CRM_BACKEND_URL = process.env.CRM_BACKEND_URL || 'http://localhost:4000';

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const randomBetween = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

async function sendCallback(communication_id, status, metadata = {}) {
  const payload = {
    communication_id,
    status,
    timestamp: new Date().toISOString(),
    metadata
  };

  const delays = [1000, 2000, 4000];
  
  for (let i = 0; i <= delays.length; i++) {
    try {
      await axios.post(`${CRM_BACKEND_URL}/api/receipts`, payload);
      console.log(`[Channel] Callback ${status} sent for ${communication_id}`);
      return;
    } catch (error) {
      if (i < delays.length) {
        console.warn(`[Channel] Callback failed for ${communication_id}. Retrying in ${delays[i]}ms...`);
        await sleep(delays[i]);
      } else {
        console.error(`[Channel] Callback completely failed for ${communication_id} after 3 retries: ${error.message}`);
      }
    }
  }
}

async function simulateDelivery(communication) {
  const { communication_id, channel } = communication;
  
  // Initial delay for delivery (network transit time)
  await sleep(randomBetween(500, 2000));
  
  // 92% delivery rate
  const isDelivered = Math.random() < 0.92;
  
  if (!isDelivered) {
    await sendCallback(communication_id, 'failed', { reason: 'bounce or invalid number' });
    return;
  }
  
  await sendCallback(communication_id, 'delivered');
  
  // If delivered, simulate opens (varies by channel)
  await sleep(randomBetween(2000, 6000));
  let openChance = 0.45;
  if (channel === 'sms') openChance = 0.30; // lower tracking reliability on SMS
  
  const isOpened = Math.random() < openChance;
  if (!isOpened) return;
  
  await sendCallback(communication_id, 'opened');
  
  // If opened, simulate clicks
  await sleep(randomBetween(3000, 8000));
  const isClicked = Math.random() < 0.25;
  if (!isClicked) return;
  
  await sendCallback(communication_id, 'clicked');
  
  // If clicked, simulate conversion
  await sleep(randomBetween(5000, 12000));
  const isConverted = Math.random() < 0.15;
  if (isConverted) {
    await sendCallback(communication_id, 'converted');
  }
}

module.exports = {
  simulateDelivery
};
