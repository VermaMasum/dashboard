const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/materialpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function setupEmployeeSystem() {
  try {
    console.log('🚀 Setting up employee system...');

    // Create/fix employee users with consistent passwords
    const employees = [
      { username: 'employee1', password: 'password123', role: 'employee' },
      { username: 'employee2', password: 'password123', role: 'employee' },
      { username: 'employee3', password: 'password123', role: 'employee' },
      { username: 'Employee4', password: 'password123', role: 'employee' },
      { username: 'Employee5', password: 'password123', role: 'employee' },
      { username: 'john_doe', password: 'password123', role: 'employee' },
      { username: 'jane_smith', password: 'password123', role: 'employee' }
    ];

    console.log('👥 Creating/updating employee users...');
    for (const empData of employees) {
      const existingUser = await User.findOne({ username: empData.username });
      
      if (existingUser) {
        // Update existing user with consistent password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(empData.password, salt);
        await User.findByIdAndUpdate(existingUser._id, { password: hashedPassword });
        console.log(`✅ Updated: ${empData.username}/password123`);
      } else {
        // Create new user
        const user = new User(empData);
        await user.save();
        console.log(`✅ Created: ${empData.username}/password123`);
      }
    }

    console.log('\n✅ Employee system setup completed!');
    console.log('\n📝 Working Employee Credentials (all use password123):');
    for (const emp of employees) {
      console.log(`${emp.username}/password123`);
    }

    console.log('\n🎯 Test Instructions:'); 
    console.log('1. Start backend: node server.js');
    console.log('2. Start frontend: cd starterkit && npm run dev');
    console.log('3. Go to: it doeshttp://localhost:3000/auth/employee-login');
    console.log('4. Use any of the credentials above');

  } catch (error) {
    console.error('❌ Error setting up employee system:', error);
  } finally {
    mongoose.connection.close();
  }
}

setupEmployeeSystem();


