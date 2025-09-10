const mongoose = require('mongoose');
const User = require('./models/User');
const Report = require('./models/Report');
require('dotenv').config();

async function quickFix() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create employee
    let employee = await User.findOne({ role: 'employee' });
    if (!employee) {
      employee = await User.create({
        username: 'employee1',
        password: 'password123',
        role: 'employee',
        email: 'employee1@example.com',
        phone: '1234567890',
        department: 'Development'
      });
      console.log('✅ Created employee:', employee.username);
    } else {
      console.log('✅ Found employee:', employee.username);
    }

    // Update all reports to use this employee
    const result = await Report.updateMany(
      {},
      { $set: { employee: employee._id } }
    );
    
    console.log(`✅ Updated ${result.modifiedCount} reports`);

    // Verify
    const reports = await Report.find({}).populate('employee', 'username');
    console.log('📊 Reports now show:');
    reports.forEach((report, i) => {
      console.log(`  ${i+1}. ${report.title} - Employee: ${report.employee?.username || 'NULL'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

quickFix();

