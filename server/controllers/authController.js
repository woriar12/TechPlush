const authService = require("../services/authService");

const login = async(req, res, next) => {
    try {
        const { email, password } = req.body;

        const result = await authService.loginAdmin({
            email,
            password,
        });

        res.status(200).json({
            success: true,
            message: "Admin login successful",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const logout = async(req, res, next) => {
    try {
        await authService.logoutAdmin(req.authToken, req.authTokenPayload);

        res.status(200).json({
            success: true,
            message: "Admin logout successful",
        });
    } catch (error) {
        console.error("Admin token revocation failed:", error.code || error.name || "UNKNOWN_ERROR");
        res.status(503).json({
            success: false,
            message: "Unable to end the server session. Please try again.",
        });
    }
};

const getCurrentAdmin = async(req, res, next) => {
    try {
        const admin = await authService.getAdminProfile(req.admin._id);

        res.status(200).json({
            success: true,
            data: admin,
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    login,
    logout,
    getCurrentAdmin,
};