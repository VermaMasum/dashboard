const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');

async function createTestUsers() {
  try {
    await mongoose.connect('mongodb://localhost:27017/employee-dashboard');
    console.log('✅ Connected to MongoDB');

    // Create admin user
    const adminUser = new User({
      username: 'admin',
      password: 'admin123',
      role: 'admin'
    });
    await adminUser.save();
    console.log('✅ Admin user created: username=admin, password=admin123');

    // Create superAdmin user
    const superAdminUser = new User({
      username: 'superadmin',
      password: 'superadmin123',
      role: 'superAdmin'
    });
    await superAdminUser.save();
    console.log('✅ SuperAdmin user created: username=superadmin, password=superadmin123');

    // Create test employee
    const employeeUser = new Employee({
      username: 'employee1',
      password: 'employee123',
      role: 'employee'
    });
    await employeeUser.save();
    console.log('✅ Employee user created: username=employee1, password=employee123');

    console.log('\n🎉 Test users created successfully!');
    console.log('Login credentials:');
    console.log('Admin: username=admin, password=admin123');
    console.log('SuperAdmin: username=superadmin, password=superadmin123');
    console.log('Employee: username=employee1, password=employee123');

  } catch (error) {
    console.error('❌ Error creating users:', error);
  } finally {
    await mongoose.connection.close();
  }
}

createTestUsers();
