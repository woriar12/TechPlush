/**
 * Generate a clean, URL-safe slug from a string.
 * @param {string} text - Input text
 * @returns {string} Clean URL slug
 */
const generateSlug = (text) => {
    if (!text || typeof text !== "string") {
        return "";
    }

    return text
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

module.exports = generateSlug;
