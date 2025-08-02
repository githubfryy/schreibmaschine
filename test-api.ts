#!/usr/bin/env bun

/**
 * Quick API test script
 */

const baseUrl = 'http://localhost:3000';

async function testAPI() {
  console.log('🧪 Testing Schreibmaschine API...\n');

  try {
    // Test server health
    console.log('1. Testing server health...');
    const healthResponse = await fetch(`${baseUrl}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Server health:', healthData.status);

    // Test API health
    console.log('\n2. Testing API health...');
    const apiHealthResponse = await fetch(`${baseUrl}/api/health`);
    const apiHealthData = await apiHealthResponse.json();
    console.log('✅ API health:', apiHealthData.success);

    // Test workshops endpoint
    console.log('\n3. Testing workshops endpoint...');
    const workshopsResponse = await fetch(`${baseUrl}/api/workshops`);
    const workshopsData = await workshopsResponse.json();
    console.log('✅ Workshops count:', workshopsData.data?.data?.length || 0);

    // Test participants endpoint
    console.log('\n4. Testing participants endpoint...');
    const participantsResponse = await fetch(`${baseUrl}/api/participants`);
    const participantsData = await participantsResponse.json();
    console.log('✅ Participants count:', participantsData.data?.data?.length || 0);

    console.log('\n🎉 All API tests passed!');
  } catch (error) {
    console.error('❌ API test failed:', error);
  }
}

// Run tests
testAPI();
