const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoURI =
      process.env.MONGO_URI || "mongodb://127.0.0.1:27017/AdminModule";
    
    // Hide sensitive connection string details in logs
    const safeURI = mongoURI.includes('@') 
      ? mongoURI.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')
      : mongoURI;
    
    console.log("🔗 Connecting to MongoDB:", safeURI);
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    });
    
    console.log("✅ MongoDB connected successfully");
    console.log("📦 Database:", mongoose.connection.db.databaseName);
    
    return true;
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    console.error("❌ Full error:", err);
    
    // Check for common errors
    if (err.message.includes('ECONNREFUSED')) {
      console.error("💡 Tip: Make sure MongoDB is running locally or check your MONGO_URI");
    } else if (err.message.includes('authentication failed')) {
      console.error("💡 Tip: Check your MongoDB username and password in MONGO_URI");
    } else if (err.message.includes('Could not connect')) {
      console.error("💡 Tip: Check your internet connection and MongoDB Atlas whitelist");
    }
    
    throw err; // Re-throw to stop server startup
  }
};

module.exports = connectDB;
