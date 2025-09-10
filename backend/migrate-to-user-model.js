const mongoose = require('mongoose');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Report = require('./models/Report');
const Project = require('./models/Project');

async function migrateToUserModel() {
  try {
    await mongoose.connect('mongodb://localhost:27017/employee-dashboard');
    console.log('✅ Connected to MongoDB');

    // Step 1: Migrate employees to User model
    const employees = await Employee.find({});
    console.log('👷 Found employees to migrate:', employees.length);

    for (const employee of employees) {
      // Check if user already exists
      const existingUser = await User.findOne({ username: employee.username });
      if (existingUser) {
        console.log(`⚠️ User ${employee.username} already exists, skipping`);
        continue;
      }

      // Create user from employee
      const newUser = new User({
        username: employee.username,
        password: employee.password,
        role: 'employee',
        email: employee.email || '',
        phone: employee.phone || '',
        department: employee.department || '',
      });

      await newUser.save();
      console.log(`✅ Migrated employee: ${employee.username} -> User ID: ${newUser._id}`);

      // Step 2: Update reports to reference new user
      await Report.updateMany(
        { employee: employee._id, employeeModel: 'Employee' },
        { 
          $set: { 
            employee: newUser._id 
          },
          $unset: { 
            employeeModel: 1 
          }
        }
      );
      console.log(`🔧 Updated reports for ${employee.username}`);

      // Step 3: Update projects to reference new user
      await Project.updateMany(
        { employees: employee._id },
        { $set: { 'employees.$': newUser._id } }
      );
      console.log(`🔧 Updated projects for ${employee.username}`);
    }

    // Step 4: Clean up any remaining employeeModel fields
    await Report.updateMany(
      { employeeModel: { $exists: true } },
      { $unset: { employeeModel: 1 } }
    );
    console.log('🧹 Cleaned up employeeModel fields from reports');

    await Project.updateMany(
      { employeeModel: { $exists: true } },
      { $unset: { employeeModel: 1 } }
    );
    console.log('🧹 Cleaned up employeeModel fields from projects');

    // Step 5: Verify migration
    const totalUsers = await User.find({ role: 'employee' });
    const totalReports = await Report.find({});
    const totalProjects = await Project.find({});

    console.log('📊 Migration Summary:');
    console.log(`  - Employee users: ${totalUsers.length}`);
    console.log(`  - Total reports: ${totalReports.length}`);
    console.log(`  - Total projects: ${totalProjects.length}`);

    // Check if any reports still have missing employee references
    const reportsWithMissingEmployees = await Report.find({
      employee: { $exists: true },
      $expr: { $not: { $in: ['$employee', totalUsers.map(u => u._id)] } }
    });

    if (reportsWithMissingEmployees.length > 0) {
      console.log(`⚠️ Found ${reportsWithMissingEmployees.length} reports with missing employee references`);
    } else {
      console.log('✅ All reports have valid employee references');
    }

    console.log('🎉 Migration completed successfully!');

  } catch (error) {
    console.error('❌ Migration error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

migrateToUserModel();
