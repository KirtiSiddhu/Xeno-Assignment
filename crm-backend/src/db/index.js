const fs = require('fs');
const path = require('path');

const dbPath = process.env.DB_PATH || path.join(__dirname, '../../data/crm.json');

let data = {
  customers: [],
  customer_stats: [],
  orders: [],
  segments: [],
  campaigns: [],
  communications: []
};

function initDb() {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  
  if (fs.existsSync(dbPath)) {
    try {
      data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    } catch(e) {
      console.error('Error reading DB, starting fresh');
      saveDb();
    }
  } else {
    saveDb();
  }
}

function saveDb() {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
}

function getDb() {
  return data;
}

module.exports = { getDb, initDb, saveDb };
