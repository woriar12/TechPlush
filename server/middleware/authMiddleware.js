const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const RevokedToken = require("../models/RevokedToken");
const hashToken = require("../utils/hashToken");

const protect = async(req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({
                success: false,
                message: "Authentication required. Please login.",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Invalid authentication token.",
            });
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("JWT_SECRET is not configured");
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        let isRevoked;
        try {
            isRevoked = await RevokedToken.exists({
                tokenHash: hashToken(token),
                expiresAt: { $gt: new Date() },
            });
        } catch (error) {
            console.error("Token revocation check failed:", error.code || error.name || "UNKNOWN_ERROR");
            return res.status(503).json({
                success: false,
                message: "Authentication is temporarily unavailable.",
            });
        }

        if (isRevoked) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token.",
            });
        }

        const admin = await Admin.findById(decoded.id).select("-password");

        if (!admin || !admin.isActive || admin.role !== "admin") {
            return res.status(401).json({
                success: false,
                message: "Invalid or inactive admin account.",
            });
        }

        req.admin = admin;
        req.authToken = token;
        req.authTokenPayload = decoded;

        next();
    } catch (error) {
        if (
            error.name === "JsonWebTokenError" ||
            error.name === "TokenExpiredError"
        ) {
            return res.status(401).json({
                success: false,
                message: "Invalid or expired token.",
            });
        }

        next(error);
    }
};

module.exports = { protect };