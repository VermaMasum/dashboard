const mongoose = require('mongoose');
const Project = require('./models/Project');

// Connect to MongoDB - Using the same database as your app
mongoose.connect('mongodb://localhost:27017/employee-dashboard', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function fixProjectStatus() {
  try {
    console.log('🔧 Fixing project status fields...');
    
    // Find all projects
    const allProjects = await Project.find({});
    console.log(`📊 Found ${allProjects.length} total projects`);

    // Check which projects are missing status or have null/undefined status
    const projectsNeedingUpdate = allProjects.filter(project => 
      !project.status || project.status === null || project.status === undefined
    );

    console.log(`⚠️  Found ${projectsNeedingUpdate.length} projects without status field`);

    if (projectsNeedingUpdate.length === 0) {
      console.log('✅ All projects already have status field');
      
      // Show current status distribution
      const statusCounts = {
        'not started': allProjects.filter(p => p.status === 'not started').length,
        'in progress': allProjects.filter(p => p.status === 'in progress').length,
        'completed': allProjects.filter(p => p.status === 'completed').length,
        'undefined/null': allProjects.filter(p => !p.status).length
      };
      
      console.log('\n📈 Current status distribution:');
      Object.entries(statusCounts).forEach(([status, count]) => {
        console.log(`  ${status}: ${count} projects`);
      });
      
      return;
    }

    // Update projects without status to 'not started'
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
    console.log('\n📋 Updated project statuses:');
    updatedProjects.forEach(project => {
      console.log(`- ${project.name}: ${project.status}`);
    });

    // Show final status distribution
    const finalStatusCounts = {
      'not started': updatedProjects.filter(p => p.status === 'not started').length,
      'in progress': updatedProjects.filter(p => p.status === 'in progress').length,
      'completed': updatedProjects.filter(p => p.status === 'completed').length
    };
    
    console.log('\n📈 Final status distribution:');
    Object.entries(finalStatusCounts).forEach(([status, count]) => {
      console.log(`  ${status}: ${count} projects`);
    });

  } catch (error) {
    console.error('❌ Error fixing project statuses:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the fix
fixProjectStatus();
