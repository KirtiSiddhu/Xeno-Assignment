const express = require('express');
const { getDb, saveDb } = require('../db');

const router = express.Router();

router.post('/', (req, res) => {
  const { communication_id, status, timestamp, metadata } = req.body;
  if (!communication_id || !status) return res.status(400).json({error: 'missing params'});

  const db = getDb();
  const comm = db.communications.find(c => c.id === communication_id);
  if (!comm) return res.status(404).json({error: 'communication not found'});

  // idempotency check
  if (comm.status === status && status !== 'pending') return res.status(200).json({ok: true, skipped: true});

  comm.status = status;
  if (status === 'delivered') comm.delivered_at = timestamp;
  else if (status === 'opened') comm.opened_at = timestamp;
  else if (status === 'clicked') comm.clicked_at = timestamp;
  else if (status === 'converted') comm.converted_at = timestamp;
  else if (status === 'failed') comm.failed_at = timestamp;

  const campaign = db.campaigns.find(c => c.id === comm.campaign_id);
  if (campaign) {
    if (status === 'delivered') campaign.total_delivered++;
    else if (status === 'opened') campaign.total_opened++;
    else if (status === 'clicked') campaign.total_clicked++;
    else if (status === 'converted') campaign.total_converted++;
    else if (status === 'failed') campaign.total_failed++;

    if (campaign.status === 'running') {
      const deliveredOrFailed = campaign.total_delivered + campaign.total_failed;
      if (deliveredOrFailed >= campaign.total_sent && campaign.total_sent > 0) {
        campaign.status = 'completed';
      }
    }
  }

  saveDb();
  res.status(200).json({ok: true});
});

module.exports = router;
