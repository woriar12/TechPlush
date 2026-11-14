const Joi = require("joi");

const loginValidator = Joi.object({
    email: Joi.string()
        .email()
        .trim()
        .required()
        .messages({
            "string.email": "Enter a valid email address",
            "any.required": "Email is required",
            "string.empty": "Email cannot be empty",
        }),

    password: Joi.string()
        .min(8)
        .required()
        .messages({
            "string.min": "Password must be at least 8 characters",
            "any.required": "Password is required",
            "string.empty": "Password cannot be empty",
        }),
});

module.exports = { loginValidator };