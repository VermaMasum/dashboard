const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/materialpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function manageEmployeePasswords() {
  try {
    console.log('👥 Employee Password Manager');
    console.log('============================\n');

    // Get all employee users
    const employees = await User.find({ role: 'employee' });
    console.log(`Found ${employees.length} employee users\n`);

    console.log('📋 Current Employee List:');
    console.log('-------------------------');
    
    for (const employee of employees) {
      console.log(`👤 ${employee.username}`);
      console.log(`   Role: ${employee.role}`);
      console.log(`   Created: ${employee.createdAt.toLocaleDateString()}`);
      console.log(`   Password: ${employee.password.substring(0, 20)}...`);
      console.log('');
    }

    console.log('🔍 Testing Common Passwords...');
    console.log('==============================');
    
    const commonPasswords = [
      'password123', 
      'password', 
      '123456', 
      'admin', 
      'employee',
      'password2',
      'password3'
    ];
    
    let foundCredentials = [];
    
    for (const employee of employees) {
      console.log(`\n🔐 Testing ${employee.username}:`);
      
      for (const testPassword of commonPasswords) {
        try {
          const isMatch = await employee.matchPassword(testPassword);
          if (isMatch) {
            console.log(`   ✅ ${testPassword} - WORKS!`);
            foundCredentials.push(`${employee.username}/${testPassword}`);
          } else {
            console.log(`   ❌ ${testPassword}`);
          }
        } catch (error) {
          console.log(`   ❌ ${testPassword} (error)`);
        }
      }
    }

    if (foundCredentials.length > 0) {
      console.log('\n✅ WORKING CREDENTIALS:');
      console.log('=======================');
      foundCredentials.forEach(cred => console.log(cred));
    } else {
      console.log('\n❌ No working credentials found with common passwords.');
      console.log('\n💡 Options:');
      console.log('1. Run: node reset-employee-passwords.js (sets all to password123)');
      console.log('2. Check the original employee creation data for actual passwords');
      console.log('3. Create new employees with known passwords');
    }

  } catch (error) {
    console.error('❌ Error managing employee passwords:', error);
  } finally {
    mongoose.connection.close();
  }
}

manageEmployeePasswords();















