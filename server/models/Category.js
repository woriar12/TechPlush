const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Category name is required"],
        unique: true,
        trim: true,
        maxlength: 100,
    },

    slug: {
        type: String,
        required: [true, "Category slug is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },

    description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: "",
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

categorySchema.index({ isActive: 1, name: 1 });

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;