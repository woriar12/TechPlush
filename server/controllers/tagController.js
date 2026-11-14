const Tag = require("../models/Tag");
const Blog = require("../models/Blog");
const generateSlug = require("../utils/generateSlug");

const getTags = async(req, res, next) => {
    try {
        const tags = await Tag.find({ isActive: true }).sort("name");

        res.status(200).json({
            success: true,
            count: tags.length,
            data: tags,
        });
    } catch (error) {
        next(error);
    }
};

const getAdminTags = async(req, res, next) => {
    try {
        const tags = await Tag.find().sort("-createdAt");

        res.status(200).json({
            success: true,
            count: tags.length,
            data: tags,
        });
    } catch (error) {
        next(error);
    }
};

const createTag = async(req, res, next) => {
    try {
        const { name, description } = req.body;
        const trimmedName = name?.trim();

        if (!trimmedName) {
            return res.status(400).json({
                success: false,
                message: "Tag name is required",
            });
        }

        const tag = await Tag.create({
            name: trimmedName,
            slug: generateSlug(trimmedName),
            description,
            createdBy: req.admin._id,
        });

        res.status(201).json({
            success: true,
            message: "Tag created successfully",
            data: tag,
        });
    } catch (error) {
        next(error);
    }
};

const updateTag = async(req, res, next) => {
    try {
        const { name, description, isActive } = req.body;
        const tag = await Tag.findById(req.params.id);

        if (!tag) {
            return res.status(404).json({
                success: false,
                message: "Tag not found",
            });
        }

        if (name !== undefined) {
            const trimmedName = name.trim();
            tag.name = trimmedName;
            tag.slug = generateSlug(trimmedName);
        }

        if (description !== undefined) tag.description = description;
        if (isActive !== undefined) tag.isActive = isActive;

        await tag.save();

        res.status(200).json({
            success: true,
            message: "Tag updated successfully",
            data: tag,
        });
    } catch (error) {
        next(error);
    }
};

const deleteTag = async(req, res, next) => {
    try {
        const tag = await Tag.findById(req.params.id);

        if (!tag) {
            return res.status(404).json({
                success: false,
                message: "Tag not found",
            });
        }

        await Blog.updateMany({ tags: tag._id }, { $pull: { tags: tag._id } });

        await tag.deleteOne();

        res.status(200).json({
            success: true,
            message: "Tag deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTags,
    getAdminTags,
    createTag,
    updateTag,
    deleteTag,
};