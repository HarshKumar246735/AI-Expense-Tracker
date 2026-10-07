const mongoose = require("mongoose");
const config = require("./env");

async function connectDB() {
  mongoose.set("strictQuery", true);
  await mongoose.connect(config.mongoUri);
  console.log("MongoDB connected");
}

module.exports = connectDB;
