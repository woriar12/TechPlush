/**
 * Normalizes multipart/form-data values before Joi validation and controller processing.
 */
const normalizeBlogData = (req, res, next) => {
    if (!req.body) {
        req.body = {};
        return next();
    }

    if (typeof req.body.tags === "string") {
        const trimmed = req.body.tags.trim();
        if (!trimmed) {
            req.body.tags = [];
        } else if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
                req.body.tags = JSON.parse(trimmed);
            } catch (e) {
                req.body.tags = trimmed.replace(/^\[|\]$/g, "").split(",").map(s => s.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
            }
        } else {
            req.body.tags = trimmed.split(",").map(s => s.trim()).filter(Boolean);
        }
    }

    if (req.body.isFeatured !== undefined) {
        req.body.isFeatured = req.body.isFeatured === true || req.body.isFeatured === "true" || req.body.isFeatured === 1 || req.body.isFeatured === "1";
    }

    if (req.body.scheduledAt === "" || req.body.scheduledAt === "null" || req.body.scheduledAt === null) {
        req.body.scheduledAt = null;
    }

    let keywords = req.body.keywords;
    if (typeof keywords === "string") {
        const trimmed = keywords.trim();
        if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
            try {
                keywords = JSON.parse(trimmed);
            } catch (e) {
                keywords = trimmed.replace(/^\[|\]$/g, "").split(",").map(s => s.trim().replace(/^['"]|['"]$/g, "")).filter(Boolean);
            }
        } else if (trimmed) {
            keywords = trimmed.split(",").map(s => s.trim()).filter(Boolean);
        } else {
            keywords = [];
        }
        req.body.keywords = keywords;
    }

    if (!req.body.seo && (req.body.metaTitle || req.body.metaDescription || req.body.keywords)) {
        req.body.seo = {
            metaTitle: req.body.metaTitle || "",
            metaDescription: req.body.metaDescription || "",
            keywords: req.body.keywords || [],
        };
    } else if (typeof req.body.seo === "string") {
        try {
            req.body.seo = JSON.parse(req.body.seo);
        } catch (e) {
            req.body.seo = {};
        }
    }

    next();
};

module.exports = normalizeBlogData;
