const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/materialpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function showEmployeeUsernames() {
  try {
    console.log('👥 Available Employee Usernames:');
    console.log('================================');

    const employees = await User.find({ role: 'employee' });
    
    if (employees.length === 0) {
      console.log('❌ No employees found. Run: node setup-employee-system.js');
      return;
    }

    console.log(`Found ${employees.length} employees:\n`);
    
    employees.forEach((emp, index) => {
      console.log(`${index + 1}. Username: "${emp.username}"`);
      console.log(`   Password: password123`);
      console.log(`   Created: ${emp.createdAt ? emp.createdAt.toLocaleDateString() : 'Unknown'}\n`);
    });

    console.log('🎯 CORRECT CREDENTIALS TO USE:');
    console.log('==============================');
    employees.forEach(emp => {
      console.log(`${emp.username}/password123`);
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

showEmployeeUsernames();
