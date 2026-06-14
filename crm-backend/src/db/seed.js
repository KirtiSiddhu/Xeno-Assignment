require('dotenv').config();
const { v4: uuidv4 } = require('uuid');
const { getDb, initDb, saveDb } = require('./index');

initDb();
const db = getDb();

if (db.customers.length > 0) {
  console.log('Database already seeded');
  process.exit(0);
}

const firstNames = ['Aarav', 'Vihaan', 'Vivaan', 'Ananya', 'Diya', 'Riya', 'Kavya', 'Aditya', 'Arjun', 'Sai', 'Krishna', 'Isha', 'Neha', 'Priya', 'Rahul', 'Rohit', 'Sneha', 'Pooja', 'Amit', 'Anjali'];
const lastNames = ['Sharma', 'Patel', 'Singh', 'Kumar', 'Das', 'Kaur', 'Gupta', 'Verma', 'Jain', 'Mehta', 'Reddy', 'Rao', 'Nair', 'Pillai', 'Yadav'];
const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai', 'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Surat'];
const categories = ['Tops', 'Bottoms', 'Dresses', 'Accessories', 'Footwear'];

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

for (let i = 0; i < 500; i++) {
  const id = uuidv4();
  const name = `${rand(firstNames)} ${rand(lastNames)}`;
  const gender = Math.random() > 0.5 ? 'M' : 'F';
  const total_orders = randInt(1, 6);
  
  let total_spend = 0;
  let dates = [];

  for (let j = 0; j < total_orders; j++) {
    const val = randInt(299, 12000);
    total_spend += val;
    const daysAgo = randInt(1, 200);
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    dates.push(d.toISOString());

    db.orders.push({
      id: uuidv4(),
      customer_id: id,
      order_value: val,
      status: 'completed',
      product_category: rand(categories),
      product_name: 'Product ' + randInt(1, 100),
      created_at: d.toISOString()
    });
  }

  dates.sort();
  const isVip = total_spend > 15000;
  
  db.customers.push({
    id, name, email: `customer${i}@example.com`, phone: '9' + Math.floor(Math.random()*1000000000),
    city: rand(cities), gender, age: randInt(18, 55), tags: JSON.stringify(isVip ? ['vip'] : []), created_at: dates[0]
  });

  db.customer_stats.push({
    customer_id: id,
    total_orders,
    total_spend,
    avg_order_value: total_spend / total_orders,
    first_order_date: dates[0],
    last_order_date: dates[dates.length - 1]
  });
}

saveDb();
console.log('Seeded 500 customers and their orders');
