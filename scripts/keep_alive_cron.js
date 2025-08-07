// keep_alive_cron.js
// Simple Node.js script to ping the Polycon on Render app every 5-10 minutes

const fetch = require('node-fetch');

const BASE_URL = process.env.KEEP_ALIVE_URL || 'https://polycon.onrender.com';
const PING_URL = `${BASE_URL}/ping`;

async function ping() {
  try {
    const startTime = Date.now();
    const res = await fetch(PING_URL, {
      method: 'GET',
      timeout: 30000, // 30 second timeout
      headers: {
        'User-Agent': 'Polycon-KeepAlive/1.0'
      }
    });
    
    const responseTime = Date.now() - startTime;
    const responseText = await res.text();
    
    if (res.ok) {
      console.log(`✅ ${new Date().toISOString()} - Pinged ${PING_URL} - Status: ${res.status} - Response time: ${responseTime}ms`);
      console.log(`📝 Response: ${responseText}`);
    } else {
      console.warn(`⚠️ ${new Date().toISOString()} - Ping failed - Status: ${res.status} - Response: ${responseText}`);
    }
    
  } catch (err) {
    console.error(`❌ ${new Date().toISOString()} - Error pinging ${PING_URL}:`, err.message);
  }
}

// Log startup
console.log(`🚀 Keep-alive cron started - Will ping ${PING_URL} every 5 minutes`);
console.log(`⏰ Started at: ${new Date().toISOString()}`);

// Ping immediately, then every 5 minutes
ping();
setInterval(ping, 5 * 60 * 1000); // 5 minutes
