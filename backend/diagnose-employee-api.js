const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superAdmin', 'employee'], required: true },
});

const employeeSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'employee' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  department: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Employee = mongoose.model('Employee', employeeSchema);

const diagnoseEmployeeAPI = async () => {
  console.log('🔍 DIAGNOSING EMPLOYEE API ISSUES...\n');

  try {
    // Step 1: Connect to MongoDB
    console.log('1️⃣ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully\n');

    // Step 2: Check if admin users exist
    console.log('2️⃣ Checking admin users...');
    const adminUsers = await User.find({ role: { $in: ['admin', 'superAdmin'] } });
    console.log(`Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(user => {
      console.log(`  - ${user.username} (${user.role})`);
    });
    console.log('');

    // Step 3: Check if employees exist
    console.log('3️⃣ Checking employees...');
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees:`);
    employees.forEach(emp => {
      console.log(`  - ${emp.username} (${emp.role}) - ${emp.department}`);
    });
    console.log('');

    // Step 4: Create sample data if missing
    if (adminUsers.length === 0) {
      console.log('⚠️ No admin users found. Creating sample users...');
      const admin = new User({ username: 'admin', password: 'admin', role: 'admin' });
      await admin.save();
      console.log('✅ Created admin user');
    }

    if (employees.length === 0) {
      console.log('⚠️ No employees found. Creating sample employees...');
      const sampleEmployees = [
        { username: 'john_doe', password: 'password123', role: 'employee', email: 'john@company.com', phone: '+1-555-0123', department: 'Engineering' },
        { username: 'jane_smith', password: 'password123', role: 'employee', email: 'jane@company.com', phone: '+1-555-0124', department: 'Marketing' }
      ];
      
      for (const empData of sampleEmployees) {
        const employee = new Employee(empData);
        await employee.save();
        console.log(`✅ Created employee: ${empData.username}`);
      }
    }

    // Step 5: Test authentication
    console.log('\n4️⃣ Testing authentication...');
    try {
      const loginResponse = await axios.post('http://localhost:5000/api/auth/login', {
        username: 'admin',
        password: 'admin'
      });
      console.log('✅ Login successful');
      const token = loginResponse.data.token;
      console.log(`Token: ${token.substring(0, 20)}...`);

      // Step 6: Test employee API with authentication
      console.log('\n5️⃣ Testing employee API...');
      try {
        const employeeResponse = await axios.get('http://localhost:5000/api/employees', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        console.log('✅ Employee API working!');
        console.log(`Found ${employeeResponse.data.length} employees via API`);
        employeeResponse.data.forEach(emp => {
          console.log(`  - ${emp.username} (${emp.role})`);
        });
      } catch (apiError) {
        console.log('❌ Employee API failed:');
        console.log(`Status: ${apiError.response?.status}`);
        console.log(`Message: ${apiError.response?.data?.message}`);
        console.log(`Full error:`, apiError.response?.data);
      }

    } catch (authError) {
      console.log('❌ Authentication failed:');
      console.log(`Status: ${authError.response?.status}`);
      console.log(`Message: ${authError.response?.data?.message}`);
    }

    // Step 7: Check server status
    console.log('\n6️⃣ Checking server status...');
    try {
      const serverResponse = await axios.get('http://localhost:5000/');
      console.log('✅ Backend server is running');
      console.log(`Response: ${serverResponse.data}`);
    } catch (serverError) {
      console.log('❌ Backend server is not running or not accessible');
      console.log('Please start the server with: node server.js');
    }

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔍 Diagnosis complete!');
  }
};

diagnoseEmployeeAPI();
