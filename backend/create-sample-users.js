const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['admin', 'superAdmin', 'employee'], required: true },
});

// Password hashing middleware
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Password comparison method
userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);

const createSampleUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const adminUser = await User.findOne({ username: 'admin' });
    if (!adminUser) {
      const admin = new User({
        username: 'admin',
        password: 'admin',
        role: 'admin'
      });
      await admin.save();
      console.log('✅ Admin user created: admin/admin');
    } else {
      console.log('ℹ️ Admin user already exists');
    }

    // Create superAdmin user
    const superAdminUser = await User.findOne({ username: 'superAdmin' });
    if (!superAdminUser) {
      const superAdmin = new User({
        username: 'superAdmin',
        password: 'superAdmin',
        role: 'superAdmin'
      });
      await superAdmin.save();
      console.log('✅ SuperAdmin user created: superAdmin/superAdmin');
    } else {
      console.log('ℹ️ SuperAdmin user already exists');
    }

    console.log('🎉 Sample users created successfully!');
    console.log('You can now login with:');
    console.log('- admin/admin (Admin role)');
    console.log('- superAdmin/superAdmin (SuperAdmin role)');

  } catch (error) {
    console.error('❌ Error creating sample users:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createSampleUsers();
