const config = require("./config/env");
const connectDB = require("./config/db");
const app = require("./app");
const { startScheduler } = require("./services/scheduler");

async function start() {
  try {
    await connectDB();
    app.listen(config.port, () => console.log(`Server running on port ${config.port} (${config.nodeEnv})`));
    startScheduler();
  } catch (err) {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  }
}

start();
