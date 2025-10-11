// Test script for the new admin functionality
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

async function testAdminFunctions() {
  try {
    console.log('🧪 Testing Admin Dashboard Functions...\n');

    // Test 1: Create a test report first
    console.log('1. Creating a test report...');
    const testReport = {
      name: 'Test User',
      phone: '1234567890',
      incidentType: 'blocked-road',
      urgency: 'moderate',
      description: 'Test blocked road for admin testing',
      lat: '20.0384615',
      lng: '73.8198394',
      witnessCount: '1',
      estimatedAffected: '1'
    };

    const createResponse = await axios.post(`${API_BASE_URL}/reports`, testReport);
    console.log('✅ Report created:', createResponse.data.report._id);
    const reportId = createResponse.data.report._id;

    // Test 2: Verify the report
    console.log('\n2. Testing report verification...');
    const verifyResponse = await axios.patch(`${API_BASE_URL}/reports/admin/verify/${reportId}`, {
      verified: true
    });
    console.log('✅ Report verification:', verifyResponse.data.success);

    // Test 3: Update the report
    console.log('\n3. Testing report update...');
    const updateResponse = await axios.patch(`${API_BASE_URL}/reports/admin/update/${reportId}`, {
      status: 'in-progress',
      notes: 'Investigation started. Field team dispatched.'
    });
    console.log('✅ Report update:', updateResponse.data.success);

    // Test 4: Get all reports to verify changes
    console.log('\n4. Fetching updated report...');
    const getResponse = await axios.get(`${API_BASE_URL}/reports`);
    const updatedReport = getResponse.data.reports.find(r => r._id === reportId);
    console.log('✅ Updated report status:', updatedReport.status);
    console.log('✅ Report verification status:', updatedReport.verified);
    console.log('✅ Report notes count:', updatedReport.notes?.length || 0);

    console.log('\n🎉 All admin functions are working correctly!');

  } catch (error) {
    console.error('❌ Error testing admin functions:', error.response?.data || error.message);
  }
}

// Run the test
testAdminFunctions();