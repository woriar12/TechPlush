const jwt = require("jsonwebtoken");

const generateToken = (payload, expiresIn = process.env.JWT_EXPIRES_IN || "1d") => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn,
    });
};

module.exports = generateToken;
