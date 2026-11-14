const Admin = require("../models/Admin");
const RevokedToken = require("../models/RevokedToken");
const bcrypt = require("bcryptjs");
const { randomUUID } = require("crypto");
const generateToken = require("../utils/generateToken");
const hashToken = require("../utils/hashToken");

const loginAdmin = async({ email, password }) => {
    if (!email || !password) {
        const error = new Error("Email and password are required");
        error.statusCode = 400;
        throw error;
    }

    const admin = await Admin.findOne({
        email: email.toLowerCase().trim(),
    }).select("+password");

    if (!admin) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    if (admin.isActive === false) {
        const error = new Error("Admin account is inactive");
        error.statusCode = 403;
        throw error;
    }

    const isPasswordValid = await bcrypt.compare(
        password,
        admin.password
    );

    if (!isPasswordValid) {
        const error = new Error("Invalid email or password");
        error.statusCode = 401;
        throw error;
    }

    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not configured");
    }

    const token = generateToken({
        id: admin._id,
        role: admin.role,
        jti: randomUUID(),
    });

    return {
        token,
        admin: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
        },
    };
};

const logoutAdmin = async(token, tokenPayload) => {
    if (!token || !tokenPayload?.exp) {
        const error = new Error("A valid expiring token is required for logout.");
        error.statusCode = 401;
        throw error;
    }

    try {
        await RevokedToken.updateOne(
            { tokenHash: hashToken(token) },
            { $setOnInsert: { expiresAt: new Date(tokenPayload.exp * 1000) } },
            { upsert: true }
        );
    } catch (error) {
        if (error.code !== 11000) throw error;
    }

    return true;
};

const getAdminProfile = async(adminId) => {
    const admin = await Admin.findById(adminId).select(
        "-password"
    );

    if (!admin) {
        const error = new Error("Admin not found");
        error.statusCode = 404;
        throw error;
    }

    return admin;
};

module.exports = {
    loginAdmin,
    logoutAdmin,
    getAdminProfile,
};