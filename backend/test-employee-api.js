const mongoose = require('mongoose');
const axios = require('axios');
require('dotenv').config();

const employeeSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'employee' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  department: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const Employee = mongoose.model('Employee', employeeSchema);

const testEmployeeAPI = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if employees exist
    const employees = await Employee.find({});
    console.log(`📊 Found ${employees.length} employees in database:`);
    employees.forEach(emp => {
      console.log(`  - ${emp.username} (${emp.role}) - ${emp.department}`);
    });

    if (employees.length === 0) {
      console.log('❌ No employees found. Creating sample employees...');
      
      const sampleEmployees = [
        {
          username: 'john_doe',
          password: 'password123',
          role: 'employee',
          email: 'john.doe@company.com',
          phone: '+1-555-0123',
          department: 'Engineering'
        },
        {
          username: 'jane_smith',
          password: 'password123',
          role: 'employee',
          email: 'jane.smith@company.com',
          phone: '+1-555-0124',
          department: 'Marketing'
        }
      ];

      for (const empData of sampleEmployees) {
        const employee = new Employee(empData);
        await employee.save();
        console.log(`✅ Created employee: ${empData.username}`);
      }
    }

    // Test API endpoint
    console.log('\n🌐 Testing API endpoint...');
    try {
      const response = await axios.get('http://localhost:5000/api/employees');
      console.log('✅ API Response:', response.data);
    } catch (apiError) {
      console.log('❌ API Error:', apiError.message);
      if (apiError.response) {
        console.log('❌ API Error Details:', apiError.response.data);
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

testEmployeeAPI();
