const { getDb } = require('../db');

function evaluateSegment(rules) {
  const db = getDb();
  let matches = [];

  for (const c of db.customers) {
    const stats = db.customer_stats.find(s => s.customer_id === c.id) || {};
    
    let pass = true;
    if (rules.min_total_spend && stats.total_spend < rules.min_total_spend) pass = false;
    if (rules.max_total_spend && stats.total_spend > rules.max_total_spend) pass = false;
    if (rules.min_orders && stats.total_orders < rules.min_orders) pass = false;
    if (rules.max_orders && stats.total_orders > rules.max_orders) pass = false;
    
    if (rules.min_days_since_last_order) {
      if (!stats.last_order_date) pass = false;
      else {
        const days = (new Date() - new Date(stats.last_order_date)) / (1000 * 3600 * 24);
        if (days < rules.min_days_since_last_order) pass = false;
      }
    }
    if (rules.max_days_since_last_order) {
      if (!stats.last_order_date) pass = false;
      else {
        const days = (new Date() - new Date(stats.last_order_date)) / (1000 * 3600 * 24);
        if (days > rules.max_days_since_last_order) pass = false;
      }
    }

    if (rules.city && Array.isArray(rules.city) && rules.city.length > 0) {
      if (!rules.city.includes(c.city)) pass = false;
    }

    if (rules.gender && c.gender !== rules.gender) pass = false;
    if (rules.min_age && c.age < rules.min_age) pass = false;
    if (rules.max_age && c.age > rules.max_age) pass = false;
    if (rules.min_avg_order_value && stats.avg_order_value < rules.min_avg_order_value) pass = false;

    if (pass) matches.push(c.id);
  }
  return matches;
}

function getSegmentCount(rules) {
  return evaluateSegment(rules).length;
}

module.exports = { evaluateSegment, getSegmentCount };
