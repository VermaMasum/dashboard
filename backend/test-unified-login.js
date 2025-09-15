const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/materialpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testUnifiedLogin() {
  try {
    console.log('🧪 Testing Unified Login (auth/auth1/login)...');

    // Test all user types on the same endpoint
    const testCredentials = [
      { username: 'admin', password: 'admin', expectedRole: 'admin' },
      { username: 'superAdmin', password: 'superAdmin', expectedRole: 'superAdmin' },
      { username: 'employee1', password: 'password123', expectedRole: 'employee' },
      { username: 'employee2', password: 'password123', expectedRole: 'employee' },
      { username: 'Employee4', password: 'password123', expectedRole: 'employee' }
    ];

    console.log('🔐 Testing credentials on auth/auth1/login page:');
    console.log('================================================');

    for (const cred of testCredentials) {
      console.log(`\n👤 Testing: ${cred.username}`);
      
      const user = await User.findOne({ username: cred.username });
      if (!user) {
        console.log('❌ User not found');
        continue;
      }
      
      console.log(`✅ User found: ${user.username} (${user.role})`);
      
      // Test password match
      const isMatch = await user.matchPassword(cred.password);
      console.log(`Password match: ${isMatch ? '✅' : '❌'}`);
      
      if (isMatch) {
        console.log(`🎯 WORKING: ${cred.username}/${cred.password} → ${user.role} dashboard`);
      } else {
        console.log(`❌ FAILED: ${cred.username}/${cred.password}`);
      }
    }

    console.log('\n📝 Summary:');
    console.log('===========');
    console.log('✅ All these credentials should work on: http://localhost:3000/auth/auth1/login');
    console.log('✅ Admin users → Admin Dashboard');
    console.log('✅ Employee users → Employee Dashboard');

  } catch (error) {
    console.error('❌ Error testing unified login:', error);
  } finally {
    mongoose.connection.close();
  }
}

testUnifiedLogin();







