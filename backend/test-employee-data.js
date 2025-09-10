const mongoose = require('mongoose');
const Employee = require('./models/Employee');
const Report = require('./models/Report');
const Project = require('./models/Project');

async function testEmployeeData() {
  try {
    await mongoose.connect('mongodb://localhost:27017/employee-dashboard');
    console.log('✅ Connected to MongoDB');

    // Check employees
    const employees = await Employee.find({});
    console.log('👷 Employees in database:', employees.length);
    
    if (employees.length > 0) {
      const employee = employees[0];
      console.log('🔍 Testing employee:', employee.username, 'ID:', employee._id);
      
      // Check reports for this employee
      const reports = await Report.find({ employee: employee._id }).populate('project', 'name');
      console.log('📊 Reports for this employee:', reports.length);
      
      if (reports.length > 0) {
        console.log('📋 Sample reports:');
        reports.forEach(report => {
          console.log(`  - ${report.title} (Project: ${report.project?.name})`);
        });
      } else {
        console.log('❌ No reports found for this employee');
      }
      
      // Check projects assigned to this employee
      const projects = await Project.find({ employees: employee._id });
      console.log('📁 Projects assigned to this employee:', projects.length);
      
      if (projects.length > 0) {
        console.log('📋 Assigned projects:');
        projects.forEach(project => {
          console.log(`  - ${project.name}`);
        });
      } else {
        console.log('❌ No projects assigned to this employee');
      }
      
      // Create some test data if none exists
      if (reports.length === 0 || projects.length === 0) {
        console.log('🔧 Creating test data...');
        
        // Create a test project
        const testProject = new Project({
          name: `Test Project for ${employee.username}`,
          description: 'Test project description',
          employees: [employee._id],
          employeeModel: 'Employee'
        });
        await testProject.save();
        console.log('✅ Created test project:', testProject.name);
        
        // Create a test report
        const testReport = new Report({
          title: 'Test Report',
          details: 'Test report details',
          hoursWorked: 8,
          project: testProject._id,
          employee: employee._id,
          employeeModel: 'Employee'
        });
        await testReport.save();
        console.log('✅ Created test report');
        
        console.log('🎉 Test data created successfully!');
      }
    } else {
      console.log('❌ No employees found in database');
    }

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
  }
}

testEmployeeData();
