const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Report = require('./models/Report');
require('dotenv').config();

async function setupEmployee8Projects() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Find employee8
    const employee8 = await User.findOne({ username: 'employee8' });
    if (!employee8) {
      console.log('❌ Employee8 not found. Creating...');
      const newEmployee8 = await User.create({
        username: 'employee8',
        password: 'password123',
        role: 'employee',
        email: 'employee8@gmail.com',
        phone: '8888888888',
        department: 'HR'
      });
      console.log('✅ Created employee8');
      return;
    }

    console.log(`👤 Found employee8: ${employee8.username} (${employee8._id})`);

    // Find or create projects
    let project1 = await Project.findOne({ name: 'Dashboard' });
    if (!project1) {
      project1 = await Project.create({
        name: 'Dashboard',
        description: 'Admin Dashboard Project',
        employees: [employee8._id]
      });
      console.log('✅ Created Dashboard project');
    } else {
      // Add employee8 to the project if not already assigned
      if (!project1.employees.includes(employee8._id)) {
        project1.employees.push(employee8._id);
        await project1.save();
        console.log('✅ Added employee8 to Dashboard project');
      }
    }

    let project2 = await Project.findOne({ name: 'AI summarizer' });
    if (!project2) {
      project2 = await Project.create({
        name: 'AI summarizer',
        description: 'AI Blog Summarizer Project',
        employees: [employee8._id]
      });
      console.log('✅ Created AI summarizer project');
    } else {
      // Add employee8 to the project if not already assigned
      if (!project2.employees.includes(employee8._id)) {
        project2.employees.push(employee8._id);
        await project2.save();
        console.log('✅ Added employee8 to AI summarizer project');
      }
    }

    // Create some sample reports for employee8
    const today = new Date();
    const existingReports = await Report.find({ employee: employee8._id });
    
    if (existingReports.length === 0) {
      const reports = await Report.create([
        {
          date: today,
          project: project1.name,
          employee: employee8._id,
          title: 'Dashboard Development',
          details: 'Worked on dashboard components',
          hoursWorked: 8
        },
        {
          date: today,
          project: project2.name,
          employee: employee8._id,
          title: 'AI Feature Implementation',
          details: 'Implemented AI summarization feature',
          hoursWorked: 6
        }
      ]);
      console.log(`✅ Created ${reports.length} sample reports for employee8`);
    }

    // Verify the setup
    console.log('\n📊 Final setup for employee8:');
    const projects = await Project.find({ employees: employee8._id }).populate('employees', 'username');
    const reports = await Report.find({ employee: employee8._id }).populate('employee', 'username');

    console.log('📋 Projects assigned to employee8:');
    projects.forEach(project => {
      console.log(`  - ${project.name}: ${project.employees.map(emp => emp.username).join(', ')}`);
    });

    console.log('\n📊 Reports by employee8:');
    reports.forEach(report => {
      console.log(`  - ${report.title} (${report.hoursWorked}h) on ${report.project}`);
    });

    console.log('\n🎉 Employee8 setup complete!');
    console.log('👤 Employee8 can now login and see their assigned projects and reports.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

setupEmployee8Projects();

