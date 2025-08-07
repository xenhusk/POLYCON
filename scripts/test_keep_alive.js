// test_keep_alive.js
// Test script for keep-alive functionality

const fetch = require('node-fetch');

// Test both local and production
const URLS_TO_TEST = [
  'http://localhost:5001',  // Local backend
  'https://polycon.onrender.com'  // Production
];

async function testPing(baseUrl) {
  console.log(`\n🧪 Testing ${baseUrl}...`);
  
  const endpoints = [
    { path: '/health', name: 'Health Check' },
    { path: '/ping', name: 'Keep-Alive Ping' },
    { path: '/', name: 'Root' }
  ];
  
  for (const endpoint of endpoints) {
    try {
      const url = `${baseUrl}${endpoint.path}`;
      console.log(`   Testing ${endpoint.name}: ${url}`);
      
      const startTime = Date.now();
      const res = await fetch(url, {
        method: 'GET',
        timeout: 10000,
        headers: { 'User-Agent': 'Polycon-KeepAlive-Test/1.0' }
      });
      
      const responseTime = Date.now() - startTime;
      const responseText = await res.text();
      
      if (res.ok) {
        console.log(`   ✅ ${endpoint.name} - Status: ${res.status} - ${responseTime}ms`);
        if (responseText.length < 200) {
          console.log(`   📝 Response: ${responseText}`);
        } else {
          console.log(`   📝 Response: ${responseText.substring(0, 100)}...`);
        }
      } else {
        console.log(`   ❌ ${endpoint.name} - Status: ${res.status}`);
      }
      
    } catch (err) {
      console.log(`   ❌ ${endpoint.name} - Error: ${err.message}`);
    }
  }
}

async function runTests() {
  console.log('🚀 Starting Keep-Alive Tests...');
  console.log(`⏰ Test started at: ${new Date().toISOString()}`);
  
  for (const url of URLS_TO_TEST) {
    await testPing(url);
  }
  
  console.log('\n✅ Tests completed!');
}

// Run tests
runTests().catch(console.error);
