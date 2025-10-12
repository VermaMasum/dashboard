// Debug login process
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'your-default-secret-key-change-in-production';

async function debugLogin() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/AdminModule';
    await mongoose.connect(mongoURI);
    console.log('✅ Connected to MongoDB');

    // Test finding user "masum"
    console.log('\n🔍 Testing user lookup...');
    const user = await User.findOne({ username: 'masum' });
    
    if (!user) {
      console.log('❌ User "masum" not found in database');
      return;
    }
    
    console.log('✅ User found:', {
      username: user.username,
      role: user.role,
      hasPassword: !!user.password,
      passwordLength: user.password?.length
    });

    // Test password comparison
    console.log('\n🔑 Testing password comparison...');
    const testPassword = 'masum123'; // Try this password
    console.log('Testing password:', testPassword);
    
    try {
      const isMatch = await user.matchPassword(testPassword);
      console.log('Password match result:', isMatch);
      
      if (isMatch) {
        console.log('✅ Password is correct!');
        
        // Test JWT generation
        console.log('\n🎫 Testing JWT generation...');
        try {
          const token = jwt.sign(
            { id: user._id, role: user.role },
            JWT_SECRET,
            { expiresIn: "30d" }
          );
          console.log('✅ JWT token generated successfully!');
          console.log('Token preview:', token.substring(0, 50) + '...');
        } catch (jwtError) {
          console.log('❌ JWT generation failed:', jwtError.message);
        }
      } else {
        console.log('❌ Password is incorrect');
        console.log('💡 Try these common passwords:');
        console.log('   - masum123');
        console.log('   - masum');
        console.log('   - admin123');
        console.log('   - password');
      }
    } catch (passwordError) {
      console.log('❌ Password comparison error:', passwordError.message);
    }

  } catch (error) {
    console.error('❌ Debug error:', error.message);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Debug completed');
    process.exit(0);
  }
}

debugLogin();
