const mongoose = require('mongoose');
const Report = require('./models/Report');
const Employee = require('./models/Employee');
const User = require('./models/User');

async function fixReportEmployees() {
  try {
    await mongoose.connect('mongodb://localhost:27017/employee-dashboard');
    console.log('✅ Connected to MongoDB');

    // Get all reports
    const reports = await Report.find({});
    console.log('📊 Found reports:', reports.length);

    for (const report of reports) {
      console.log('🔍 Checking report:', report._id);
      console.log('  - Employee ID:', report.employee);
      console.log('  - Employee Model:', report.employeeModel);
      
      // Try to find the employee in both models
      let employee = null;
      let modelName = null;
      
      if (report.employeeModel === 'Employee') {
        employee = await Employee.findById(report.employee);
        modelName = 'Employee';
      } else if (report.employeeModel === 'User') {
        employee = await User.findById(report.employee);
        modelName = 'User';
      } else {
        // If employeeModel is not set, try to find in both
        employee = await Employee.findById(report.employee);
        if (employee) {
          modelName = 'Employee';
        } else {
          employee = await User.findById(report.employee);
          if (employee) {
            modelName = 'User';
          }
        }
      }
      
      if (employee) {
        console.log('  ✅ Found employee:', employee.username, 'in', modelName, 'model');
        
        // Update the report with correct employeeModel if needed
        if (report.employeeModel !== modelName) {
          report.employeeModel = modelName;
          await report.save();
          console.log('  🔧 Updated employeeModel to:', modelName);
        }
      } else {
        console.log('  ❌ Employee not found for ID:', report.employee);
        
        // Try to find any employee to assign
        const anyEmployee = await Employee.findOne({});
        if (anyEmployee) {
          report.employee = anyEmployee._id;
          report.employeeModel = 'Employee';
          await report.save();
          console.log('  🔧 Assigned to employee:', anyEmployee.username);
        }
      }
    }

    console.log('✅ Report employee fixing complete');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

fixReportEmployees();