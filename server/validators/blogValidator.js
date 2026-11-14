const Joi = require("joi");

const blogValidator = Joi.object({
    title: Joi.string().trim().min(3).max(200).required().messages({
        "string.empty": "Blog title is required",
        "any.required": "Blog title is required",
    }),

    excerpt: Joi.string().trim().max(500).allow("").default(""),

    content: Joi.alternatives().try(
        Joi.string().required(),
        Joi.object().required()
    ).messages({
        "any.required": "Blog content is required",
    }),

    category: Joi.string().hex().length(24).required().messages({
        "string.hex": "Valid category ID is required",
        "any.required": "Category is required",
    }),

    tags: Joi.alternatives().try(
        Joi.array().items(Joi.string().hex().length(24)),
        Joi.string().allow("")
    ).default([]),

    author: Joi.string().hex().length(24).required().messages({
        "string.hex": "Valid author ID is required",
        "any.required": "Author is required",
    }),

    status: Joi.string()
        .valid("draft", "published", "scheduled")
        .default("draft"),

    isFeatured: Joi.boolean().default(false),

    scheduledAt: Joi.date().iso().allow(null, "").default(null),

    altText: Joi.string().max(200).allow("").optional(),
    metaTitle: Joi.string().max(70).allow("").optional(),
    metaDescription: Joi.string().max(160).allow("").optional(),
    keywords: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string().allow("")
    ).optional(),

    seo: Joi.object({
        metaTitle: Joi.string().max(70).allow(""),
        metaDescription: Joi.string().max(160).allow(""),
        keywords: Joi.alternatives().try(
            Joi.array().items(Joi.string()),
            Joi.string().allow("")
        ),
    }).optional(),
});

const updateBlogValidator = Joi.object({
    title: Joi.string().trim().min(3).max(200),
    excerpt: Joi.string().trim().max(500).allow(""),
    content: Joi.alternatives().try(
        Joi.string(),
        Joi.object()
    ),
    category: Joi.string().hex().length(24),
    tags: Joi.alternatives().try(
        Joi.array().items(Joi.string().hex().length(24)),
        Joi.string().allow("")
    ),
    author: Joi.string().hex().length(24),
    status: Joi.string().valid("draft", "published", "scheduled"),
    isFeatured: Joi.boolean(),
    scheduledAt: Joi.date().iso().allow(null, ""),
    altText: Joi.string().max(200).allow(""),
    metaTitle: Joi.string().max(70).allow(""),
    metaDescription: Joi.string().max(160).allow(""),
    keywords: Joi.alternatives().try(
        Joi.array().items(Joi.string()),
        Joi.string().allow("")
    ),
    seo: Joi.object({
        metaTitle: Joi.string().max(70).allow(""),
        metaDescription: Joi.string().max(160).allow(""),
        keywords: Joi.alternatives().try(
            Joi.array().items(Joi.string()),
            Joi.string().allow("")
        ),
    }),
}).min(0);

module.exports = {
    blogValidator,
    updateBlogValidator,
};
