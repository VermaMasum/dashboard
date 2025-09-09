const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Employee = require('../models/Employee');

dotenv.config({ path: __dirname + '/../.env' });

const employeesData = [
  { username: 'employee1', password: 'password1' },
  { username: 'employee2', password: 'password2' },
  { username: 'employee3', password: 'password3' },
];

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  }
};

const createEmployees = async () => {
  try {
    await Employee.deleteMany({});
    const createdEmployees = await Employee.insertMany(employeesData);
    console.log('Sample employees created:', createdEmployees);
    process.exit();
  } catch (error) {
    console.error('Error creating employees:', error);
    process.exit(1);
  }
};

const run = async () => {
  await connectDB();
  await createEmployees();
};

run();
