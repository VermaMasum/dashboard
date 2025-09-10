const mongoose = require('mongoose');
const Report = require('./models/Report');
const Project = require('./models/Project');
const Employee = require('./models/Employee');
const User = require('./models/User');

async function checkAndFixData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/employee-dashboard');
    console.log('✅ Connected to MongoDB');

    // Check employees
    const employees = await Employee.find({});
    console.log('👷 Employees in database:', employees.length);
    employees.forEach(emp => console.log(`  - ${emp.username} (${emp._id})`));

    // Check users
    const users = await User.find({});
    console.log('👤 Users in database:', users.length);
    users.forEach(user => console.log(`  - ${user.username} (${user._id})`));

    // Check projects
    const projects = await Project.find({});
    console.log('📁 Projects in database:', projects.length);
    projects.forEach(proj => console.log(`  - ${proj.name} (${proj._id})`));

    // Check reports
    const reports = await Report.find({});
    console.log('📊 Reports in database:', reports.length);
    
    for (const report of reports) {
      console.log(`  - Report ${report._id}:`);
      console.log(`    Employee ID: ${report.employee}`);
      console.log(`    Employee Model: ${report.employeeModel}`);
      console.log(`    Project ID: ${report.project}`);
      console.log(`    Title: ${report.title}`);
      
      // Check if employee exists
      let employee = null;
      if (report.employeeModel === 'Employee') {
        employee = await Employee.findById(report.employee);
      } else if (report.employeeModel === 'User') {
        employee = await User.findById(report.employee);
      }
      
      if (employee) {
        console.log(`    ✅ Employee found: ${employee.username}`);
      } else {
        console.log(`    ❌ Employee not found!`);
        
        // Fix by assigning to first available employee
        if (employees.length > 0) {
          report.employee = employees[0]._id;
          report.employeeModel = 'Employee';
          await report.save();
          console.log(`    🔧 Fixed: Assigned to ${employees[0].username}`);
        }
      }
    }

    // Create test data if none exists
    if (reports.length === 0 && employees.length > 0 && projects.length > 0) {
      console.log('🔧 Creating test report...');
      const testReport = new Report({
        title: 'Test Report',
        details: 'Test report details',
        hoursWorked: 8,
        project: projects[0]._id,
        employee: employees[0]._id,
        employeeModel: 'Employee'
      });
      await testReport.save();
      console.log('✅ Created test report');
    }

    console.log('✅ Data check complete');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

checkAndFixData();
