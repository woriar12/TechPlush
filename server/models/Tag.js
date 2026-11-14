const mongoose = require("mongoose");

const tagSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Tag name is required"],
        unique: true,
        trim: true,
        maxlength: 50,
    },

    slug: {
        type: String,
        required: [true, "Tag slug is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },

    description: {
        type: String,
        trim: true,
        maxlength: 250,
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

tagSchema.index({ isActive: 1, name: 1 });

const Tag = mongoose.model("Tag", tagSchema);

module.exports = Tag;