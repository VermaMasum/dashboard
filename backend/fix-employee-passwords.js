const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/materialpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixEmployeePasswords() {
  try {
    console.log('🔧 Fixing employee passwords...');

    // Get all employee users
    const employees = await User.find({ role: 'employee' });
    console.log(`Found ${employees.length} employee users`);

    for (const employee of employees) {
      console.log(`\n👤 Processing: ${employee.username}`);
      console.log(`Current password: ${employee.password}`);
      
      // Check if password is already hashed (starts with $2b$)
      if (employee.password.startsWith('$2b$')) {
        console.log('✅ Password already hashed');
        continue;
      }
      
      // Hash the plain text password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(employee.password, salt);
      
      // Update the employee with hashed password
      await User.findByIdAndUpdate(employee._id, { password: hashedPassword });
      console.log('✅ Password hashed and updated');
    }

    console.log('\n✅ All employee passwords fixed!');
    
    // List all employee credentials for testing
    console.log('\n📝 Employee Test Credentials:');
    const allEmployees = await User.find({ role: 'employee' });
    for (const emp of allEmployees) {
      console.log(`${emp.username}/password123`);
    }

  } catch (error) {
    console.error('❌ Error fixing employee passwords:', error);
  } finally {
    mongoose.connection.close();
  }
}

fixEmployeePasswords();
