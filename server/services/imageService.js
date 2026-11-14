const cloudinary = require("../config/cloudinary");
const Blog = require("../models/Blog");
const Author = require("../models/Author");

const imageUploadOptions = {
    folder: "technology-blogs",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, height: 800, crop: "limit" }],
    resource_type: "image",
};

const uploadImage = async(file) => {
    try {
        return await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                imageUploadOptions,
                (error, result) => {
                    if (error) return reject(error);
                    resolve(result);
                }
            );
            uploadStream.on("error", reject);
            uploadStream.end(file);
        });
    } catch (error) {
        const uploadError = new Error("Image upload failed.");
        uploadError.statusCode = 502;
        uploadError.code = "CLOUDINARY_UPLOAD_FAILED";
        throw uploadError;
    }
};

const deleteImageIfUnreferenced = async(publicId) => {
    if (!publicId) return false;

    const [blogReference, authorReference] = await Promise.all([
        Blog.exists({ "featuredImage.publicId": publicId }),
        Author.exists({ "profileImage.publicId": publicId }),
    ]);

    if (blogReference || authorReference) return false;

    try {
        const result = await cloudinary.uploader.destroy(publicId);
        if (result?.result !== "ok" && result?.result !== "not found") {
            const error = new Error("Cloudinary image deletion failed.");
            error.code = "CLOUDINARY_DELETE_FAILED";
            throw error;
        }
        return true;
    } catch (error) {
        const deletionError = new Error("Cloudinary image deletion failed.");
        deletionError.code = error.code || "CLOUDINARY_DELETE_FAILED";
        throw deletionError;
    }
};

const cleanupImage = async(publicId, context) => {
    if (!publicId) return;
    try {
        await deleteImageIfUnreferenced(publicId);
    } catch (error) {
        console.error(`${context} image cleanup failed:`, error.code || "UNKNOWN_ERROR");
    }
};

module.exports = {
    uploadImage,
    deleteImageIfUnreferenced,
    cleanupImage,
};
