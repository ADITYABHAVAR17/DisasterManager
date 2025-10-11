import axios from 'axios';

const testData = {
  name: 'Test User',
  phone: '09021746876',
  incidentType: 'blocked-road', // Fixed: using hyphen instead of underscore
  urgency: 'moderate', // Fixed: using moderate instead of medium
  description: 'Test route block',
  lat: '20.0384615',
  lng: '73.8198394',
  additionalContact: '',
  witnessCount: '1',
  estimatedAffected: '1'
};

async function testSubmission() {
  try {
    console.log('Testing form submission with corrected data:');
    console.log(JSON.stringify(testData, null, 2));
    
    const response = await axios.post('http://localhost:5000/api/reports', testData);
    console.log('✅ Success:', response.data);
  } catch (error) {
    console.log('❌ Error:', error.response?.data || error.message);
  }
}

testSubmission();