// Simulated ML Predictor for Churn and LTV
// In a production environment, this would call a Python microservice hosting an XGBoost/LightGBM model.

/**
 * Calculates a churn risk score (0-100) based on Recency, Frequency, and Monetary (RFM) velocity.
 * @param {Object} customer - The customer object
 * @param {Array} orders - The customer's order history
 * @returns {Number} Churn risk score (0-100)
 */
function calculateChurnRisk(customer, orders) {
  if (!orders || orders.length === 0) return 90; // High risk if no orders

  // Recency: Days since last order
  const latestOrderDate = new Date(Math.max(...orders.map(o => new Date(o.created_at))));
  const daysSinceLastOrder = (new Date() - latestOrderDate) / (1000 * 60 * 60 * 24);

  // Frequency: Number of orders
  const frequency = orders.length;

  // Monetary: Total spend
  const monetary = orders.reduce((sum, o) => sum + o.amount, 0);

  // Baseline risk starts at 50
  let riskScore = 50;

  // Recency penalty/bonus
  if (daysSinceLastOrder > 90) riskScore += 30;
  else if (daysSinceLastOrder > 60) riskScore += 15;
  else if (daysSinceLastOrder < 30) riskScore -= 20;

  // Frequency bonus
  if (frequency > 5) riskScore -= 15;
  else if (frequency === 1) riskScore += 10;

  // Monetary bonus (High spenders are slightly less likely to churn abruptly)
  if (monetary > 10000) riskScore -= 10;
  
  // Cap between 5 and 95 for realistic probability
  return Math.max(5, Math.min(95, riskScore));
}

/**
 * Generates a "Next Best Action" recommendation based on churn risk and spend.
 */
function getNextBestAction(churnRisk, totalSpend) {
  if (churnRisk > 75) {
    if (totalSpend > 5000) return "Send High-Value Retention Offer (20% Off)";
    return "Send Win-back Email Sequence";
  } else if (churnRisk < 30) {
    if (totalSpend > 10000) return "Invite to VIP Loyalty Program";
    return "Upsell related products";
  }
  return "Include in standard newsletter";
}

module.exports = {
  calculateChurnRisk,
  getNextBestAction
};
