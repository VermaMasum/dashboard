const mongoose = require('mongoose');
const Project = require('./models/Project');
const User = require('./models/User');
const Report = require('./models/Report');
require('dotenv').config();

const createSampleData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Create sample employees if they don't exist
    let employees = await User.find({ role: 'employee' });
    if (employees.length === 0) {
      console.log('Creating sample employees...');
      const sampleEmployees = [
        { username: 'john_doe', password: 'password123', role: 'employee' },
        { username: 'jane_smith', password: 'password123', role: 'employee' },
        { username: 'mike_wilson', password: 'password123', role: 'employee' }
      ];

      for (const empData of sampleEmployees) {
        const employee = new User(empData);
        await employee.save();
        console.log(`Created employee: ${employee.username}`);
      }
      employees = await User.find({ role: 'employee' });
    }

    // Create sample projects if they don't exist
    let projects = await Project.find();
    if (projects.length === 0) {
      console.log('Creating sample projects...');
      const sampleProjects = [
        {
          name: 'Website Development',
          description: 'Building a new company website with modern design',
          date: new Date(),
          employees: [employees[0]._id, employees[1]._id]
        },
        {
          name: 'Mobile App Development',
          description: 'Developing a cross-platform mobile application',
          date: new Date(),
          employees: [employees[1]._id, employees[2]._id]
        },
        {
          name: 'Database Migration',
          description: 'Migrating legacy data to new database system',
          date: new Date(),
          employees: [employees[0]._id, employees[2]._id]
        },
        {
          name: 'API Integration',
          description: 'Integrating third-party APIs for payment processing',
          date: new Date(),
          employees: [employees[1]._id]
        }
      ];

      for (const projectData of sampleProjects) {
        const project = new Project(projectData);
        await project.save();
        console.log(`Created project: ${project.name}`);
      }
      projects = await Project.find();
    }

    // Create sample reports if they don't exist
    let reports = await Report.find();
    if (reports.length === 0) {
      console.log('Creating sample reports...');
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const sampleReports = [
        {
          date: today,
          project: projects[0]._id,
          employee: employees[0]._id,
          title: 'Frontend Development',
          details: 'Worked on responsive design and user interface components',
          hoursWorked: 8
        },
        {
          date: today,
          project: projects[1]._id,
          employee: employees[1]._id,
          title: 'Mobile App Testing',
          details: 'Conducted comprehensive testing of mobile application features',
          hoursWorked: 6
        },
        {
          date: yesterday,
          project: projects[0]._id,
          employee: employees[0]._id,
          title: 'Backend API Development',
          details: 'Developed RESTful APIs for user authentication and data management',
          hoursWorked: 7
        },
        {
          date: yesterday,
          project: projects[2]._id,
          employee: employees[2]._id,
          title: 'Database Schema Design',
          details: 'Designed new database schema and migration scripts',
          hoursWorked: 8
        }
      ];

      for (const reportData of sampleReports) {
        const report = new Report(reportData);
        await report.save();
        console.log(`Created report: ${report.title}`);
      }
    }

    console.log('\n✅ Sample data creation completed!');
    console.log(`📊 Employees: ${employees.length}`);
    console.log(`📊 Projects: ${projects.length}`);
    console.log(`📊 Reports: ${reports.length}`);

  } catch (error) {
    console.error('❌ Error creating sample data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

createSampleData();
