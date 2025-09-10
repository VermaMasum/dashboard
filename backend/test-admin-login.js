const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/materialpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testAdminLogin() {
  try {
    console.log('🧪 Testing Admin Login...');

    // Test admin credentials
    const adminCredentials = [
      { username: 'admin', password: 'admin' },
      { username: 'superAdmin', password: 'superAdmin' }
    ];

    for (const cred of adminCredentials) {
      console.log(`\n🔐 Testing: ${cred.username}`);
      
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
        console.log(`🎯 WORKING: ${cred.username}/${cred.password}`);
      }
    }

    console.log('\n📝 Admin Login URLs:');
    console.log('Admin: http://localhost:3000/auth/auth1/login');
    console.log('Employee: http://localhost:3000/auth/employee-login');

  } catch (error) {
    console.error('❌ Error testing admin login:', error);
  } finally {
    mongoose.connection.close();
  }
}

testAdminLogin();


