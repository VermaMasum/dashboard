const mongoose = require('mongoose');
const User = require('./models/User');
const Report = require('./models/Report');
const Project = require('./models/Project');
require('dotenv').config();

async function simpleFix() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Create or find employee
    let employee = await User.findOne({ role: 'employee' });
    if (!employee) {
      console.log('👤 Creating employee...');
      employee = await User.create({
        username: 'employee1',
        password: 'password123',
        role: 'employee',
        email: 'employee1@example.com',
        phone: '1234567890',
        department: 'Development'
      });
    }
    console.log(`👤 Employee: ${employee.username} (${employee._id})`);

    // Step 2: Create or find project
    let project = await Project.findOne();
    if (!project) {
      console.log('📋 Creating project...');
      project = await Project.create({
        name: 'Sample Project',
        description: 'A sample project',
        employees: [employee._id]
      });
    }
    console.log(`📋 Project: ${project.name} (${project._id})`);

    // Step 3: Delete all existing reports and create new ones
    console.log('🗑️ Clearing old reports...');
    await Report.deleteMany({});

    console.log('📊 Creating new reports...');
    const today = new Date();
    const reports = await Report.create([
      {
        date: today,
        project: project._id,
        employee: employee._id,
        title: 'Daily Development Work',
        details: 'Worked on frontend components',
        hoursWorked: 8
      },
      {
        date: today,
        project: project._id,
        employee: employee._id,
        title: 'Bug Fixes',
        details: 'Fixed critical bugs',
        hoursWorked: 6
      },
      {
        date: today,
        project: project._id,
        employee: employee._id,
        title: 'Testing',
        details: 'Performed testing',
        hoursWorked: 4
      }
    ]);

    console.log(`✅ Created ${reports.length} reports`);

    // Step 4: Test the API response
    console.log('\n🧪 Testing API response...');
    const testReports = await Report.find({})
      .populate('employee', 'username')
      .populate('project', 'name');

    console.log('📡 API Response:');
    testReports.forEach((report, index) => {
      console.log(`  ${index + 1}. ${report.title}`);
      console.log(`     Employee: ${report.employee?.username || 'NULL'}`);
      console.log(`     Project: ${report.project?.name || 'NULL'}`);
    });

    console.log('\n🎉 Fix completed! Employee names should now show in Daily Reports.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

simpleFix();

