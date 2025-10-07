require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // adjust path if needed

const MONGO_URI = process.env.MONGO_URI;

const updatePassword = async () => {
  try {
    await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('✅ DB connected');

    const username = 'admin'; // your admin username
    const user = await User.findOne({ username });

    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }

    const newPassword = 'Admin@123'; // new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    console.log('✅ Admin password updated successfully');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err);
    process.exit(1);
  }
};

updatePassword();
