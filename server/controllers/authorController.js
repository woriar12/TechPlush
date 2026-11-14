const mongoose = require("mongoose");
const Author = require("../models/Author");
const Blog = require("../models/Blog");
const generateSlug = require("../utils/generateSlug");
const { uploadImage, cleanupImage } = require("../services/imageService");

const getAuthors = async(req, res, next) => {
    try {
        const authors = await Author.find({ isActive: true }).sort("name");

        res.status(200).json({
            success: true,
            count: authors.length,
            data: authors,
        });
    } catch (error) {
        next(error);
    }
};

const getAdminAuthors = async(req, res, next) => {
    try {
        const authors = await Author.find().sort("-createdAt");

        res.status(200).json({
            success: true,
            count: authors.length,
            data: authors,
        });
    } catch (error) {
        next(error);
    }
};

const createAuthor = async(req, res, next) => {
    let uploadedImage;
    try {
        const { name, designation, bio, socialLinks } = req.body;

        if (!name || !name.trim()) {
            return res.status(400).json({
                success: false,
                message: "Author name is required",
            });
        }

        let parsedSocial = {};
        if (typeof socialLinks === "string" && socialLinks.trim()) {
            try {
                parsedSocial = JSON.parse(socialLinks);
            } catch (e) {
                parsedSocial = {};
            }
        } else if (typeof socialLinks === "object" && socialLinks !== null) {
            parsedSocial = socialLinks;
        } else if (req.body.linkedin || req.body.twitter || req.body.website) {
            parsedSocial = {
                linkedin: req.body.linkedin || "",
                twitter: req.body.twitter || "",
                website: req.body.website || "",
            };
        }

        if (req.file) {
            uploadedImage = await uploadImage(req.file.buffer);
        }

        const author = await Author.create({
            name: name.trim(),
            slug: generateSlug(name),
            designation: designation || "",
            bio: bio || "",
            socialLinks: parsedSocial,
            profileImage: uploadedImage ? {
                url: uploadedImage.secure_url || uploadedImage.url,
                publicId: uploadedImage.public_id,
            } : undefined,
            createdBy: req.admin._id,
        });

        res.status(201).json({
            success: true,
            message: "Author created successfully",
            data: author,
        });
    } catch (error) {
        await cleanupImage(uploadedImage?.public_id, "Uncommitted author");
        next(error);
    }
};

const updateAuthor = async(req, res, next) => {
    let uploadedImage;
    let previousImagePublicId;
    try {
        const author = await Author.findById(req.params.id);

        if (!author) {
            return res.status(404).json({
                success: false,
                message: "Author not found",
            });
        }

        const { name, designation, bio, socialLinks, isActive } = req.body;

        if (name !== undefined) {
            const trimmedName = name.trim();
            author.name = trimmedName;
            author.slug = generateSlug(trimmedName);
        }

        if (designation !== undefined) author.designation = designation;
        if (bio !== undefined) author.bio = bio;

        if (socialLinks !== undefined) {
            let parsedSocial = {};
            if (typeof socialLinks === "string" && socialLinks.trim()) {
                try {
                    parsedSocial = JSON.parse(socialLinks);
                } catch (e) {
                    parsedSocial = {};
                }
            } else if (typeof socialLinks === "object" && socialLinks !== null) {
                parsedSocial = socialLinks;
            }
            author.socialLinks = parsedSocial;
        } else if (req.body.linkedin !== undefined || req.body.twitter !== undefined || req.body.website !== undefined) {
            author.socialLinks = {
                linkedin: req.body.linkedin !== undefined ? req.body.linkedin : author.socialLinks?.linkedin || "",
                twitter: req.body.twitter !== undefined ? req.body.twitter : author.socialLinks?.twitter || "",
                website: req.body.website !== undefined ? req.body.website : author.socialLinks?.website || "",
            };
        }

        if (isActive !== undefined) {
            author.isActive = isActive === true || isActive === "true";
        }

        if (req.file) {
            previousImagePublicId = author.profileImage?.publicId;
            uploadedImage = await uploadImage(req.file.buffer);
            author.profileImage = {
                url: uploadedImage.secure_url || uploadedImage.url,
                publicId: uploadedImage.public_id,
            };
        }

        await author.save();
        if (previousImagePublicId && previousImagePublicId !== uploadedImage?.public_id) {
            await cleanupImage(previousImagePublicId, "Replaced author");
        }

        res.status(200).json({
            success: true,
            message: "Author updated successfully",
            data: author,
        });
    } catch (error) {
        await cleanupImage(uploadedImage?.public_id, "Uncommitted author update");
        next(error);
    }
};

const deleteAuthor = async(req, res, next) => {
    let session;
    try {
        session = await mongoose.startSession();
        let authorFound = false;
        let deletedBlogCount = 0;
        let imageIds = [];

        await session.withTransaction(async() => {
            const author = await Author.findById(req.params.id).session(session);
            if (!author) return;

            authorFound = true;
            const blogs = await Blog.find({ author: author._id })
                .select("featuredImage.publicId")
                .session(session)
                .lean();

            deletedBlogCount = blogs.length;
            imageIds = blogs
                .map((blog) => blog.featuredImage?.publicId)
                .filter(Boolean);

            if (author.profileImage?.publicId) {
                imageIds.push(author.profileImage.publicId);
            }

            await Blog.deleteMany({ author: author._id }, { session });
            await Author.deleteOne({ _id: author._id }, { session });
        });

        if (!authorFound) {
            return res.status(404).json({
                success: false,
                message: "Author not found",
            });
        }

        await Promise.all(
            [...new Set(imageIds)].map((publicId) =>
                cleanupImage(publicId, "Deleted author")
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
    getAuthors,
    getAdminAuthors,
    createAuthor,
    updateAuthor,
    deleteAuthor,
};
