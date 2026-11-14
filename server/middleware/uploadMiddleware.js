const multer = require("multer");
const path = require("path");
const CloudinaryStorage = require("multer-storage-cloudinary");
const cloudinary = require("../config/cloudinary");

if (!cloudinary.v2) {
    cloudinary.v2 = cloudinary;
}

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: "technology-blogs",
        allowed_formats: ["jpg", "jpeg", "png", "webp"],
        transformation: [
            { width: 1200, height: 800, crop: "limit" },
        ],
    },
});

const allowedImageTypes = new Map([
    [".jpg", "image/jpeg"],
    [".jpeg", "image/jpeg"],
    [".png", "image/png"],
    [".webp", "image/webp"],
]);

const uploadOptions = {
    limits: {
        fileSize: 5 * 1024 * 1024,
    },
    fileFilter: (req, file, callback) => {
        const extension = path.extname(file.originalname).toLowerCase();
        if (allowedImageTypes.get(extension) !== file.mimetype) {
            const error = new Error("Only JPG, PNG, and WebP images are allowed.");
            error.statusCode = 400;
            error.code = "INVALID_IMAGE_TYPE";
            return callback(error);
        }
        callback(null, true);
    },
};

const upload = multer({ ...uploadOptions, storage });
const memoryUpload = multer({
    ...uploadOptions,
    storage: multer.memoryStorage(),
});

upload.featuredImage = memoryUpload.single("featuredImage");
upload.profileImage = memoryUpload.single("profileImage");
upload.inlineImage = (req, res, next) => {
    upload.single("image")(req, res, (error) => {
        if (!error) return next();
        if (error.code === "INVALID_IMAGE_TYPE" || error.name === "MulterError") {
            return next(error);
        }

        const uploadError = new Error("Image upload failed.");
        uploadError.statusCode = 502;
        uploadError.code = "CLOUDINARY_UPLOAD_FAILED";
        next(uploadError);
    });
};

module.exports = upload;