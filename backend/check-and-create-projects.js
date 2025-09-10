const mongoose = require('mongoose');
const Project = require('./models/Project');
const User = require('./models/User');
require('dotenv').config();

const checkAndCreateProjects = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Check existing projects
    const existingProjects = await Project.find();
    console.log(`Found ${existingProjects.length} existing projects:`);
    existingProjects.forEach(project => {
      console.log(`- ${project.name} (ID: ${project._id})`);
    });

    // Check existing employees
    const employees = await User.find({ role: 'employee' });
    console.log(`Found ${employees.length} employees:`);
    employees.forEach(emp => {
      console.log(`- ${emp.username} (ID: ${emp._id})`);
    });

    // Create sample projects if none exist
    if (existingProjects.length === 0) {
      console.log('Creating sample projects...');
      
      const sampleProjects = [
        {
          name: 'Website Development',
          description: 'Building a new company website',
          date: new Date(),
          employees: employees.length > 0 ? [employees[0]._id] : []
        },
        {
          name: 'Mobile App',
          description: 'Developing a mobile application',
          date: new Date(),
          employees: employees.length > 1 ? [employees[1]._id] : employees.length > 0 ? [employees[0]._id] : []
        },
        {
          name: 'Database Migration',
          description: 'Migrating to new database system',
          date: new Date(),
          employees: employees.length > 2 ? [employees[2]._id] : employees.length > 0 ? [employees[0]._id] : []
        }
      ];

      for (const projectData of sampleProjects) {
        const project = new Project(projectData);
        await project.save();
        console.log(`Created project: ${project.name}`);
      }
    }

    // Verify projects were created
    const finalProjects = await Project.find().populate('employees', 'username');
    console.log(`\nFinal project count: ${finalProjects.length}`);
    finalProjects.forEach(project => {
      console.log(`- ${project.name} (Employees: ${project.employees.map(emp => emp.username).join(', ')})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

checkAndCreateProjects();
