const mongoose = require('mongoose');
const Project = require('./models/Project');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/your-database-name', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function updateProjectStatus() {
  try {
    console.log('🔄 Updating project statuses...');
    
    // Find all projects that don't have a status field or have null/undefined status
    const projectsWithoutStatus = await Project.find({
      $or: [
        { status: { $exists: false } },
        { status: null },
        { status: undefined }
      ]
    });

    console.log(`📊 Found ${projectsWithoutStatus.length} projects without status`);

    if (projectsWithoutStatus.length === 0) {
      console.log('✅ All projects already have status field');
      return;
    }

    // Update all projects without status to 'not started'
    const updateResult = await Project.updateMany(
      {
        $or: [
          { status: { $exists: false } },
          { status: null },
          { status: undefined }
        ]
      },
      { $set: { status: 'not started' } }
    );

    console.log(`✅ Updated ${updateResult.modifiedCount} projects with status: 'not started'`);

    // Verify the update
    const updatedProjects = await Project.find({});
    console.log('\n📋 Current project statuses:');
    updatedProjects.forEach(project => {
      console.log(`- ${project.name}: ${project.status || 'NO STATUS'}`);
    });

  } catch (error) {
    console.error('❌ Error updating project statuses:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the update
updateProjectStatus();

