const Joi = require("joi");

const authorValidator = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty": "Author name is required",
            "string.min": "Author name must be at least 2 characters",
            "string.max": "Author name cannot exceed 100 characters",
        }),

    designation: Joi.string().trim().max(100).allow("").default(""),

    bio: Joi.string().trim().max(1000).allow("").default(""),

    socialLinks: Joi.alternatives().try(
        Joi.object({
            linkedin: Joi.string().allow("").optional(),
            twitter: Joi.string().allow("").optional(),
            website: Joi.string().allow("").optional(),
        }),
        Joi.string().allow("")
    ).optional(),
});

const updateAuthorValidator = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    designation: Joi.string().trim().max(100).allow(""),
    bio: Joi.string().trim().max(1000).allow(""),
    isActive: Joi.boolean(),
    socialLinks: Joi.alternatives().try(
        Joi.object({
            linkedin: Joi.string().allow("").optional(),
            twitter: Joi.string().allow("").optional(),
            website: Joi.string().allow("").optional(),
        }),
        Joi.string().allow("")
    ).optional(),
}).min(1);

module.exports = {
    authorValidator,
    updateAuthorValidator,
};
