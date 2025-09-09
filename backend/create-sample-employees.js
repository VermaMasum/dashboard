const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const employeeSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'employee' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  department: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superAdmin', 'employee'], required: true },
});

// Password hashing middleware
employeeSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Employee = mongoose.model('Employee', employeeSchema);
const User = mongoose.model('User', userSchema);

const createSampleEmployees = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const sampleEmployees = [
      {
        username: 'john_doe',
        password: 'password123',
        role: 'employee',
        email: 'john.doe@company.com',
        phone: '+1-555-0123',
        department: 'Engineering'
      },
      {
        username: 'jane_smith',
        password: 'password123',
        role: 'employee',
        email: 'jane.smith@company.com',
        phone: '+1-555-0124',
        department: 'Marketing'
      },
      {
        username: 'mike_wilson',
        password: 'password123',
        role: 'employee',
        email: 'mike.wilson@company.com',
        phone: '+1-555-0125',
        department: 'Sales'
      },
      {
        username: 'sarah_jones',
        password: 'password123',
        role: 'employee',
        email: 'sarah.jones@company.com',
        phone: '+1-555-0126',
        department: 'HR'
      }
    ];

    for (const empData of sampleEmployees) {
      const existingEmployee = await Employee.findOne({ username: empData.username });
      if (!existingEmployee) {
        const employee = new Employee(empData);
        await employee.save();
        console.log(`✅ Employee created: ${empData.username} (${empData.department})`);
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

    console.log('🎉 Sample employees created successfully!');
    console.log('Sample employees:');
    console.log('- john_doe/password123 (Engineering)');
    console.log('- jane_smith/password123 (Marketing)');
    console.log('- mike_wilson/password123 (Sales)');
    console.log('- sarah_jones/password123 (HR)');

  } catch (error) {
    console.error('❌ Error creating sample employees:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createSampleEmployees();
