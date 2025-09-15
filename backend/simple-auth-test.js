const express = require('express');
const mongoose = require('mongoose');
const User = require('./models/User');
const jwt = require('jsonwebtoken');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/materialpro', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function simpleAuthTest() {
  try {
    console.log('🧪 Simple Authentication Test...');

    // Simulate the exact same logic as the API
    const username = 'employee1';
    const password = 'password123';

    console.log(`Testing: ${username}/${password}`);

    const user = await User.findOne({ username });
    console.log('User found:', user ? 'YES' : 'NO');

    if (user) {
      console.log('User role:', user.role);
      const passwordMatch = await user.matchPassword(password);
      console.log('Password match:', passwordMatch ? 'YES' : 'NO');

      if (passwordMatch) {
        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET || 'fallback_secret', {
          expiresIn: '30d',
        });
        
        const response = {
          _id: user._id,
          username: user.username,
          role: user.role,
          token,
        };
        
        console.log('✅ SUCCESS! API would return:');
        console.log(JSON.stringify(response, null, 2));
      } else {
        console.log('❌ Password does not match');
      }
    } else {
      console.log('❌ User not found');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

simpleAuthTest();







