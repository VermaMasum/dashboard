const mongoose = require('mongoose');
const User = require('../models/User');

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

const addEmailsToUsers = async () => {
  try {
    await connectDB();
    
    // Find all users without email
    const usersWithoutEmail = await User.find({ 
      $or: [
        { email: { $exists: false } },
        { email: '' },
        { email: null }
      ]
    });
    
    console.log(`Found ${usersWithoutEmail.length} users without email`);
    
    for (const user of usersWithoutEmail) {
      // Create email from username
      const email = `${user.username}@company.com`;
      
      // Update user with email
      await User.findByIdAndUpdate(user._id, { email: email });
      console.log(`✅ Updated user ${user.username} with email: ${email}`);
    }
    
    console.log('🎉 All users updated with email addresses!');
    
    // Show all users with their emails
    const allUsers = await User.find({});
    console.log('\n📋 All users:');
    allUsers.forEach(user => {
      console.log(`- ${user.username} (${user.email}) - ${user.role}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

addEmailsToUsers();
