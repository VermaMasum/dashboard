const mongoose = require('mongoose');
const Report = require('./models/Report');
const Project = require('./models/Project');
const User = require('./models/User');
require('dotenv').config();

const checkReportsDates = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Get all reports
    const reports = await Report.find().populate('project', 'name').populate('employee', 'username');
    
    console.log(`\n📊 Total reports found: ${reports.length}`);
    
    if (reports.length === 0) {
      console.log('No reports found in database.');
      
      // Create some sample reports with different dates
      const projects = await Project.find();
      const employees = await User.find({ role: 'employee' });
      
      if (projects.length === 0 || employees.length === 0) {
        console.log('No projects or employees found. Cannot create sample reports.');
        return;
      }
      
      console.log('Creating sample reports with different dates...');
      
      const today = new Date();
      const sampleReports = [
        {
          date: today,
          project: projects[0]._id,
          employee: employees[0]._id,
          title: 'Today Report',
          details: 'Work done today',
          hoursWorked: 8
        },
        {
          date: new Date(today.getTime() - 24 * 60 * 60 * 1000), // Yesterday
          project: projects[0]._id,
          employee: employees[0]._id,
          title: 'Yesterday Report',
          details: 'Work done yesterday',
          hoursWorked: 7
        },
        {
          date: new Date(today.getTime() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          project: projects[0]._id,
          employee: employees[0]._id,
          title: 'Two Days Ago Report',
          details: 'Work done two days ago',
          hoursWorked: 6
        }
      ];
      
      for (const reportData of sampleReports) {
        const report = new Report(reportData);
        await report.save();
        console.log(`✅ Created report: ${report.title} for ${report.date.toDateString()}`);
      }
      
      // Get updated reports
      const updatedReports = await Report.find().populate('project', 'name').populate('employee', 'username');
      reports = updatedReports;
    }
    
    // Group reports by date
    const reportsByDate = {};
    reports.forEach(report => {
      const dateStr = new Date(report.date).toDateString();
      if (!reportsByDate[dateStr]) {
        reportsByDate[dateStr] = [];
      }
      reportsByDate[dateStr].push(report);
    });
    
    console.log('\n📅 Reports grouped by date:');
    Object.keys(reportsByDate).sort().forEach(date => {
      console.log(`\n${date}: ${reportsByDate[date].length} reports`);
      reportsByDate[date].forEach(report => {
        console.log(`  - ${report.title} by ${report.employee?.username || 'Unknown'} on ${report.project?.name || 'Unknown'}`);
        console.log(`    Date: ${report.date} (${typeof report.date})`);
        console.log(`    Hours: ${report.hoursWorked}`);
      });
    });
    
    // Show unique dates
    const uniqueDates = Array.from(new Set(reports.map(r => new Date(r.date).toDateString())));
    console.log(`\n📅 Unique dates in database: ${uniqueDates.join(', ')}`);
    
    // Test date filtering
    console.log('\n🔍 Testing date filtering:');
    const testDate = new Date();
    const startDate = new Date(testDate);
    const endDate = new Date(testDate);
    endDate.setDate(endDate.getDate() + 1);
    
    const todayReports = await Report.find({
      date: { $gte: startDate, $lt: endDate }
    });
    
    console.log(`Reports for today (${testDate.toDateString()}): ${todayReports.length}`);
    
  } catch (error) {
    console.error('❌ Error checking reports:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

checkReportsDates();
