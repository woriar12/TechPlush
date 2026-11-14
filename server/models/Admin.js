const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const adminSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Admin name is required"],
        trim: true,
        maxlength: 100,
    },

    email: {
        type: String,
        required: [true, "Admin email is required"],
        unique: true,
        lowercase: true,
        trim: true,
        maxlength: 255,
    },

    password: {
        type: String,
        required: [true, "Admin password is required"],
        minlength: 8,
        select: false,
    },

    role: {
        type: String,
        enum: ["admin"],
        default: "admin",
    },

    isActive: {
        type: Boolean,
        default: true,
    },

    lastLogin: {
        type: Date,
        default: null,
    },
}, {
    timestamps: true,
});

adminSchema.pre("save", async function() {
    if (!this.isModified("password")) {
        return;
    }

    this.password = await bcrypt.hash(this.password, 12);
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;