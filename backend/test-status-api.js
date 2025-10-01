const axios = require('axios');

// Test the status update API
async function testStatusAPI() {
  try {
    console.log('🧪 Testing Project Status API...');
    
    // Replace with your actual server URL and project ID
    const baseURL = 'http://localhost:5000/api';
    const projectId = 'YOUR_PROJECT_ID_HERE'; // Replace with actual project ID
    const authToken = 'YOUR_AUTH_TOKEN_HERE'; // Replace with actual auth token
    
    // Test updating project status
    const response = await axios.put(`${baseURL}/projects/${projectId}`, {
      status: 'in progress'
    }, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('✅ Status update successful!');
    console.log('📊 Updated project:', response.data);

  } catch (error) {
    console.error('❌ Error testing status API:', error.response?.data || error.message);
  }
}

// Uncomment the line below to run the test
// testStatusAPI();

console.log('📝 To test the status API:');
console.log('1. Update the projectId and authToken variables');
console.log('2. Uncomment the testStatusAPI() call');
console.log('3. Run: node test-status-api.js');

