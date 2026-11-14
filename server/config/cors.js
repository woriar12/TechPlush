const cors = require("cors");

const allowedOrigins = [
    process.env.CLIENT_URL,
    "http://localhost:5173",
    "http://localhost:3000",
].filter(Boolean);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);

        const cleanOrigin = origin.replace(/\/$/, "");
        const isAllowed = allowedOrigins.some((allowed) => {
            const cleanAllowed = allowed.replace(/\/$/, "");
            return cleanOrigin === cleanAllowed;
        }) || cleanOrigin.endsWith(".vercel.app");

        if (isAllowed || process.env.NODE_ENV !== "production") {
            return callback(null, true);
        }

        return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
};

module.exports = cors(corsOptions);