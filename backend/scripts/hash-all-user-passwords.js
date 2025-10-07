// hash-all-user-passwords.js
require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User"); // path to your User model

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// Function to check if a string is already a bcrypt hash
function isHashed(password) {
  return /^\$2[aby]\$[0-9]{2}\$/.test(password);
}

async function hashAllPasswords() {
  try {
    const users = await User.find({});
    console.log(`🔍 Found ${users.length} users`);

    let updatedCount = 0;

    for (const user of users) {
      if (!user.password || isHashed(user.password)) {
        // Skip users with empty or already hashed passwords
        continue;
      }

      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      await user.save();
      updatedCount++;
      console.log(`✅ Password hashed for user: ${user.username}`);
    }

    console.log(`🎉 Total passwords updated: ${updatedCount}`);
  } catch (error) {
    console.error("❌ Error hashing passwords:", error);
  } finally {
    mongoose.disconnect();
  }
}

hashAllPasswords();
