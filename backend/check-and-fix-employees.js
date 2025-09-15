const mongoose = require('mongoose');
const User = require('./models/User');
const Report = require('./models/Report');
require('dotenv').config();

async function checkAndFixEmployees() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check if there are any employee users
    const employees = await User.find({ role: 'employee' });
    console.log(`👥 Found ${employees.length} employees:`);
    employees.forEach((emp, index) => {
      console.log(`  ${index + 1}. ${emp.username} (${emp._id})`);
    });

    if (employees.length === 0) {
      console.log('❌ No employees found. Creating sample employee...');
      
      // Create a sample employee
      const sampleEmployee = await User.create({
        username: 'employee1',
        password: 'password123',
        role: 'employee',
        email: 'employee1@example.com',
        phone: '1234567890',
        department: 'Development'
      });
      
      console.log('✅ Created sample employee:', sampleEmployee.username);
      employees.push(sampleEmployee);
    }

    // Check all reports
    const reports = await Report.find({});
    console.log(`\n📊 Found ${reports.length} reports:`);
    
    reports.forEach((report, index) => {
      console.log(`  ${index + 1}. ${report.title || 'Untitled'} - Employee ID: ${report.employee}`);
    });

    // Update all reports to use the first available employee
    if (reports.length > 0 && employees.length > 0) {
      const firstEmployee = employees[0];
      console.log(`\n🔧 Updating all reports to use employee: ${firstEmployee.username}`);
      
      const updateResult = await Report.updateMany(
        {},
        { $set: { employee: firstEmployee._id } }
      );
      
      console.log(`✅ Updated ${updateResult.modifiedCount} reports`);
      
      // Verify the updates
      const updatedReports = await Report.find({}).populate('employee', 'username role');
      console.log('\n📋 Updated reports:');
      updatedReports.forEach((report, index) => {
        console.log(`  ${index + 1}. ${report.title || 'Untitled'} - Employee: ${report.employee?.username || 'Unknown'}`);
      });
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

checkAndFixEmployees();






