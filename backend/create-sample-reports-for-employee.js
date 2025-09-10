const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Report = require('./models/Report');
require('dotenv').config();

async function createSampleReports() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find an employee user
    const employee = await User.findOne({ role: 'employee' });
    if (!employee) {
      console.log('❌ No employee found. Please create an employee user first.');
      return;
    }
    console.log('👤 Found employee:', employee.username);

    // Find a project
    const project = await Project.findOne();
    if (!project) {
      console.log('❌ No project found. Please create a project first.');
      return;
    }
    console.log('📋 Found project:', project.name);

    // Create sample reports for the employee
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const sampleReports = [
      {
        date: today,
        project: project.name,
        title: 'Daily Development Work',
        description: 'Worked on frontend components and API integration',
        hoursWorked: 8,
        employee: employee._id,
      },
      {
        date: yesterday,
        project: project.name,
        title: 'Bug Fixes and Testing',
        description: 'Fixed critical bugs and performed testing',
        hoursWorked: 6,
        employee: employee._id,
      },
    ];

    // Clear existing reports for this employee
    await Report.deleteMany({ employee: employee._id });
    console.log('🗑️ Cleared existing reports for employee');

    // Create new reports
    const createdReports = await Report.insertMany(sampleReports);
    console.log('✅ Created sample reports:', createdReports.length);

    console.log('🎉 Sample reports created successfully!');
    console.log('📊 Reports created:');
    createdReports.forEach((report, index) => {
      console.log(`  ${index + 1}. ${report.title} - ${report.date} (${report.hoursWorked}h)`);
    });

  } catch (error) {
    console.error('❌ Error creating sample reports:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

createSampleReports();

