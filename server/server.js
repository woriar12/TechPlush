const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const app = require("./app");
const connectDB = require("./config/db");
const publishScheduledBlogs = require("./jobs/scheduledPublisher");
const cron = require("node-cron");

const PORT = process.env.PORT || 5000;

const startServer = async() => {
    try {
        await connectDB();

        cron.schedule("* * * * *", publishScheduledBlogs);

        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
            console.log(`API: http://localhost:${PORT}/api/health`);
            console.log("Scheduled publisher is active");
        });
    } catch (error) {
        console.error("Server startup failed:", error.message);
        process.exit(1);
    }
};

startServer();