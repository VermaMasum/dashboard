const axios = require('axios');

async function testApiDirectly() {
  try {
    console.log('🧪 Testing API directly...');

    // Test admin login
    console.log('\n1. Testing admin login:');
    try {
      const adminResponse = await axios.post('http://localhost:5000/api/auth/login', {
        username: 'admin',
        password: 'admin'
      });
      console.log('✅ Admin login works:', adminResponse.data);
    } catch (error) {
      console.log('❌ Admin login failed:', error.response?.data || error.message);
    }

    // Test employee login
    console.log('\n2. Testing employee login:');
    try {
      const employeeResponse = await axios.post('http://localhost:5000/api/auth/login', {
        username: 'employee1',
        password: 'password123'
      });
      console.log('✅ Employee login works:', employeeResponse.data);
    } catch (error) {
      console.log('❌ Employee login failed:', error.response?.data || error.message);
    }

    // Test employee auth endpoint
    console.log('\n3. Testing employee-auth endpoint:');
    try {
      const employeeAuthResponse = await axios.post('http://localhost:5000/api/employee-auth/login', {
        username: 'employee1',
        password: 'password123'
      });
      console.log('✅ Employee-auth login works:', employeeAuthResponse.data);
    } catch (error) {
      console.log('❌ Employee-auth login failed:', error.response?.data || error.message);
    }

  } catch (error) {
    console.error('❌ Error testing API:', error.message);
  }
}

testApiDirectly();


