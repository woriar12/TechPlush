const Joi = require("joi");

const contactValidator = Joi.object({
    name: Joi.string().trim().min(1).max(100).required(),
    email: Joi.string().trim().email().max(254).required(),
    subject: Joi.string().trim().max(150).pattern(/^[^\r\n]*$/).allow("").default(""),
    message: Joi.string().trim().min(1).max(5000).required(),
});

module.exports = { contactValidator };
