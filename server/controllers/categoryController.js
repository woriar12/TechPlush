const mongoose = require("mongoose");
const Category = require("../models/Category");
const Blog = require("../models/Blog");
const { cleanupImage } = require("../services/imageService");
const generateSlug = require("../utils/generateSlug");

const getCategories = async(req, res, next) => {
    try {
        const categories = await Category.find({ isActive: true }).sort("name");

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

const getAdminCategories = async(req, res, next) => {
    try {
        const categories = await Category.find().sort("-createdAt");

        res.status(200).json({
            success: true,
            count: categories.length,
            data: categories,
        });
    } catch (error) {
        next(error);
    }
};

const createCategory = async(req, res, next) => {
    try {
        const { name, description } = req.body;
        const trimmedName = name?.trim();

        if (!trimmedName) {
            return res.status(400).json({
                success: false,
                message: "Category name is required",
            });
        }

        const category = await Category.create({
            name: trimmedName,
            slug: generateSlug(trimmedName),
            description,
            createdBy: req.admin._id,
        });

        res.status(201).json({
            success: true,
            message: "Category created successfully",
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

const updateCategory = async(req, res, next) => {
    try {
        const { name, description, isActive } = req.body;

        const category = await Category.findById(req.params.id);

        if (!category) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        if (name !== undefined) {
            const trimmedName = name.trim();
            category.name = trimmedName;
            category.slug = generateSlug(trimmedName);
        }

        if (description !== undefined) category.description = description;
        if (isActive !== undefined) category.isActive = isActive;

        await category.save();

        res.status(200).json({
            success: true,
            message: "Category updated successfully",
            data: category,
        });
    } catch (error) {
        next(error);
    }
};

const deleteCategory = async(req, res, next) => {
    let session;
    try {
        session = await mongoose.startSession();
        let categoryFound = false;
        let deletedBlogCount = 0;
        let featuredImageIds = [];

        await session.withTransaction(async() => {
            const category = await Category.findById(req.params.id).session(session);
            if (!category) return;

            categoryFound = true;
            const blogs = await Blog.find({ category: category._id })
                .select("featuredImage.publicId")
                .session(session)
                .lean();

            deletedBlogCount = blogs.length;
            featuredImageIds = blogs
                .map((blog) => blog.featuredImage?.publicId)
                .filter(Boolean);

            await Blog.deleteMany({ category: category._id }, { session });
            await Category.deleteOne({ _id: category._id }, { session });
        });

        if (!categoryFound) {
            return res.status(404).json({
                success: false,
                message: "Category not found",
            });
        }

        await Promise.all(
            [...new Set(featuredImageIds)].map((publicId) =>
                cleanupImage(publicId, "Deleted category")
            )
        );

        res.status(200).json({
            success: true,
            message: "Deleted successfully",
            data: { deletedBlogs: deletedBlogCount },
        });
    } catch (error) {
        next(error);
    } finally {
        if (session) await session.endSession();
    }
};

module.exports = {
    getCategories,
    getAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory,
};