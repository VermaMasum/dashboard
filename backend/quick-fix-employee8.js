const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Report = require('./models/Report');
require('dotenv').config();

async function quickFixEmployee8() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Ensure employee8 exists
    let employee8 = await User.findOne({ username: 'employee8' });
    if (!employee8) {
      employee8 = await User.create({
        username: 'employee8',
        password: 'password123',
        role: 'employee',
        email: 'employee8@gmail.com',
        phone: '8888888888',
        department: 'HR'
      });
      console.log('✅ Created employee8');
    } else {
      console.log('✅ Found employee8:', employee8.username);
    }

    // Create a project and assign employee8 to it
    let project = await Project.findOne({ name: 'Dashboard' });
    if (!project) {
      project = await Project.create({
        name: 'Dashboard',
        description: 'Admin Dashboard Project',
        employees: [employee8._id]
      });
      console.log('✅ Created Dashboard project');
    } else {
      // Ensure employee8 is assigned
      if (!project.employees.includes(employee8._id)) {
        project.employees.push(employee8._id);
        await project.save();
        console.log('✅ Added employee8 to Dashboard project');
      }
    }

    // Create a sample report for employee8
    const today = new Date();
    const existingReport = await Report.findOne({ employee: employee8._id });
    
    if (!existingReport) {
      await Report.create({
        date: today,
        project: project.name,
        employee: employee8._id,
        title: 'Daily Development Work',
        details: 'Worked on dashboard components',
        hoursWorked: 8
      });
      console.log('✅ Created sample report for employee8');
    }

    // Test the API response
    console.log('\n🧪 Testing API for employee8...');
    const testReports = await Report.find({ employee: employee8._id })
      .populate('employee', 'username')
      .populate('project', 'name');
    
    console.log('📊 Reports for employee8:', testReports.length);
    testReports.forEach(report => {
      console.log(`  - ${report.title}: ${report.hoursWorked}h`);
    });

    console.log('\n🎉 Employee8 setup complete! Dashboard should now work.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

quickFixEmployee8();

