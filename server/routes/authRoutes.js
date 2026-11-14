const express = require("express");
const router = express.Router();

const {
    login,
    logout,
    getCurrentAdmin,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");
const validate = require("../middleware/validateMiddleware");
const { loginValidator } = require("../validators/authValidator");
const { authLimiter } = require("../middleware/rateLimitMiddleware");

router.post("/login", authLimiter, validate(loginValidator), login);
router.post("/logout", protect, logout);
router.get("/me", protect, getCurrentAdmin);

module.exports = router;