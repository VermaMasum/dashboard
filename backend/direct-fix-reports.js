const mongoose = require('mongoose');
const User = require('./models/User');
const Report = require('./models/Report');
require('dotenv').config();

async function directFixReports() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // First, let's see what we have
    console.log('\n🔍 Checking current state...');
    
    const allUsers = await User.find({});
    console.log(`👥 Total users: ${allUsers.length}`);
    allUsers.forEach(user => {
      console.log(`  - ${user.username} (${user.role}) - ID: ${user._id}`);
    });

    const allReports = await Report.find({});
    console.log(`\n📊 Total reports: ${allReports.length}`);
    allReports.forEach(report => {
      console.log(`  - ${report.title || 'Untitled'} - Employee ID: ${report.employee}`);
    });

    // Find or create an employee user
    let employeeUser = await User.findOne({ role: 'employee' });
    
    if (!employeeUser) {
      console.log('\n👤 No employee found, creating one...');
      employeeUser = await User.create({
        username: 'employee1',
        password: 'password123',
        role: 'employee',
        email: 'employee1@example.com',
        phone: '1234567890',
        department: 'Development'
      });
      console.log(`✅ Created employee: ${employeeUser.username} (${employeeUser._id})`);
    } else {
      console.log(`\n👤 Found employee: ${employeeUser.username} (${employeeUser._id})`);
    }

    // Update all reports to use this employee
    if (allReports.length > 0) {
      console.log('\n🔧 Updating all reports...');
      
      const updateResult = await Report.updateMany(
        {},
        { $set: { employee: employeeUser._id } }
      );
      
      console.log(`✅ Updated ${updateResult.modifiedCount} reports`);
    }

    // Test the populate
    console.log('\n🧪 Testing populate...');
    const testReports = await Report.find({})
      .populate('employee', 'username role')
      .populate('project', 'name');
    
    console.log('📋 Reports with populated data:');
    testReports.forEach((report, index) => {
      console.log(`  ${index + 1}. ${report.title || 'Untitled'}`);
      console.log(`     Employee: ${report.employee?.username || 'NULL'} (${report.employee?._id || 'NULL'})`);
      console.log(`     Project: ${report.project?.name || 'NULL'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Disconnected from MongoDB');
  }
}

directFixReports();

