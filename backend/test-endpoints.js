/**
 * Quick test script for Career Boost AI API endpoints
 * Run with: node test-endpoints.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';
let authToken = '';
let userId = '';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

async function testEndpoint(name, fn) {
  try {
    log.info(`Testing: ${name}`);
    await fn();
    log.success(`${name} - PASSED`);
    return true;
  } catch (error) {
    log.error(`${name} - FAILED`);
    console.error(`  Error: ${error.response?.data?.message || error.message}`);
    return false;
  }
}

async function runTests() {
  console.log('\n🚀 Starting API Endpoint Tests\n');
  
  let passed = 0;
  let failed = 0;

  // Test 1: Health Check
  if (await testEndpoint('Health Check', async () => {
    const response = await axios.get(`${BASE_URL.replace('/api', '')}/health`);
    if (!response.data.success) throw new Error('Health check failed');
  })) passed++; else failed++;

  // Test 2: Signup
  if (await testEndpoint('User Signup', async () => {
    const response = await axios.post(`${BASE_URL}/auth/signup`, {
      email: `test${Date.now()}@example.com`,
      password: 'Test@1234',
      firstName: 'Test',
      lastName: 'User'
    });
    if (!response.data.success) throw new Error('Signup failed');
    authToken = response.data.data.tokens.accessToken;
    userId = response.data.data.user.id;
    log.info(`  Token: ${authToken.substring(0, 20)}...`);
  })) passed++; else failed++;

  // Test 3: Get Profile
  if (await testEndpoint('Get Profile', async () => {
    const response = await axios.get(`${BASE_URL}/auth/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data.success) throw new Error('Get profile failed');
    log.info(`  User: ${response.data.data.user.email}`);
  })) passed++; else failed++;

  // Test 4: Update Preferences
  if (await testEndpoint('Update Preferences', async () => {
    const response = await axios.put(
      `${BASE_URL}/auth/profile/preferences`,
      {
        notifications: {
          email: true,
          jobAlerts: false,
          marketingCommunications: true
        }
      },
      {
        headers: { Authorization: `Bearer ${authToken}` }
      }
    );
    if (!response.data.success) throw new Error('Update preferences failed');
  })) passed++; else failed++;

  // Test 5: Job Recommendations
  if (await testEndpoint('Get Job Recommendations', async () => {
    const response = await axios.get(`${BASE_URL}/jobs/recommendations`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data.success) throw new Error('Get recommendations failed');
    log.info(`  Jobs found: ${response.data.data.jobs?.length || 0}`);
  })) passed++; else failed++;

  // Test 6: Search Jobs
  if (await testEndpoint('Search Jobs', async () => {
    const response = await axios.get(`${BASE_URL}/jobs/search?query=developer`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (!response.data.success) throw new Error('Search jobs failed');
  })) passed++; else failed++;

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log(`\n📊 Test Results:`);
  console.log(`   ${colors.green}Passed: ${passed}${colors.reset}`);
  console.log(`   ${colors.red}Failed: ${failed}${colors.reset}`);
  console.log(`   Total: ${passed + failed}`);
  console.log(`   Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%\n`);

  if (failed === 0) {
    log.success('All tests passed! 🎉');
  } else {
    log.warn('Some tests failed. Check the errors above.');
  }
}

// Run tests
runTests().catch(error => {
  log.error('Test suite failed to run');
  console.error(error);
  process.exit(1);
});
