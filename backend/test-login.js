const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    await mongoose.connect('mongodb://localhost:27017/employee-dashboard');
    console.log('✅ Connected to MongoDB');

    // Test if we can find users
    const users = await User.find({});
    console.log('👥 Total users in database:', users.length);
    
    if (users.length > 0) {
      console.log('📋 Users found:');
      users.forEach(user => {
        console.log(`  - ${user.username} (${user.role})`);
      });
      
      // Test password matching
      const testUser = users[0];
      console.log(`\n🔍 Testing password for user: ${testUser.username}`);
      
      const testPassword = 'admin123';
      const passwordMatch = await testUser.matchPassword(testPassword);
      console.log(`🔑 Password '${testPassword}' matches:`, passwordMatch);
      
      if (!passwordMatch) {
        console.log('❌ Password does not match. Let me check the stored password hash...');
        console.log('🔐 Stored password hash:', testUser.password);
      }
    } else {
      console.log('❌ No users found in database');
      console.log('🔧 Creating a test admin user...');
      
      const adminUser = new User({
        username: 'admin',
        password: 'admin123',
        role: 'admin'
      });
      
      await adminUser.save();
      console.log('✅ Admin user created: username=admin, password=admin123');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testLogin();
