const mongoose = require('mongoose');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superAdmin', 'employee'], required: true },
});

const employeeSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'employee' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  department: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);
const Employee = mongoose.model('Employee', employeeSchema);

const simpleDiagnose = async () => {
  console.log('🔍 SIMPLE DIAGNOSIS - Employee API Issues\n');

  try {
    // Step 1: Connect to MongoDB
    console.log('1️⃣ Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully\n');

    // Step 2: Check if admin users exist
    console.log('2️⃣ Checking admin users...');
    const adminUsers = await User.find({ role: { $in: ['admin', 'superAdmin'] } });
    console.log(`Found ${adminUsers.length} admin users:`);
    adminUsers.forEach(user => {
      console.log(`  - ${user.username} (${user.role})`);
    });
    
    if (adminUsers.length === 0) {
      console.log('⚠️ No admin users found. Creating sample users...');
      const admin = new User({ username: 'admin', password: 'admin', role: 'admin' });
      await admin.save();
      console.log('✅ Created admin user');
      
      const superAdmin = new User({ username: 'superAdmin', password: 'superAdmin', role: 'superAdmin' });
      await superAdmin.save();
      console.log('✅ Created superAdmin user');
    }
    console.log('');

    // Step 3: Check if employees exist
    console.log('3️⃣ Checking employees...');
    const employees = await Employee.find({});
    console.log(`Found ${employees.length} employees:`);
    employees.forEach(emp => {
      console.log(`  - ${emp.username} (${emp.role}) - ${emp.department}`);
    });
    
    if (employees.length === 0) {
      console.log('⚠️ No employees found. Creating sample employees...');
      const sampleEmployees = [
        { username: 'john_doe', password: 'password123', role: 'employee', email: 'john@company.com', phone: '+1-555-0123', department: 'Engineering' },
        { username: 'jane_smith', password: 'password123', role: 'employee', email: 'jane@company.com', phone: '+1-555-0124', department: 'Marketing' },
        { username: 'mike_wilson', password: 'password123', role: 'employee', email: 'mike@company.com', phone: '+1-555-0125', department: 'Sales' },
        { username: 'sarah_jones', password: 'password123', role: 'employee', email: 'sarah@company.com', phone: '+1-555-0126', department: 'HR' }
      ];
      
      for (const empData of sampleEmployees) {
        const employee = new Employee(empData);
        await employee.save();
        console.log(`✅ Created employee: ${empData.username}`);
      }
    }
    console.log('');

    // Step 4: Test database queries
    console.log('4️⃣ Testing database queries...');
    const allEmployees = await Employee.find({}).select('-password');
    console.log(`✅ Successfully queried ${allEmployees.length} employees from database`);
    
    const allUsers = await User.find({ role: { $in: ['admin', 'superAdmin'] } });
    console.log(`✅ Successfully queried ${allUsers.length} admin users from database`);
    console.log('');

    // Step 5: Check environment variables
    console.log('5️⃣ Checking environment variables...');
    console.log(`MONGO_URI: ${process.env.MONGO_URI ? '✅ Set' : '❌ Not set'}`);
    console.log(`JWT_SECRET: ${process.env.JWT_SECRET ? '✅ Set' : '❌ Not set'}`);
    console.log(`PORT: ${process.env.PORT || '5000 (default)'}`);
    console.log('');

    console.log('🎉 DIAGNOSIS COMPLETE!');
    console.log('');
    console.log('📋 SUMMARY:');
    console.log(`- Admin users: ${adminUsers.length > 0 ? '✅ Ready' : '❌ Missing'}`);
    console.log(`- Employees: ${employees.length > 0 ? '✅ Ready' : '❌ Missing'}`);
    console.log(`- Database: ✅ Connected`);
    console.log(`- Environment: ${process.env.MONGO_URI && process.env.JWT_SECRET ? '✅ Ready' : '❌ Missing vars'}`);
    console.log('');
    console.log('🚀 NEXT STEPS:');
    console.log('1. Start backend server: node server.js');
    console.log('2. Start frontend: cd ../starterkit && npm run dev');
    console.log('3. Login with: admin/admin or superAdmin/superAdmin');
    console.log('4. Test Employee Management page');

  } catch (error) {
    console.error('❌ Diagnosis failed:', error.message);
    console.log('');
    console.log('🔧 COMMON FIXES:');
    console.log('1. Check if MongoDB is running');
    console.log('2. Verify .env file has correct MONGO_URI');
    console.log('3. Make sure you have internet connection');
  } finally {
    await mongoose.disconnect();
    console.log('\n🔍 Diagnosis complete!');
  }
};

simpleDiagnose();
