const axios = require('axios');

async function testEmployeeAuth() {
  try {
    console.log('🧪 Testing Employee Authentication...');
    
    // Test employee login
    const response = await axios.post('http://localhost:5000/api/employee-auth/login', {
      username: 'john_doe',
      password: 'password123'
    });
    
    console.log('✅ Employee login successful!');
    console.log('Response:', response.data);
    
    // Test with invalid credentials
    try {
      await axios.post('http://localhost:5000/api/employee-auth/login', {
        username: 'john_doe',
        password: 'wrongpassword'
      });
    } catch (error) {
      console.log('✅ Invalid credentials properly rejected');
      console.log('Error:', error.response?.data);
    }
    
  } catch (error) {
    console.error('❌ Employee auth test failed:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received. Is the backend server running?');
    } else {
      console.error('Error:', error.message);
    }
  }
}

testEmployeeAuth();

