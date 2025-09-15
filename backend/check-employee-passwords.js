const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/materialpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function checkEmployeePasswords() {
  try {
    console.log('🔍 Checking employee passwords...');

    // Get all employee users
    const employees = await User.find({ role: 'employee' });
    console.log(`Found ${employees.length} employee users\n`);

    console.log('📝 Employee Credentials:');
    console.log('========================');
    
    for (const employee of employees) {
      console.log(`👤 Username: ${employee.username}`);
      console.log(`🔐 Password Hash: ${employee.password}`);
      console.log(`📅 Created: ${employee.createdAt}`);
      console.log('---');
    }

    console.log('\n🧪 Testing common passwords...');
    
    // Test common passwords for each employee
    const commonPasswords = ['password123', 'password', '123456', 'admin', 'employee'];
    
    for (const employee of employees) {
      console.log(`\n🔐 Testing passwords for ${employee.username}:`);
      
      for (const testPassword of commonPasswords) {
        try {
          const isMatch = await employee.matchPassword(testPassword);
          if (isMatch) {
            console.log(`✅ FOUND: ${employee.username}/${testPassword}`);
          }
        } catch (error) {
          // Password doesn't match, continue
        }
      }
    }

  } catch (error) {
    console.error('❌ Error checking employee passwords:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkEmployeePasswords();











