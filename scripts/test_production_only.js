// Quick test for production ping endpoint only
const fetch = require('node-fetch');

async function testProductionPing() {
  console.log('🧪 Testing production /ping endpoint...');
  
  try {
    const url = 'https://polycon.onrender.com/ping';
    console.log(`Pinging: ${url}`);
    
    const startTime = Date.now();
    const res = await fetch(url, {
      method: 'GET',
      timeout: 15000,
      headers: { 'User-Agent': 'Polycon-KeepAlive-Test/1.0' }
    });
    
    const responseTime = Date.now() - startTime;
    const responseText = await res.text();
    
    if (res.ok) {
      console.log(`✅ SUCCESS! Status: ${res.status} - ${responseTime}ms`);
      console.log(`📝 Response: ${responseText}`);
      console.log('🎉 Your cron job will now work!');
    } else {
      console.log(`❌ FAILED! Status: ${res.status} - ${responseTime}ms`);
      console.log(`📝 Response: ${responseText}`);
      console.log('🚨 Render hasn\'t deployed the changes yet');
    }
    
  } catch (err) {
    console.log(`❌ ERROR: ${err.message}`);
  }
}

testProductionPing();
