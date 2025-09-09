const mongoose = require('mongoose');
const Employee = require('./models/Employee');
require('dotenv').config();

const createSampleEmployee = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/admin-dashboard');
    console.log('Connected to MongoDB');

    // Check if employee already exists
    const existingEmployee = await Employee.findOne({ username: 'employee1' });
    if (existingEmployee) {
      console.log('Employee with username "employee1" already exists');
      await mongoose.connection.close();
      return;
    }

    // Create sample employee
    const employee = new Employee({
      username: 'employee1',
      password: 'employee1', // This will be hashed automatically
      role: 'employee',
    });

    await employee.save();
    console.log('Sample employee created successfully:');
    console.log('Username: employee1');
    console.log('Password: employee1');
    console.log('Role: employee');

  } catch (error) {
    console.error('Error creating sample employee:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
};

createSampleEmployee();
