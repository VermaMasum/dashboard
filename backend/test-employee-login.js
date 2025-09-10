const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/materialpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testEmployeeLogin() {
  try {
    console.log('🧪 Testing employee login...');

    // Test credentials from the image
    const testCredentials = [
      { username: 'employee1', password: 'password123' },
      { username: 'employee2', password: 'password2' },
      { username: 'employee3', password: 'password3' },
      { username: 'Employee4', password: 'password123' },
      { username: 'Employee5', password: 'password123' }
    ];

    for (const cred of testCredentials) {
      console.log(`\n🔐 Testing: ${cred.username}`);
      
      const user = await User.findOne({ username: cred.username, role: 'employee' });
      if (!user) {
        console.log('❌ User not found');
        continue;
      }
      
      console.log(`✅ User found: ${user.username}`);
      console.log(`Password in DB: ${user.password}`);
      
      // Test password match
      const isMatch = await user.matchPassword(cred.password);
      console.log(`Password match: ${isMatch ? '✅' : '❌'}`);
      
      if (!isMatch) {
        console.log(`💡 Try these passwords:`);
        console.log(`   - password123`);
        console.log(`   - ${cred.password}`);
        console.log(`   - password`);
      }
    }

  } catch (error) {
    console.error('❌ Error testing employee login:', error);
  } finally {
    mongoose.connection.close();
  }
}

testEmployeeLogin();


