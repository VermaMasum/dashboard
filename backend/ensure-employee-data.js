const mongoose = require('mongoose');
const User = require('./models/User');
const Report = require('./models/Report');
const Project = require('./models/Project');
require('dotenv').config();

async function ensureEmployeeData() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Ensure we have an employee user
    let employee = await User.findOne({ role: 'employee' });
    if (!employee) {
      console.log('👤 Creating employee user...');
      employee = await User.create({
        username: 'employee1',
        password: 'password123',
        role: 'employee',
        email: 'employee1@example.com',
        phone: '1234567890',
        department: 'Development'
      });
      console.log(`✅ Created employee: ${employee.username}`);
    } else {
      console.log(`👤 Found employee: ${employee.username}`);
    }

    // Step 2: Ensure we have a project
    let project = await Project.findOne();
    if (!project) {
      console.log('📋 Creating sample project...');
      project = await Project.create({
        name: 'Sample Project',
        description: 'A sample project for testing',
        employees: [employee._id]
      });
      console.log(`✅ Created project: ${project.name}`);
    } else {
      console.log(`📋 Found project: ${project.name}`);
    }

    // Step 3: Clear and recreate reports with proper references
    console.log('🗑️ Clearing existing reports...');
    await Report.deleteMany({});

    console.log('📊 Creating sample reports...');
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
      .populate('employee', 'username role')
      .populate('project', 'name');

    console.log('📋 Final reports:');
    testReports.forEach((report, index) => {
      console.log(`  ${index + 1}. ${report.title}`);
      console.log(`     Employee: ${report.employee?.username || 'NULL'}`);
      console.log(`     Project: ${report.project?.name || 'NULL'}`);
    });

    console.log('\n🎉 Data setup complete!');
    console.log('👤 Employee:', employee.username);
    console.log('📋 Project:', project.name);
    console.log('📊 Reports:', testReports.length);

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

ensureEmployeeData();






