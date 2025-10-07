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
    console.log(`\n🔍 Found ${users.length} users in database\n`);

    let updatedCount = 0;
    let alreadyHashedCount = 0;

    for (const user of users) {
      if (!user.password || isHashed(user.password)) {
        // Skip users with empty or already hashed passwords
        console.log(`   ✓ ${user.username} - Already hashed (skipping)`);
        alreadyHashedCount++;
        continue;
      }

      // Hash the password and update directly to avoid pre-save hook
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(user.password, salt);
      
      // Update directly using updateOne to bypass pre-save hook
      await User.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );
      
      updatedCount++;
      console.log(`   ✅ ${user.username} - Password hashed successfully`);
    }

    console.log(`\n${'='.repeat(60)}`);
    console.log(`🎉 Password Fix Complete!`);
    console.log(`${'='.repeat(60)}`);
    console.log(`Total users: ${users.length}`);
    console.log(`Passwords hashed: ${updatedCount}`);
    console.log(`Already hashed: ${alreadyHashedCount}`);
    console.log(`${'='.repeat(60)}\n`);
    
    if (updatedCount > 0) {
      console.log('✅ SUCCESS! All passwords are now hashed.');
      console.log('✅ You can now login with your database users!\n');
      console.log('Next steps:');
      console.log('  1. Restart backend: pm2 restart server');
      console.log('  2. Try logging in with any database user\n');
    } else {
      console.log('✅ All passwords were already hashed.\n');
    }
  } catch (error) {
    console.error("\n❌ Error hashing passwords:", error);
  } finally {
    mongoose.disconnect();
  }
}

hashAllPasswords();
