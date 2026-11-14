const mongoose = require("mongoose");

const authorSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Author name is required"],
        trim: true,
        maxlength: 100,
    },

    slug: {
        type: String,
        required: [true, "Author slug is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },

    designation: {
        type: String,
        trim: true,
        maxlength: 100,
        default: "",
    },

    bio: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: "",
    },

    profileImage: {
        url: {
            type: String,
            default: "",
        },
        publicId: {
            type: String,
            default: "",
        },
    },

    socialLinks: {
        linkedin: {
            type: String,
            default: "",
        },
        twitter: {
            type: String,
            default: "",
        },
        website: {
            type: String,
            default: "",
        },
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Admin",
    },
}, {
    timestamps: true,
});

authorSchema.index({ isActive: 1, name: 1 });

const Author = mongoose.model("Author", authorSchema);

module.exports = Author;