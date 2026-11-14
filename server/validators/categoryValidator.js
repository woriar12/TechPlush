const Joi = require("joi");

const categoryValidator = Joi.object({
    name: Joi.string()
        .trim()
        .min(2)
        .max(100)
        .required()
        .messages({
            "string.empty": "Category name is required",
            "string.min": "Category name must have at least 2 characters",
            "string.max": "Category name cannot exceed 100 characters",
        }),

    description: Joi.string()
        .trim()
        .max(500)
        .allow(""),
});

const updateCategoryValidator = Joi.object({
    name: Joi.string().trim().min(2).max(100),
    description: Joi.string().trim().max(500).allow(""),
    isActive: Joi.boolean(),
}).min(1);

module.exports = {
    categoryValidator,
    updateCategoryValidator,
};