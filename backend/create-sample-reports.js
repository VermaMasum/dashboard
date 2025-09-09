const mongoose = require('mongoose');
require('dotenv').config();

const reportSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  details: { type: String },
  hoursWorked: { type: Number },
});

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  assignedEmployees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Employee' }],
});

const employeeSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'employee' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  department: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const Report = mongoose.model('Report', reportSchema);
const Project = mongoose.model('Project', projectSchema);
const Employee = mongoose.model('Employee', employeeSchema);

const createSampleReports = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    // Get existing projects and employees
    const projects = await Project.find({});
    const employees = await Employee.find({});

    if (projects.length === 0 || employees.length === 0) {
      console.log('❌ No projects or employees found. Please create them first.');
      return;
    }

    // Create sample reports
    const sampleReports = [
      {
        date: new Date(),
        project: projects[0]._id,
        employee: employees[0]._id,
        details: 'Completed user authentication module and implemented login functionality.',
        hoursWorked: 8
      },
      {
        date: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        project: projects[1] ? projects[1]._id : projects[0]._id,
        employee: employees[1] ? employees[1]._id : employees[0]._id,
        details: 'Worked on database schema design and API endpoint development.',
        hoursWorked: 6
      },
      {
        date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        project: projects[0]._id,
        employee: employees[0]._id,
        details: 'Fixed bugs in the frontend components and improved UI responsiveness.',
        hoursWorked: 7
      }
    ];

    for (const reportData of sampleReports) {
      const existingReport = await Report.findOne({
        date: reportData.date,
        employee: reportData.employee,
        project: reportData.project
      });

      if (!existingReport) {
        const report = new Report(reportData);
        await report.save();
        console.log(`✅ Report created for ${employees.find(e => e._id.toString() === reportData.employee.toString())?.username} on ${projects.find(p => p._id.toString() === reportData.project.toString())?.name}`);
      } else {
        console.log(`ℹ️ Report already exists for this employee and project on this date`);
      }
    }

    console.log('🎉 Sample reports created successfully!');

  } catch (error) {
    console.error('❌ Error creating sample reports:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createSampleReports();
