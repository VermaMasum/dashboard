const mongoose = require("mongoose");
const User = require("./models/User");

// Connect to MongoDB
mongoose.connect("mongodb://localhost:27017/AdminModule", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createEmployeeUsers() {
  try {
    console.log("🚀 Creating employee users...");

    const employees = [
      {
        username: "john_doe",
        password: "password123",
        role: "employee",
      },
      {
        username: "jane_smith",
        password: "password123",
        role: "employee",
      },
      {
        username: "employee2",
        password: "password123",
        role: "employee",
      },
      {
        username: "employee3",
        password: "password123",
        role: "employee",
      },
      {
        username: "Employee4",
        password: "password123",
        role: "employee",
      },
    ];

    for (const empData of employees) {
      const existingUser = await User.findOne({ username: empData.username });
      if (!existingUser) {
        const user = new User(empData);
        await user.save();
        console.log(
          `✅ Employee user created: ${empData.username}/password123`
        );
      } else {
        console.log(`ℹ️ Employee user already exists: ${empData.username}`);
      }
    }

    console.log("✅ Employee users creation completed!");
    console.log("\n📝 Employee Test Credentials:");
    console.log("john_doe/password123");
    console.log("jane_smith/password123");
    console.log("employee2/password123");
    console.log("employee3/password123");
    console.log("Employee4/password123");
  } catch (error) {
    console.error("❌ Error creating employee users:", error);
  } finally {
    mongoose.connection.close();
  }
}

createEmployeeUsers();


