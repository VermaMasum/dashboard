const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/materialpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function debugAuthIssue() {
  try {
    console.log('🔍 Debugging Authentication Issue...');

    // Check all users in database
    const allUsers = await User.find({});
    console.log(`\n📊 Total users in database: ${allUsers.length}`);
    
    allUsers.forEach((user, index) => {
      console.log(`${index + 1}. Username: "${user.username}"`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password: ${user.password.substring(0, 20)}...`);
      console.log('');
    });

    // Test password matching for employee1
    console.log('🧪 Testing password matching for employee1:');
    const employee1 = await User.findOne({ username: 'employee1' });
    if (employee1) {
      console.log('✅ employee1 found in database');
      
      // Test different passwords
      const passwords = ['password123', 'password', '123456', 'admin'];
      for (const pwd of passwords) {
        try {
          const isMatch = await employee1.matchPassword(pwd);
          console.log(`   Password "${pwd}": ${isMatch ? '✅ MATCH' : '❌ NO MATCH'}`);
        } catch (error) {
          console.log(`   Password "${pwd}": ❌ ERROR - ${error.message}`);
        }
      }
    } else {
      console.log('❌ employee1 NOT found in database');
    }

    // Check if there are any users with role 'employee'
    const employees = await User.find({ role: 'employee' });
    console.log(`\n👥 Users with role 'employee': ${employees.length}`);
    employees.forEach(emp => {
      console.log(`   - ${emp.username}`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugAuthIssue();







