const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, "Blog title is required"],
        trim: true,
        maxlength: 200,
    },

    slug: {
        type: String,
        required: [true, "Blog slug is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },

    excerpt: {
        type: String,
        required: [true, "Blog excerpt is required"],
        maxlength: 500,
    },

    content: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, "Blog content is required"],
    },

    featuredImage: {
        url: {
            type: String,
            required: [true, "Featured image is required"],
        },
        publicId: {
            type: String,
            default: "",
        },
        altText: {
            type: String,
            default: "",
        },
    },

    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
    },

    tags: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tag",
    }, ],

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Author",
        required: true,
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
        required: true,
    },

    status: {
        type: String,
        enum: ["draft", "published", "scheduled"],
        default: "draft",
    },

    isFeatured: {
        type: Boolean,
        default: false,
    },

    publishedAt: {
        type: Date,
        default: null,
    },

    scheduledAt: {
        type: Date,
        default: null,
    },

    readingTime: {
        type: Number,
        default: 0,
        min: 0,
    },

    seo: {
        metaTitle: {
            type: String,
            maxlength: 70,
            default: "",
        },
        metaDescription: {
            type: String,
            maxlength: 160,
            default: "",
        },
        keywords: {
            type: [String],
            default: [],
        },
    },

    views: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    timestamps: true,
});

blogSchema.index({ status: 1, publishedAt: -1 });
blogSchema.index({ category: 1, status: 1 });
blogSchema.index({ isFeatured: 1, status: 1 });
blogSchema.index({ title: "text", excerpt: "text" });

const Blog = mongoose.model("Blog", blogSchema);

module.exports = Blog;