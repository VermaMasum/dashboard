const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');

mongoose.connect('mongodb://localhost:27017/employee-dashboard', { useNewUrlParser: true, useUnifiedTopology: true });

mongoose.connection.once('open', async () => {
  console.log('✅ Connected to MongoDB');
  try {
    // Check existing users
    const users = await User.find({});
    const employees = await Employee.find({});
    
    console.log('👥 Total Users:', users.length);
    console.log('👷 Total Employees:', employees.length);
    
    if (users.length > 0) {
      console.log('📋 Users in database:');
      users.forEach(user => {
        console.log('  - Username:', user.username, '| Role:', user.role, '| ID:', user._id);
      });
    }
    
    if (employees.length > 0) {
      console.log('📋 Employees in database:');
      employees.forEach(emp => {
        console.log('  - Username:', emp.username, '| Role:', emp.role, '| ID:', emp._id);
      });
    }
    
    // Create admin user if none exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('🔧 Creating admin user...');
      const admin = new User({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Admin user created: username=admin, password=admin123');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    // Create superAdmin user if none exists
    const superAdminExists = await User.findOne({ role: 'superAdmin' });
    if (!superAdminExists) {
      console.log('🔧 Creating superAdmin user...');
      const superAdmin = new User({
        username: 'superadmin',
        password: 'superadmin123',
        role: 'superAdmin'
      });
      await superAdmin.save();
      console.log('✅ SuperAdmin user created: username=superadmin, password=superadmin123');
    } else {
      console.log('✅ SuperAdmin user already exists');
    }
    
    // Create test employee if none exists
    const employeeExists = await Employee.findOne({});
    if (!employeeExists) {
      console.log('🔧 Creating test employee...');
      const employee = new Employee({
        username: 'employee1',
        password: 'employee123',
        role: 'employee'
      });
      await employee.save();
      console.log('✅ Test employee created: username=employee1, password=employee123');
    } else {
      console.log('✅ Employee users already exist');
    }
    
    console.log('\n🎉 Login credentials:');
    console.log('Admin: username=admin, password=admin123');
    console.log('SuperAdmin: username=superadmin, password=superadmin123');
    console.log('Employee: username=employee1, password=employee123');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
  mongoose.connection.close();
});
