const mongoose = require('mongoose');
const User = require('./models/User');
const Report = require('./models/Report');
const Project = require('./models/Project');
require('dotenv').config();

async function setupProjectsWithEmployees() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Create or find employees
    let employee1 = await User.findOne({ username: 'employee1' });
    if (!employee1) {
      employee1 = await User.create({
        username: 'employee1',
        password: 'password123',
        role: 'employee',
        email: 'employee1@example.com',
        phone: '1234567890',
        department: 'Development'
      });
      console.log('✅ Created employee1');
    }

    let employee2 = await User.findOne({ username: 'employee2' });
    if (!employee2) {
      employee2 = await User.create({
        username: 'employee2',
        password: 'password123',
        role: 'employee',
        email: 'employee2@example.com',
        phone: '1234567891',
        department: 'Testing'
      });
      console.log('✅ Created employee2');
    }

    // Step 2: Clear existing projects and reports
    await Project.deleteMany({});
    await Report.deleteMany({});

    // Step 3: Create projects with assigned employees
    const projects = await Project.create([
      {
        name: 'Dashboard',
        description: 'Admin Dashboard Project',
        employees: [employee1._id, employee2._id]
      },
      {
        name: 'AI summarizer',
        description: 'AI Blog Summarizer Project',
        employees: [employee1._id]
      },
      {
        name: 'Reel-eats',
        description: 'Multi-cuisine Restaurant App',
        employees: [employee2._id]
      },
      {
        name: 'Beet',
        description: 'Fitness Tracker App',
        employees: [employee1._id, employee2._id]
      }
    ]);

    console.log(`✅ Created ${projects.length} projects with assigned employees`);

    // Step 4: Create sample reports
    const today = new Date();
    const reports = await Report.create([
      {
        date: today,
        project: projects[0]._id, // Dashboard
        employee: employee1._id,
        title: 'Admin Dashboard Development',
        details: 'Worked on dashboard components',
        hoursWorked: 8
      },
      {
        date: today,
        project: projects[1]._id, // AI summarizer
        employee: employee1._id,
        title: 'AI Summary Feature',
        details: 'Implemented AI summarization',
        hoursWorked: 6
      },
      {
        date: today,
        project: projects[0]._id, // Dashboard
        employee: employee2._id,
        title: 'Dashboard Testing',
        details: 'Tested dashboard functionality',
        hoursWorked: 4
      }
    ]);

    console.log(`✅ Created ${reports.length} sample reports`);

    // Step 5: Verify the setup
    console.log('\n📊 Final setup:');
    const finalProjects = await Project.find({}).populate('employees', 'username');
    const finalReports = await Report.find({}).populate('employee', 'username').populate('project', 'name');

    console.log('📋 Projects with assigned employees:');
    finalProjects.forEach(project => {
      console.log(`  - ${project.name}: ${project.employees.map(emp => emp.username).join(', ')}`);
    });

    console.log('\n📊 Reports:');
    finalReports.forEach(report => {
      console.log(`  - ${report.title}: ${report.employee?.username} on ${report.project?.name}`);
    });

    console.log('\n🎉 Setup complete! Now Daily Reports will only show employees assigned to projects.');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

setupProjectsWithEmployees();






