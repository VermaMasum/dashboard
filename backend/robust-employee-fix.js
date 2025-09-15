const mongoose = require('mongoose');
const User = require('./models/User');
const Report = require('./models/Report');
const Project = require('./models/Project');
require('dotenv').config();

async function robustFix() {
  try {
    console.log('🔧 Starting robust employee fix...');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Check current state
    console.log('\n📊 Current state:');
    const users = await User.find({});
    const reports = await Report.find({});
    const projects = await Project.find({});
    
    console.log(`👥 Users: ${users.length}`);
    users.forEach(u => console.log(`  - ${u.username} (${u.role})`));
    
    console.log(`📋 Projects: ${projects.length}`);
    projects.forEach(p => console.log(`  - ${p.name}`));
    
    console.log(`📊 Reports: ${reports.length}`);
    reports.forEach(r => console.log(`  - ${r.title} - Employee: ${r.employee}`));

    // Step 2: Ensure we have an employee
    let employee = await User.findOne({ role: 'employee' });
    if (!employee) {
      console.log('\n👤 Creating employee user...');
      employee = await User.create({
        username: 'employee1',
        password: 'password123',
        role: 'employee',
        email: 'employee1@example.com',
        phone: '1234567890',
        department: 'Development'
      });
      console.log(`✅ Created employee: ${employee.username} (${employee._id})`);
    } else {
      console.log(`\n👤 Found employee: ${employee.username} (${employee._id})`);
    }

    // Step 3: Ensure we have a project
    let project = await Project.findOne();
    if (!project) {
      console.log('\n📋 Creating sample project...');
      project = await Project.create({
        name: 'Sample Project',
        description: 'A sample project for testing',
        employees: [employee._id]
      });
      console.log(`✅ Created project: ${project.name} (${project._id})`);
    } else {
      console.log(`\n📋 Found project: ${project.name} (${project._id})`);
    }

    // Step 4: Fix all reports
    console.log('\n🔧 Fixing reports...');
    
    // First, let's see what reports we have
    const allReports = await Report.find({});
    console.log(`Found ${allReports.length} reports to fix`);
    
    // Update all reports to use the correct employee and project
    const updateResult = await Report.updateMany(
      {},
      { 
        $set: { 
          employee: employee._id,
          project: project._id
        } 
      }
    );
    
    console.log(`✅ Updated ${updateResult.modifiedCount} reports`);

    // Step 5: Test the populate
    console.log('\n🧪 Testing populate...');
    const testReports = await Report.find({})
      .populate('employee', 'username role')
      .populate('project', 'name');
    
    console.log('📋 Final reports with populated data:');
    testReports.forEach((report, index) => {
      console.log(`  ${index + 1}. ${report.title || 'Untitled'}`);
      console.log(`     Employee: ${report.employee?.username || 'NULL'} (${report.employee?._id || 'NULL'})`);
      console.log(`     Project: ${report.project?.name || 'NULL'} (${report.project?._id || 'NULL'})`);
    });

    // Step 6: Verify the API endpoint
    console.log('\n🌐 Testing API endpoint...');
    const apiReports = await Report.find({})
      .populate('employee', 'username')
      .populate('project', 'name');
    
    console.log('API Response:');
    apiReports.forEach(report => {
      console.log(`  - ${report.title}: Employee=${report.employee?.username || 'NULL'}`);
    });

    console.log('\n🎉 Robust fix completed successfully!');
    console.log('👤 Employee:', employee.username);
    console.log('📋 Project:', project.name);
    console.log('📊 Reports fixed:', updateResult.modifiedCount);

  } catch (error) {
    console.error('❌ Error during robust fix:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

robustFix();






