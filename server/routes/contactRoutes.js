const express = require("express");
const router = express.Router();

const { submitContactMessage } = require("../controllers/contactController");
const { contactLimiter } = require("../middleware/rateLimitMiddleware");
const validate = require("../middleware/validateMiddleware");
const { contactValidator } = require("../validators/contactValidator");

router.post("/", contactLimiter, validate(contactValidator), submitContactMessage);

module.exports = router;
