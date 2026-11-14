const blogService = require("../services/blogService");

const getPublishedBlogs = async(req, res, next) => {
    try {
        const result = await blogService.getPublishedBlogs(req.query);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getBlogBySlug = async(req, res, next) => {
    try {
        const result = await blogService.getBlogBySlug(req.params.slug);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const getBlogById = async(req, res, next) => {
    try {
        const blog = await blogService.getBlogById(req.params.id);

        res.status(200).json({
            success: true,
            data: blog,
        });
    } catch (error) {
        next(error);
    }
};

const getAdminBlogs = async(req, res, next) => {
    try {
        const result = await blogService.getAdminBlogs(req.query);

        res.status(200).json({
            success: true,
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

const createBlog = async(req, res, next) => {
    try {
        const blog = await blogService.createBlog(
            req.body,
            req.file,
            req.admin._id
        );

        res.status(201).json({
            success: true,
            message: "Blog created successfully",
            data: blog,
        });
    } catch (error) {
        next(error);
    }
};

const updateBlog = async(req, res, next) => {
    try {
        const blog = await blogService.updateBlog(
            req.params.id,
            req.body,
            req.file
        );

        res.status(200).json({
            success: true,
            message: "Blog updated successfully",
            data: blog,
        });
    } catch (error) {
        next(error);
    }
};

const deleteBlog = async(req, res, next) => {
    try {
        await blogService.deleteBlog(req.params.id);

        res.status(200).json({
            success: true,
            message: "Blog deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

const publishBlog = async(req, res, next) => {
    try {
        const blog = await blogService.publishBlog(req.params.id, req.body?.status);

        res.status(200).json({
            success: true,
            message: `Blog ${blog.status === "published" ? "published" : "unpublished"} successfully`,
            data: blog,
        });
    } catch (error) {
        next(error);
    }
};

const uploadBlogImage = async(req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "No image file provided",
            });
        }

        res.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            data: {
                url: req.file.secure_url || req.file.url || req.file.path,
                publicId: req.file.public_id || req.file.filename,
            },
        });
    } catch (error) {
        next(error);
    }
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
    uploadBlogImage,
};
