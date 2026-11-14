const Blog = require("../models/Blog");

const publishScheduledBlogs = async() => {
    try {
        const now = new Date();
        const scheduledBlogs = await Blog.find({
            status: "scheduled",
            scheduledAt: { $lte: now },
        })
            .select("_id")
            .lean();

        for (const blog of scheduledBlogs) {
            try {
                const result = await Blog.updateOne({
                    _id: blog._id,
                    status: "scheduled",
                    scheduledAt: { $lte: now },
                }, {
                    $set: {
                        status: "published",
                        publishedAt: now,
                    },
                    $unset: {
                        scheduledAt: 1,
                    },
                });

                if (result.modifiedCount > 0) {
                    console.info("Scheduled article published:", blog._id);
                }
            } catch (error) {
                console.error(
                    `Scheduled article publishing failed (${blog._id}):`,
                    error.code || error.name || "UNKNOWN_ERROR"
                );
            }
        }
    } catch (error) {
        console.error("Scheduled publishing job failed:", error.code || error.name || "UNKNOWN_ERROR");
    }
};

module.exports = publishScheduledBlogs;
