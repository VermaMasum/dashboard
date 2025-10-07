const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/User');

dotenv.config({ path: __dirname + '/../.env' });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employee-dashboard', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

const createUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user
    // Note: Password will be automatically hashed by the User model's pre-save hook
    const admin = new User({
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      email: 'admin@company.com',
      phone: '123-456-7890',
      department: 'IT'
    });
    await admin.save();
    console.log('Admin user created:', { username: admin.username, role: admin.role });

    // Create super admin user
    const superAdmin = new User({
      username: 'superadmin',
      password: 'superadmin123',
      role: 'superAdmin',
      email: 'superadmin@company.com',
      phone: '123-456-7891',
      department: 'IT'
    });
    await superAdmin.save();
    console.log('Super Admin user created:', { username: superAdmin.username, role: superAdmin.role });

    // Create employee users
    const employees = [
      { username: 'employee1', password: 'password1', role: 'employee' },
      { username: 'employee2', password: 'password2', role: 'employee' },
      { username: 'employee3', password: 'password3', role: 'employee' },
    ];

    for (const emp of employees) {
      const employee = new User({
        username: emp.username,
        password: emp.password,
        role: emp.role,
        email: `${emp.username}@company.com`,
        phone: '123-456-7890',
        department: 'Development'
      });
      await employee.save();
      console.log('Employee created:', { username: employee.username, role: employee.role });
    }

    console.log('✅ All sample users created successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('Admin: admin / admin123');
    console.log('Super Admin: superadmin / superadmin123');
    console.log('Employee 1: employee1 / password1');
    console.log('Employee 2: employee2 / password2');
    console.log('Employee 3: employee3 / password3');
    
    process.exit();
  } catch (error) {
    console.error('Error creating users:', error);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await createUsers();
};

run();


