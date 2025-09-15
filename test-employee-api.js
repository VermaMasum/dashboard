const axios = require('axios');

async function testEmployeeAPI() {
  try {
    console.log('🧪 Testing Employee API...');
    
    // Test login
    const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
      username: 'admin',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test getting employees
    const employeesResponse = await axios.get('http://localhost:5000/api/users?role=employee', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('👥 Employees found:', employeesResponse.data.length);
    employeesResponse.data.forEach(emp => {
      console.log(`  - ${emp.username} (${emp._id})`);
    });
    
    // Test getting reports
    const reportsResponse = await axios.get('http://localhost:5000/api/reports', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    
    console.log('📊 Reports found:', reportsResponse.data.length);
    reportsResponse.data.forEach(report => {
      console.log(`  - ${report.title || 'Untitled'} - Employee: ${report.employee?.username || 'Unknown'} (${report.employee})`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

testEmployeeAPI();






