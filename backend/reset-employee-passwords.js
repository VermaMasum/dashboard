const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/materialpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function resetEmployeePasswords() {
  try {
    console.log('🔄 Resetting employee passwords...');

    // Get all employee users
    const employees = await User.find({ role: 'employee' });
    console.log(`Found ${employees.length} employee users`);

    // Reset all employee passwords to 'password123'
    for (const employee of employees) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('password123', salt);
      
      await User.findByIdAndUpdate(employee._id, { password: hashedPassword });
      console.log(`✅ Reset password for: ${employee.username}`);
    }

    console.log('\n✅ All employee passwords reset to: password123');
    console.log('\n📝 Working Employee Credentials:');
    console.log('===============================');
    
    for (const employee of employees) {
      console.log(`${employee.username}/password123`);
    }

    console.log('\n🎯 Test Instructions:');
    console.log('1. Go to: http://localhost:3000/auth/employee-login');
    console.log('2. Use any of the credentials above');
    console.log('3. All employees now use: password123');

  } catch (error) {
    console.error('❌ Error resetting employee passwords:', error);
  } finally {
    mongoose.connection.close();
  }
}

resetEmployeePasswords();











