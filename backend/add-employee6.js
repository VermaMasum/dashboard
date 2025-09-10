const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/materialpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function addEmployee6() {
  try {
    console.log('👤 Adding Employee6 to database...');

    // Check if Employee6 already exists
    const existingUser = await User.findOne({ username: 'Employee6' });
    if (existingUser) {
      console.log('✅ Employee6 already exists in database');
      console.log('Username:', existingUser.username);
      console.log('Role:', existingUser.role);
      return;
    }

    // Create Employee6
    const newUser = new User({
      username: 'Employee6',
      password: 'password123',
      role: 'employee'
    });

    await newUser.save();
    console.log('✅ Employee6 created successfully!');
    console.log('Username: Employee6');
    console.log('Password: password123');
    console.log('Role: employee');

    console.log('\n🎯 Now you can login with:');
    console.log('POST http://localhost:5000/api/auth/login');
    console.log('Body: {"username": "Employee6", "password": "password123"}');

  } catch (error) {
    console.error('❌ Error adding Employee6:', error);
  } finally {
    mongoose.connection.close();
  }
}

addEmployee6();


