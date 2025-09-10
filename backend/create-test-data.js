const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const Project = require('./models/Project');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/materialpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createTestData() {
  try {
    console.log('🚀 Creating test data...');

    // Create test employees
    const employees = [
      {
        username: 'john_doe',
        password: 'password123',
        role: 'employee',
        email: 'john@example.com',
        phone: '123-456-7890',
        department: 'Development'
      },
      {
        username: 'jane_smith',
        password: 'password123',
        role: 'employee',
        email: 'jane@example.com',
        phone: '123-456-7891',
        department: 'Design'
      }
    ];

    console.log('👥 Creating employees...');
    for (const empData of employees) {
      // Check if employee already exists
      const existingEmployee = await Employee.findOne({ username: empData.username });
      if (!existingEmployee) {
        const employee = new Employee(empData);
        await employee.save();
        console.log(`✅ Employee created: ${empData.username}`);
      } else {
        console.log(`ℹ️ Employee already exists: ${empData.username}`);
      }

      // Create user login credentials
      const existingUser = await User.findOne({ username: empData.username });
      if (!existingUser) {
        const user = new User({
          username: empData.username,
          password: empData.password,
          role: 'employee'
        });
        await user.save();
        console.log(`✅ Employee login created: ${empData.username}/password123`);
      } else {
        console.log(`ℹ️ Employee login already exists: ${empData.username}`);
      }
    }

    // Create test projects
    console.log('📋 Creating projects...');
    const projects = [
      {
        name: 'Website Redesign',
        description: 'Complete redesign of company website',
        date: new Date()
      },
      {
        name: 'Mobile App Development',
        description: 'Development of mobile application',
        date: new Date()
      }
    ];

    for (const projData of projects) {
      const existingProject = await Project.findOne({ name: projData.name });
      if (!existingProject) {
        const project = new Project(projData);
        await project.save();
        console.log(`✅ Project created: ${projData.name}`);
      } else {
        console.log(`ℹ️ Project already exists: ${projData.name}`);
      }
    }

    console.log('✅ Test data creation completed!');
    console.log('\n📝 Test Credentials:');
    console.log('Admin: admin/admin');
    console.log('SuperAdmin: superAdmin/superAdmin');
    console.log('Employee 1: john_doe/password123');
    console.log('Employee 2: jane_smith/password123');

  } catch (error) {
    console.error('❌ Error creating test data:', error);
  } finally {
    mongoose.connection.close();
  }
}

createTestData();

