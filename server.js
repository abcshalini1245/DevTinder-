require("dotenv").config();

const http = require("http");
const { Server } = require("socket.io");

const app = require("./app");


const connectDB = require("./src/config/database");
const startDailyNotificationCron = require("./src/cron/dailyNotificationCron");
const initializeSocket = require("./src/config/socket");

const server = http.createServer(app);
// const initializeSocket = require("./src/config/socket");


const io = new Server(server, {
    
  cors: {
    origin: [
      "http://localhost:5173",
      "http://3.26.8.106",
      "http://devnexus.duckdns.org",
    ],
    credentials: true,
  },
});
console.log("Socket.IO Initialized");
// Initialize Socket.IO
initializeSocket(io);

// Connect Database and Start Server
connectDB()
  .then(() => {
    console.log("✅ Connected to MongoDB");
    
    console.log("Calling cron...");
    startDailyNotificationCron();

    server.listen(7777, () => {
      console.log("🚀 Server running on port 7777");
    });
  })
  .catch((err) => {
    console.error("❌ Error connecting to MongoDB:", err);
  });