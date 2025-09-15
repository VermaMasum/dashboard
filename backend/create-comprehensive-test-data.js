const mongoose = require('mongoose');
require('dotenv').config();
const User = require('./models/User');
const Project = require('./models/Project');
const Report = require('./models/Report');
const bcrypt = require('bcryptjs');

const createComprehensiveTestData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/employee-dashboard');
    console.log('Connected to MongoDB for comprehensive test data creation.');

    // Clear existing data
    console.log('Clearing existing test data...');
    await User.deleteMany({ username: { $in: ['admin', 'superadmin', 'employee1', 'employee2', 'employee3', 'employee4', 'employee5'] } });
    await Project.deleteMany({ name: { $regex: /^Test Project/ } });
    await Report.deleteMany({ description: { $regex: /^Test Report/ } });

    // Create Admin Users
    console.log('Creating admin users...');
    const adminUsers = [
      {
        username: 'admin',
        password: await bcrypt.hash('admin123', 10),
        role: 'admin',
        email: 'admin@company.com',
        phone: '+1-555-0101',
        department: 'Management'
      },
      {
        username: 'superadmin',
        password: await bcrypt.hash('super123', 10),
        role: 'superAdmin',
        email: 'superadmin@company.com',
        phone: '+1-555-0102',
        department: 'Management'
      }
    ];

    for (const userData of adminUsers) {
      await User.create(userData);
      console.log(`✅ Created ${userData.role}: ${userData.username}`);
    }

    // Create Employee Users
    console.log('Creating employee users...');
    const employees = [
      {
        username: 'employee1',
        password: await bcrypt.hash('emp123', 10),
        role: 'employee',
        email: 'john.doe@company.com',
        phone: '+1-555-0201',
        department: 'Development'
      },
      {
        username: 'employee2',
        password: await bcrypt.hash('emp123', 10),
        role: 'employee',
        email: 'jane.smith@company.com',
        phone: '+1-555-0202',
        department: 'Design'
      },
      {
        username: 'employee3',
        password: await bcrypt.hash('emp123', 10),
        role: 'employee',
        email: 'mike.johnson@company.com',
        phone: '+1-555-0203',
        department: 'Development'
      },
      {
        username: 'employee4',
        password: await bcrypt.hash('emp123', 10),
        role: 'employee',
        email: 'sarah.wilson@company.com',
        phone: '+1-555-0204',
        department: 'Marketing'
      },
      {
        username: 'employee5',
        password: await bcrypt.hash('emp123', 10),
        role: 'employee',
        email: 'david.brown@company.com',
        phone: '+1-555-0205',
        department: 'Development'
      }
    ];

    const createdEmployees = [];
    for (const empData of employees) {
      const employee = await User.create(empData);
      createdEmployees.push(employee);
      console.log(`✅ Created employee: ${empData.username}`);
    }

    // Create Test Projects
    console.log('Creating test projects...');
    const projects = [
      {
        name: 'Test Project Alpha',
        description: 'Main development project for Q4 2024',
        employees: [createdEmployees[0]._id, createdEmployees[2]._id, createdEmployees[4]._id], // employee1, employee3, employee5
        date: new Date('2024-09-01')
      },
      {
        name: 'Test Project Beta',
        description: 'UI/UX redesign initiative',
        employees: [createdEmployees[1]._id, createdEmployees[3]._id], // employee2, employee4
        date: new Date('2024-09-15')
      },
      {
        name: 'Test Project Gamma',
        description: 'Marketing campaign for new product launch',
        employees: [createdEmployees[3]._id, createdEmployees[4]._id], // employee4, employee5
        date: new Date('2024-10-01')
      },
      {
        name: 'Test Project Delta',
        description: 'Mobile app development',
        employees: [createdEmployees[0]._id, createdEmployees[1]._id, createdEmployees[2]._id], // employee1, employee2, employee3
        date: new Date('2024-10-15')
      }
    ];

    const createdProjects = [];
    for (const projData of projects) {
      const project = await Project.create(projData);
      createdProjects.push(project);
      console.log(`✅ Created project: ${projData.name}`);
    }

    // Create Comprehensive Test Reports
    console.log('Creating comprehensive test reports...');
    
    // Generate reports for the last 2 months (August and September 2024)
    const startDate = new Date('2024-08-01');
    const endDate = new Date('2024-09-30');
    const currentDate = new Date(startDate);
    
    let reportCount = 0;
    
    while (currentDate <= endDate) {
      const dayOfWeek = currentDate.getDay();
      
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        // Create 1-3 reports per employee per workday
        for (let empIndex = 0; empIndex < createdEmployees.length; empIndex++) {
          const employee = createdEmployees[empIndex];
          const numReports = Math.floor(Math.random() * 3) + 1; // 1-3 reports
          
          for (let r = 0; r < numReports; r++) {
            // Assign random project to employee
            const availableProjects = createdProjects.filter(proj => 
              proj.employees.some(empId => empId.toString() === employee._id.toString())
            );
            
            if (availableProjects.length > 0) {
              const randomProject = availableProjects[Math.floor(Math.random() * availableProjects.length)];
              const hours = Math.floor(Math.random() * 4) + 1; // 1-4 hours per report
              
              // Create report with random time during the day
              const reportDate = new Date(currentDate);
              reportDate.setHours(9 + Math.floor(Math.random() * 8), Math.floor(Math.random() * 60), 0, 0);
              
              const reportData = {
                date: reportDate,
                hoursWorked: hours,
                description: `Test Report ${reportCount + 1} - ${randomProject.name} work session`,
                project: randomProject._id,
                employee: employee._id
              };
              
              await Report.create(reportData);
              reportCount++;
            }
          }
        }
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log(`✅ Created ${reportCount} test reports`);

    // Create specific September 1st report for employee5 (as mentioned in the issue)
    console.log('Creating specific September 1st report for employee5...');
    const employee5 = createdEmployees[4]; // employee5
    const projectAlpha = createdProjects[0]; // Test Project Alpha
    
    const sept1Report = {
      date: new Date('2024-09-01T10:00:00.000Z'),
      hoursWorked: 8,
      description: 'Test Report - September 1st special report for employee5',
      project: projectAlpha._id,
      employee: employee5._id
    };
    
    await Report.create(sept1Report);
    console.log('✅ Created September 1st report for employee5');

    // Create some reports for current week (to show in weekly reports)
    console.log('Creating current week reports...');
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + mondayOffset);
    
    for (let i = 0; i < 5; i++) { // Monday to Friday
      const reportDate = new Date(weekStart);
      reportDate.setDate(weekStart.getDate() + i);
      reportDate.setHours(9, 0, 0, 0);
      
      if (reportDate <= today) { // Only create reports for past days
        for (const employee of createdEmployees) {
          const availableProjects = createdProjects.filter(proj => 
            proj.employees.some(empId => empId.toString() === employee._id.toString())
          );
          
          if (availableProjects.length > 0) {
            const randomProject = availableProjects[Math.floor(Math.random() * availableProjects.length)];
            const hours = Math.floor(Math.random() * 6) + 2; // 2-7 hours
            
            const reportData = {
              date: reportDate,
              hoursWorked: hours,
              description: `Test Report - Current week work on ${randomProject.name}`,
              project: randomProject._id,
              employee: employee._id
            };
            
            await Report.create(reportData);
          }
        }
      }
    }
    console.log('✅ Created current week reports');

    console.log('\n🎉 Comprehensive test data creation completed!');
    console.log('\n📊 Test Data Summary:');
    console.log('👥 Users: 2 admins + 5 employees');
    console.log('📁 Projects: 4 test projects');
    console.log('📝 Reports: 200+ reports across 2 months');
    console.log('📅 Special: September 1st report for employee5');
    console.log('📅 Current: This week reports for all employees');
    
    console.log('\n🔑 Login Credentials:');
    console.log('Admin: admin / admin123');
    console.log('SuperAdmin: superadmin / super123');
    console.log('Employees: employee1-5 / emp123');
    
    console.log('\n🧪 Test Scenarios:');
    console.log('1. Admin Dashboard - View all employee data');
    console.log('2. Employee Dashboard - View personal data only');
    console.log('3. Daily Reports - Filter by specific dates');
    console.log('4. Weekly Reports - Check September 1st appears in correct week');
    console.log('5. Monthly Reports - View August and September data');
    console.log('6. Project Management - Assign employees to projects');
    console.log('7. User Management - Create/edit users');

  } catch (error) {
    console.error('Error creating comprehensive test data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB.');
  }
};

createComprehensiveTestData();
