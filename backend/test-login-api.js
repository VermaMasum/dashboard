const axios = require('axios');

async function testLoginApi() {
  try {
    console.log('🧪 Testing Login API...');

    // Test employee1 login
    console.log('\n1. Testing employee1 login:');
    const response = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'employee1',
      password: 'password123'
    });
    
    console.log('✅ SUCCESS!');
    console.log('Response:', response.data);
    console.log('Token:', response.data.token ? 'Present' : 'Missing');

  } catch (error) {
    console.log('❌ FAILED!');
    console.log('Status:', error.response?.status);
    console.log('Error:', error.response?.data || error.message);
  }
}

testLoginApi();


