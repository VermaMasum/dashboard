const mongoose = require('mongoose');
const User = require('./models/User');
const Report = require('./models/Report');
const Project = require('./models/Project');
require('dotenv').config();

async function testReportsAPI() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Check what we have in the database
    console.log('\n📊 Database state:');
    
    const users = await User.find({});
    console.log(`👥 Users (${users.length}):`);
    users.forEach(u => console.log(`  - ${u.username} (${u.role}) - ID: ${u._id}`));
    
    const projects = await Project.find({});
    console.log(`\n📋 Projects (${projects.length}):`);
    projects.forEach(p => console.log(`  - ${p.name} - ID: ${p._id}`));
    
    const reports = await Report.find({});
    console.log(`\n📊 Reports (${reports.length}):`);
    reports.forEach(r => console.log(`  - ${r.title} - Employee ID: ${r.employee} - Project ID: ${r.project}`));

    // Test the populate
    console.log('\n🧪 Testing populate...');
    const populatedReports = await Report.find({})
      .populate('employee', 'username role')
      .populate('project', 'name');
    
    console.log('📋 Populated reports:');
    populatedReports.forEach((report, index) => {
      console.log(`  ${index + 1}. ${report.title || 'Untitled'}`);
      console.log(`     Employee: ${report.employee?.username || 'NULL'} (${report.employee?._id || 'NULL'})`);
      console.log(`     Project: ${report.project?.name || 'NULL'} (${report.project?._id || 'NULL'})`);
    });

    // Test the exact API query
    console.log('\n🌐 Testing API query...');
    const apiQuery = {};
    const apiReports = await Report.find(apiQuery)
      .populate("project", "name")
      .populate("employee", "username");
    
    console.log('📡 API Response:');
    console.log(JSON.stringify(apiReports, null, 2));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

testReportsAPI();

