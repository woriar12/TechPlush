const Joi = require("joi");

const tagValidator = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(50)
        .required()
        .messages({
            "string.empty": "Tag name is required",
            "string.min": "Tag name must have at least 2 characters",
            "string.max": "Tag name cannot exceed 50 characters",
        }),

    description: Joi.string()
        .trim()
        .max(250)
        .allow(""),
});

const updateTagValidator = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(50),

    description: Joi.string()
        .trim()
        .max(250)
        .allow(""),

    isActive: Joi.boolean(),
}).min(1);

module.exports = {
    tagValidator,
    updateTagValidator,
};