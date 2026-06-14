/**
 * Database schema initialization
 * Creates all required tables and indexes
 */

function initSchema(db) {
  // Customers table
  db.exec(`
    CREATE TABLE IF NOT EXISTS customers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      phone TEXT,
      city TEXT,
      gender TEXT,
      age INTEGER,
      tags TEXT DEFAULT '[]',
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Orders table
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      customer_id TEXT NOT NULL,
      order_value REAL NOT NULL,
      status TEXT DEFAULT 'completed',
      product_category TEXT,
      product_name TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
  `);

  // Customer stats table (aggregated for fast queries)
  db.exec(`
    CREATE TABLE IF NOT EXISTS customer_stats (
      customer_id TEXT PRIMARY KEY,
      total_orders INTEGER DEFAULT 0,
      total_spend REAL DEFAULT 0,
      avg_order_value REAL DEFAULT 0,
      first_order_date TEXT,
      last_order_date TEXT,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
  `);

  // Segments table
  db.exec(`
    CREATE TABLE IF NOT EXISTS segments (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      rules TEXT DEFAULT '{}',
      customer_count INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Campaigns table
  db.exec(`
    CREATE TABLE IF NOT EXISTS campaigns (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      status TEXT DEFAULT 'draft',
      channel TEXT,
      message_template TEXT,
      segment_id TEXT,
      total_sent INTEGER DEFAULT 0,
      total_delivered INTEGER DEFAULT 0,
      total_failed INTEGER DEFAULT 0,
      total_opened INTEGER DEFAULT 0,
      total_clicked INTEGER DEFAULT 0,
      total_converted INTEGER DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now')),
      sent_at TEXT
    );
  `);

  // Communications table (one row per customer per campaign)
  db.exec(`
    CREATE TABLE IF NOT EXISTS communications (
      id TEXT PRIMARY KEY,
      campaign_id TEXT NOT NULL,
      customer_id TEXT NOT NULL,
      channel TEXT,
      message TEXT,
      status TEXT DEFAULT 'pending',
      sent_at TEXT,
      delivered_at TEXT,
      opened_at TEXT,
      clicked_at TEXT,
      converted_at TEXT,
      failed_at TEXT,
      channel_message_id TEXT,
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (campaign_id) REFERENCES campaigns(id),
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
  `);

  // Indexes for performance
  db.exec(`CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_communications_campaign_id ON communications(campaign_id);`);
  db.exec(`CREATE INDEX IF NOT EXISTS idx_communications_status ON communications(status);`);

  console.log('✅ Database schema initialized');
}

module.exports = { initSchema };
