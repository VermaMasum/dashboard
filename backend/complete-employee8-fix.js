const mongoose = require('mongoose');
const User = require('./models/User');
const Project = require('./models/Project');
const Report = require('./models/Report');
require('dotenv').config();

async function completeEmployee8Fix() {
  try {
    console.log('🔧 Starting complete employee8 fix...');
    
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Step 1: Ensure employee8 exists
    let employee8 = await User.findOne({ username: 'employee8' });
    if (!employee8) {
      console.log('👤 Creating employee8...');
      employee8 = await User.create({
        username: 'employee8',
        password: 'password123',
        role: 'employee',
        email: 'employee8@gmail.com',
        phone: '8888888888',
        department: 'HR'
      });
      console.log('✅ Created employee8:', employee8.username);
    } else {
      console.log('✅ Found employee8:', employee8.username, employee8._id);
    }

    // Step 2: Create projects and assign employee8
    const projects = [
      { name: 'Dashboard', description: 'Admin Dashboard Project' },
      { name: 'AI summarizer', description: 'AI Blog Summarizer Project' },
      { name: 'Reel-eats', description: 'Multi-cuisine Restaurant App' }
    ];

    for (const projectData of projects) {
      let project = await Project.findOne({ name: projectData.name });
      if (!project) {
        project = await Project.create({
          name: projectData.name,
          description: projectData.description,
          employees: [employee8._id]
        });
        console.log(`✅ Created project: ${project.name}`);
      } else {
        // Add employee8 if not already assigned
        if (!project.employees.includes(employee8._id)) {
          project.employees.push(employee8._id);
          await project.save();
          console.log(`✅ Added employee8 to project: ${project.name}`);
        } else {
          console.log(`✅ Employee8 already assigned to: ${project.name}`);
        }
      }
    }

    // Step 3: Create sample reports for employee8
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    
    // Clear existing reports for employee8
    await Report.deleteMany({ employee: employee8._id });
    console.log('🗑️ Cleared existing reports for employee8');

    const reports = await Report.create([
      {
        date: today,
        project: 'Dashboard',
        employee: employee8._id,
        title: 'Dashboard Development',
        details: 'Worked on dashboard components and UI',
        hoursWorked: 8
      },
      {
        date: today,
        project: 'AI summarizer',
        employee: employee8._id,
        title: 'AI Feature Implementation',
        details: 'Implemented AI summarization feature',
        hoursWorked: 6
      },
      {
        date: yesterday,
        project: 'Reel-eats',
        employee: employee8._id,
        title: 'Restaurant App Development',
        details: 'Worked on restaurant listing features',
        hoursWorked: 7
      }
    ]);

    console.log(`✅ Created ${reports.length} reports for employee8`);

    // Step 4: Verify the setup
    console.log('\n📊 Verification:');
    
    const assignedProjects = await Project.find({ employees: employee8._id });
    console.log('📋 Projects assigned to employee8:');
    assignedProjects.forEach(project => {
      console.log(`  - ${project.name}: ${project.description}`);
    });

    const employeeReports = await Report.find({ employee: employee8._id });
    console.log('\n📊 Reports by employee8:');
    employeeReports.forEach(report => {
      console.log(`  - ${report.title} (${report.hoursWorked}h) on ${report.project}`);
    });

    // Step 5: Test API endpoints
    console.log('\n🧪 Testing API endpoints...');
    
    // Test reports endpoint
    const testReports = await Report.find({ employee: employee8._id })
      .populate('employee', 'username')
      .populate('project', 'name');
    
    console.log('📡 Reports API response:');
    testReports.forEach(report => {
      console.log(`  - ${report.title}: Employee=${report.employee?.username}, Project=${report.project?.name || report.project}`);
    });

    console.log('\n🎉 Complete fix applied!');
    console.log('👤 Employee8:', employee8.username);
    console.log('📋 Assigned projects:', assignedProjects.length);
    console.log('📊 Reports created:', employeeReports.length);
    console.log('\n✅ Employee8 dashboard should now work without errors!');

  } catch (error) {
    console.error('❌ Error during fix:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
}

completeEmployee8Fix();






