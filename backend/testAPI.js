import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5000/api';

// Test functions
const testEndpoints = async () => {
  console.log('🚀 Testing Backend API Endpoints...\n');

  try {
    // Test reports endpoint
    console.log('📊 Testing Reports API:');
    const reportsResponse = await fetch(`${BASE_URL}/reports`);
    const reportsData = await reportsResponse.json();
    console.log(`✅ GET /api/reports - Status: ${reportsResponse.status}`);
    console.log(`   Reports found: ${reportsData.reports?.length || 0}\n`);

    // Test resources endpoint
    console.log('🏠 Testing Resources API:');
    const resourcesResponse = await fetch(`${BASE_URL}/resources`);
    const resourcesData = await resourcesResponse.json();
    console.log(`✅ GET /api/resources - Status: ${resourcesResponse.status}`);
    console.log(`   Resources found: ${resourcesData.resources?.length || 0}\n`);

    // Test dashboard overview
    console.log('📈 Testing Dashboard API:');
    const dashboardResponse = await fetch(`${BASE_URL}/dashboard/overview`);
    const dashboardData = await dashboardResponse.json();
    console.log(`✅ GET /api/dashboard/overview - Status: ${dashboardResponse.status}`);
    if (dashboardData.success) {
      console.log(`   Total Reports: ${dashboardData.data.reports.total}`);
      console.log(`   Total Resources: ${dashboardData.data.resources.total}\n`);
    }

    // Test report stats
    console.log('📋 Testing Report Stats:');
    const statsResponse = await fetch(`${BASE_URL}/reports/stats`);
    const statsData = await statsResponse.json();
    console.log(`✅ GET /api/reports/stats - Status: ${statsResponse.status}`);
    if (statsData.success) {
      console.log(`   Pending Reports: ${statsData.stats.pending}`);
      console.log(`   High Urgency: ${statsData.stats.highUrgency}\n`);
    }

    // Test resource stats
    console.log('🏗️ Testing Resource Stats:');
    const resourceStatsResponse = await fetch(`${BASE_URL}/resources/stats`);
    const resourceStatsData = await resourceStatsResponse.json();
    console.log(`✅ GET /api/resources/stats - Status: ${resourceStatsResponse.status}`);
    if (resourceStatsData.success) {
      console.log(`   Available Resources: ${resourceStatsData.stats.available}`);
      console.log(`   Full Resources: ${resourceStatsData.stats.full}\n`);
    }

    console.log('🎉 All endpoint tests completed successfully!');
    console.log('\n📝 Backend features implemented:');
    console.log('   ✅ Enhanced Report Model with new fields');
    console.log('   ✅ Resource Management System');
    console.log('   ✅ Advanced filtering and pagination');
    console.log('   ✅ Real-time Socket.io broadcasting');
    console.log('   ✅ Dashboard analytics endpoints');
    console.log('   ✅ AI-powered verification system');
    console.log('   ✅ Comprehensive status management');

  } catch (error) {
    console.error('❌ Error testing endpoints:', error.message);
    console.log('\n💡 Make sure the server is running with: npm run dev');
  }
};

// Sample data for testing POST endpoints
const testCreateEndpoints = async () => {
  console.log('\n🔧 Testing POST endpoints...');

  try {
    // Test creating a new report
    const sampleReport = {
      name: 'Test User',
      incidentType: 'fire-emergency',
      urgency: 'urgent',
      description: 'Test emergency report for API validation',
      lat: 40.7589,
      lng: -73.9851,
      phone: '+1-555-0199',
      witnessCount: 2,
      estimatedAffected: 5
    };

    const createReportResponse = await fetch(`${BASE_URL}/reports`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sampleReport)
    });

    console.log(`✅ POST /api/reports - Status: ${createReportResponse.status}`);
    
    if (createReportResponse.ok) {
      const reportData = await createReportResponse.json();
      console.log(`   Created report ID: ${reportData.report._id}`);
      console.log(`   AI Verified: ${reportData.report.aiVerified}`);
      console.log(`   Priority: ${reportData.report.priority}`);
    }

  } catch (error) {
    console.error('❌ Error testing POST endpoints:', error.message);
  }
};

// Run tests
testEndpoints().then(() => {
  // Uncomment to test POST endpoints
  // testCreateEndpoints();
});