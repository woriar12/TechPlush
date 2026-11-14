const Blog = require("../models/Blog");
const Category = require("../models/Category");
const Tag = require("../models/Tag");
const Author = require("../models/Author");

const getDashboardStats = async(req, res, next) => {
    try {
        const now = new Date();

        const [
            totalBlogs,
            publishedBlogs,
            draftBlogs,
            scheduledBlogs,
            totalCategories,
            totalTags,
            totalAuthors,
            viewsResult,
            recentBlogs,
        ] = await Promise.all([
            Blog.countDocuments(),
            Blog.countDocuments({
                status: "published",
                publishedAt: { $lte: now },
            }),
            Blog.countDocuments({ status: "draft" }),
            Blog.countDocuments({ status: "scheduled" }),
            Category.countDocuments(),
            Tag.countDocuments(),
            Author.countDocuments(),
            Blog.aggregate([
                { $group: { _id: null, total: { $sum: "$views" } } },
            ]),
            Blog.find()
            .sort("-createdAt")
            .limit(5)
            .populate("category", "name")
            .populate("author", "name"),
        ]);

        res.status(200).json({
            success: true,
            data: {
                totalBlogs,
                publishedBlogs,
                draftBlogs,
                scheduledBlogs,
                totalCategories,
                totalTags,
                totalAuthors,
                totalViews: viewsResult[0]?.total || 0,
                recentBlogs,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getDashboardStats };