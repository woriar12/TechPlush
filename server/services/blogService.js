const Blog = require("../models/Blog");
const Category = require("../models/Category");
const Tag = require("../models/Tag");
const Author = require("../models/Author");
const { uploadImage, cleanupImage } = require("./imageService");
const generateSlug = require("../utils/generateSlug");

const createUniqueSlug = async(title, excludeId = null) => {
    const baseSlug = generateSlug(title);

    if (!baseSlug) {
        const error = new Error("A valid blog title is required");
        error.statusCode = 400;
        throw error;
    }

    let slug = baseSlug;
    let counter = 1;

    while (true) {
        const query = { slug };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const existing = await Blog.findOne(query);

        if (!existing) return slug;

        slug = `${baseSlug}-${counter}`;
        counter++;
    }
};

const extractText = (value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (Array.isArray(value)) {
        return value.map(extractText).join(" ");
    }
    if (typeof value === "object") {
        return Object.entries(value)
            .filter(([key]) => key === "text" || key === "content")
            .map(([, item]) => extractText(item))
            .join(" ");
    }
    return "";
};

const parseListValue = (value) => {
    if (typeof value !== "string") {
        return value;
    }

    try {
        return JSON.parse(value);
    } catch {
        return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
};

const parseBlogContent = (content) => {
    if (typeof content !== "string") {
        return content;
    }

    try {
        return JSON.parse(content);
    } catch {
        return {
            type: "doc",
            content: [{
                type: "paragraph",
                content: [{ type: "text", text: content }],
            }],
        };
    }
};

const calculateReadingTime = (content) => {
    const words = extractText(content)
        .trim()
        .split(/\s+/)
        .filter(Boolean).length;

    return Math.max(1, Math.ceil(words / 200));
};

const validateReferences = async(data) => {
    if (data.category) {
        const category = await Category.findById(data.category);
        if (!category || !category.isActive) {
            const error = new Error("Invalid or inactive category");
            error.statusCode = 400;
            throw error;
        }
    }

    if (data.author) {
        const author = await Author.findById(data.author);
        if (!author || !author.isActive) {
            const error = new Error("Invalid or inactive author");
            error.statusCode = 400;
            throw error;
        }
    }

    if (data.tags && Array.isArray(data.tags) && data.tags.length > 0) {
        const validIds = data.tags.filter(t => t && String(t).match(/^[0-9a-fA-F]{24}$/));
        if (validIds.length > 0) {
            const activeTags = await Tag.countDocuments({
                _id: { $in: validIds },
                isActive: true,
            });

            if (activeTags !== new Set(validIds.map(String)).size) {
                const error = new Error("One or more tags are invalid");
                error.statusCode = 400;
                throw error;
            }
        }
    }
};

const getPublishedBlogs = async(query = {}) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {
        status: "published",
        publishedAt: { $lte: new Date() },
    };

    if (query.category) {
        const category = await Category.findOne({
            slug: query.category,
            isActive: true,
        });

        if (!category) {
            return {
                blogs: [],
                pagination: { page, limit, total: 0, totalPages: 0 },
            };
        }

        filter.category = category._id;
    }

    if (query.tag) {
        const tag = await Tag.findOne({
            slug: query.tag,
            isActive: true,
        });

        if (tag) {
            filter.tags = tag._id;
        }
    }

    if (query.featured === "true" || query.featured === true) {
        filter.isFeatured = true;
    }

    if (query.search && query.search.trim()) {
        const search = query.search.trim().slice(0, 100);
        const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        filter.$or = [
            { title: { $regex: escaped, $options: "i" } },
            { excerpt: { $regex: escaped, $options: "i" } },
        ];
    }

    const [blogs, total] = await Promise.all([
        Blog.find(filter)
        .populate("category", "name slug")
        .populate("tags", "name slug")
        .populate("author", "name slug designation profileImage")
        .sort({ isFeatured: -1, publishedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),

        Blog.countDocuments(filter),
    ]);

    return {
        blogs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const getBlogBySlug = async(slug) => {
    const now = new Date();
    const blog = await Blog.findOne({
            slug,
            status: "published",
            publishedAt: { $lte: now },
        })
        .populate("category", "name slug description")
        .populate("tags", "name slug")
        .populate("author", "name slug designation bio profileImage socialLinks");

    if (!blog) {
        const error = new Error("Blog not found");
        error.statusCode = 404;
        throw error;
    }

    Promise.resolve()
        .then(() => Blog.updateOne({ _id: blog._id }, { $inc: { views: 1 } }).exec())
        .catch((error) => {
            console.error("Blog view count update failed:", error.code || error.name || "UNKNOWN_ERROR");
        });
    blog.views += 1;

    const [relatedBlogs, previousBlog, nextBlog] = await Promise.all([
        Blog.find({
            _id: { $ne: blog._id },
            category: blog.category._id,
            status: "published",
            publishedAt: { $lte: now },
        })
        .select("title slug excerpt featuredImage readingTime publishedAt category author")
        .populate("category", "name slug")
        .populate("author", "name slug profileImage")
        .sort({ publishedAt: -1 })
        .limit(3)
        .lean(),

        Blog.findOne({
            status: "published",
            publishedAt: { $lt: blog.publishedAt },
        })
        .select("title slug")
        .sort({ publishedAt: -1 })
        .lean(),

        Blog.findOne({
            status: "published",
            publishedAt: { $gt: blog.publishedAt, $lte: now },
        })
        .select("title slug")
        .sort({ publishedAt: 1 })
        .lean(),
    ]);

    return {
        blog,
        relatedBlogs,
        previousBlog,
        nextBlog,
    };
};

const getBlogById = async(id) => {
    const blog = await Blog.findById(id)
        .populate("category", "name slug")
        .populate("tags", "name slug")
        .populate("author", "name slug designation profileImage");

    if (!blog) {
        const error = new Error("Blog not found");
        error.statusCode = 404;
        throw error;
    }

    return blog;
};

const getAdminBlogs = async(query = {}) => {
    const page = Math.max(1, parseInt(query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(query.limit, 10) || 10));
    const skip = (page - 1) * limit;

    const filter = {};

    if (["draft", "published", "scheduled"].includes(query.status)) {
        filter.status = query.status;
    }

    if (query.category) {
        filter.category = query.category;
    }

    if (query.search && query.search.trim()) {
        const escaped = query.search.trim().slice(0, 100)
            .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

        filter.$or = [
            { title: { $regex: escaped, $options: "i" } },
            { excerpt: { $regex: escaped, $options: "i" } },
        ];
    }

    const [blogs, total] = await Promise.all([
        Blog.find(filter)
        .populate("category", "name slug")
        .populate("tags", "name slug")
        .populate("author", "name slug")
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit),

        Blog.countDocuments(filter),
    ]);

    return {
        blogs,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

const createBlog = async(data, file, adminId) => {
    if (!file) {
        const error = new Error("Featured image is required");
        error.statusCode = 400;
        throw error;
    }

    let uploadedImage;
    try {
        return await createBlogRecord(data, file, adminId, (image) => {
            uploadedImage = image;
        });
    } catch (error) {
        await cleanupImage(uploadedImage?.public_id, "Uncommitted blog");
        throw error;
    }
};

const createBlogRecord = async(data, file, adminId, onUploadedImage) => {
    const tags = parseListValue(data.tags || []);

    await validateReferences({
        category: data.category,
        author: data.author,
        tags,
    });

    const status = data.status || "draft";

    if (!["draft", "published", "scheduled"].includes(status)) {
        const error = new Error("Invalid blog status");
        error.statusCode = 400;
        throw error;
    }

    if (status === "scheduled") {
        const scheduledAt = new Date(data.scheduledAt);

        if (!data.scheduledAt || Number.isNaN(scheduledAt.getTime()) ||
            scheduledAt <= new Date()) {
            const error = new Error("A future scheduled date is required for scheduled blogs");
            error.statusCode = 400;
            throw error;
        }
    }

    const parsedContent = parseBlogContent(data.content);

    let excerpt = (data.excerpt || "").trim();
    if (!excerpt) {
        const text = extractText(parsedContent).trim();
        excerpt = text.slice(0, 180) + (text.length > 180 ? "..." : "") || data.title;
    }

    const keywords = parseListValue(data.keywords || data.seo?.keywords || []);

    const slug = await createUniqueSlug(data.title);
    const uploadedImage = await uploadImage(file.buffer);
    onUploadedImage(uploadedImage);

    const blog = await Blog.create({
        title: data.title.trim(),
        slug,
        excerpt,
        content: parsedContent,
        featuredImage: {
            url: uploadedImage.secure_url || uploadedImage.url,
            publicId: uploadedImage.public_id,
            altText: data.altText || data.title,
        },
        category: data.category,
        tags,
        author: data.author,
        createdBy: adminId,
        status,
        isFeatured: data.isFeatured === true || data.isFeatured === "true" || data.isFeatured === 1 || data.isFeatured === "1",
        publishedAt: status === "published" ? new Date() : null,
        scheduledAt: status === "scheduled" ? new Date(data.scheduledAt) : null,
        readingTime: calculateReadingTime(parsedContent),
        seo: {
            metaTitle: data.metaTitle || data.seo?.metaTitle || data.title,
            metaDescription: data.metaDescription || data.seo?.metaDescription || excerpt,
            keywords,
        },
    });

    return blog;
};

const updateBlog = async(id, data, file) => {
    let uploadedImage;
    try {
        return await updateBlogRecord(id, data, file, (image) => {
            uploadedImage = image;
        });
    } catch (error) {
        await cleanupImage(uploadedImage?.public_id, "Uncommitted blog update");
        throw error;
    }
};

const updateBlogRecord = async(id, data, file, onUploadedImage) => {
    const blog = await Blog.findById(id);

    if (!blog) {
        const error = new Error("Blog not found");
        error.statusCode = 404;
        throw error;
    }

    const tags = parseListValue(
        data.tags !== undefined ? data.tags : blog.tags
    );

    if (data.category || data.author || data.tags !== undefined) {
        await validateReferences({
            category: data.category || blog.category,
            author: data.author || blog.author,
            tags,
        });
    }

    if (data.title && data.title.trim() && data.title.trim() !== blog.title) {
        blog.title = data.title.trim();
        blog.slug = await createUniqueSlug(data.title.trim(), blog._id);
    }

    if (data.excerpt !== undefined) {
        blog.excerpt = data.excerpt;
    }

    if (data.category) {
        blog.category = data.category;
    }

    if (data.author) {
        blog.author = data.author;
    }

    if (data.tags !== undefined) {
        blog.tags = tags;
    }

    if (data.isFeatured !== undefined) {
        blog.isFeatured = data.isFeatured === true || data.isFeatured === "true" || data.isFeatured === 1 || data.isFeatured === "1";
    }

    if (data.content !== undefined) {
        const parsedContent = parseBlogContent(data.content);
        blog.content = parsedContent;
        blog.readingTime = calculateReadingTime(parsedContent);
    }

    if (!blog.seo) {
        blog.seo = { metaTitle: "", metaDescription: "", keywords: [] };
    }

    if (data.metaTitle !== undefined || data.seo?.metaTitle !== undefined) {
        blog.seo.metaTitle = data.metaTitle !== undefined ? data.metaTitle : data.seo.metaTitle;
    }

    if (data.metaDescription !== undefined || data.seo?.metaDescription !== undefined) {
        blog.seo.metaDescription = data.metaDescription !== undefined ? data.metaDescription : data.seo.metaDescription;
    }

    if (data.keywords !== undefined || data.seo?.keywords !== undefined) {
        const keywords = parseListValue(
            data.keywords !== undefined ? data.keywords : data.seo.keywords
        );
        blog.seo.keywords = keywords || [];
    }

    if (data.status !== undefined) {
        if (!["draft", "published", "scheduled"].includes(data.status)) {
            const error = new Error("Invalid blog status");
            error.statusCode = 400;
            throw error;
        }

        if (data.status === "scheduled") {
            const scheduledAt = new Date(data.scheduledAt);

            if (!data.scheduledAt || Number.isNaN(scheduledAt.getTime()) ||
                scheduledAt <= new Date()) {
                const error = new Error("A future scheduled date is required for scheduled blogs");
                error.statusCode = 400;
                throw error;
            }

            blog.scheduledAt = scheduledAt;
            blog.publishedAt = null;
        } else if (data.status === "published") {
            if (blog.status !== "published" || !blog.publishedAt) {
                blog.publishedAt = new Date();
            }
            blog.scheduledAt = null;
        } else {
            blog.publishedAt = null;
            blog.scheduledAt = null;
        }

        blog.status = data.status;
    }

    const previousImagePublicId = file ? blog.featuredImage?.publicId : null;
    if (file) {
        const uploadedImage = await uploadImage(file.buffer);
        onUploadedImage(uploadedImage);
        blog.featuredImage = {
            url: uploadedImage.secure_url || uploadedImage.url,
            publicId: uploadedImage.public_id,
            altText: data.altText || blog.title,
        };
    } else if (data.altText !== undefined) {
        blog.featuredImage.altText = data.altText;
    }

    await blog.save();

    if (previousImagePublicId && previousImagePublicId !== blog.featuredImage.publicId) {
        await cleanupImage(previousImagePublicId, "Replaced blog");
    }

    return blog;
};

const deleteBlog = async(id) => {
    const blog = await Blog.findById(id);

    if (!blog) {
        const error = new Error("Blog not found");
        error.statusCode = 404;
        throw error;
    }

    const featuredImagePublicId = blog.featuredImage?.publicId;
    await blog.deleteOne();
    await cleanupImage(featuredImagePublicId, "Deleted blog");

    return true;
};

const publishBlog = async(id, forceStatus = null) => {
    const blog = await Blog.findById(id);

    if (!blog) {
        const error = new Error("Blog not found");
        error.statusCode = 404;
        throw error;
    }

    if (forceStatus === "draft" || blog.status === "published") {
        blog.status = "draft";
        blog.publishedAt = null;
        blog.scheduledAt = null;
    } else {
        blog.status = "published";
        blog.publishedAt = new Date();
        blog.scheduledAt = null;
    }

    await blog.save();

    return blog;
};

module.exports = {
    getPublishedBlogs,
    getBlogBySlug,
    getBlogById,
    getAdminBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    publishBlog,
};
