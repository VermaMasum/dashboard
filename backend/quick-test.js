const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/materialpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function quickTest() {
  try {
    console.log('🧪 Quick authentication test...');

    // Test with employee2 (should work with password123)
    const user = await User.findOne({ username: 'employee2', role: 'employee' });
    if (user) {
      console.log(`✅ Found user: ${user.username}`);
      console.log(`Password hash: ${user.password}`);
      
      // Test password match
      const isMatch = await user.matchPassword('password123');
      console.log(`Password 'password123' matches: ${isMatch ? '✅' : '❌'}`);
      
      const isMatch2 = await user.matchPassword('password2');
      console.log(`Password 'password2' matches: ${isMatch2 ? '✅' : '❌'}`);
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

quickTest();


