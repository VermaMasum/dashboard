const mongoose = require('mongoose');
const Project = require('./models/Project');
const User = require('./models/User');
const Report = require('./models/Report');
require('dotenv').config();

const addReportsWithDifferentDates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get existing projects and employees
    const projects = await Project.find();
    const employees = await User.find({ role: 'employee' });

    if (projects.length === 0) {
      console.log('No projects found. Please create projects first.');
      return;
    }

    if (employees.length === 0) {
      console.log('No employees found. Please create employees first.');
      return;
    }

    console.log(`Found ${projects.length} projects and ${employees.length} employees`);

    // Create reports for different dates
    const today = new Date();
    const dates = [
      today, // Today
      new Date(today.getTime() - 24 * 60 * 60 * 1000), // Yesterday
      new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      new Date(today.getTime() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      new Date(today.getTime() + 24 * 60 * 60 * 1000), // Tomorrow
    ];

    const reportTitles = [
      'Frontend Development',
      'Backend API Work',
      'Database Optimization',
      'Testing and QA',
      'Code Review',
      'Bug Fixes',
      'Feature Implementation',
      'Documentation',
    ];

    const reportDetails = [
      'Worked on responsive design and user interface components',
      'Developed RESTful APIs for data management',
      'Optimized database queries for better performance',
      'Conducted comprehensive testing of application features',
      'Reviewed code changes and provided feedback',
      'Fixed critical bugs in the authentication system',
      'Implemented new user dashboard features',
      'Updated technical documentation and user guides',
    ];

    for (let i = 0; i < dates.length; i++) {
      const date = dates[i];
      const project = projects[i % projects.length];
      const employee = employees[i % employees.length];
      const title = reportTitles[i % reportTitles.length];
      const details = reportDetails[i % reportDetails.length];

      // Check if report already exists for this date, project, and employee
      const existingReport = await Report.findOne({
        date: date,
        project: project._id,
        employee: employee._id
      });

      if (!existingReport) {
        const report = new Report({
          date: date,
          project: project._id,
          employee: employee._id,
          title: title,
          details: details,
          hoursWorked: Math.floor(Math.random() * 8) + 1, // Random hours between 1-8
        });

        await report.save();
        console.log(`✅ Created report: "${title}" for ${date.toDateString()} by ${employee.username} on ${project.name}`);
      } else {
        console.log(`⏭️  Report already exists for ${date.toDateString()} by ${employee.username} on ${project.name}`);
      }
    }

    // Show summary of all reports
    const allReports = await Report.find().populate('project', 'name').populate('employee', 'username');
    console.log(`\n📊 Total reports in database: ${allReports.length}`);
    
    // Group by date
    const reportsByDate = {};
    allReports.forEach(report => {
      const dateStr = new Date(report.date).toDateString();
      if (!reportsByDate[dateStr]) {
        reportsByDate[dateStr] = [];
      }
      reportsByDate[dateStr].push(report);
    });

    console.log('\n📅 Reports by date:');
    Object.keys(reportsByDate).sort().forEach(date => {
      console.log(`  ${date}: ${reportsByDate[date].length} reports`);
      reportsByDate[date].forEach(report => {
        console.log(`    - ${report.title} by ${report.employee.username} on ${report.project.name}`);
      });
    });

  } catch (error) {
    console.error('❌ Error adding reports:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

addReportsWithDifferentDates();
