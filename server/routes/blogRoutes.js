const express = require("express");
const router = express.Router();

const {
    getPublishedBlogs,
    getBlogBySlug,
    getBlogById,
    getAdminBlogs,
    createBlog,
    updateBlog,
    deleteBlog,
    publishBlog,
    uploadBlogImage,
} = require("../controllers/blogController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validateMiddleware");
const normalizeBlogData = require("../middleware/normalizeBlogMiddleware");
const {
    blogValidator,
    updateBlogValidator,
} = require("../validators/blogValidator");

router.get("/", getPublishedBlogs);

router.get("/admin/all", protect, adminOnly, getAdminBlogs);
router.get("/admin/:id", protect, adminOnly, getBlogById);

router.post(
    "/upload-image",
    protect,
    adminOnly,
    upload.inlineImage,
    uploadBlogImage
);

router.post(
    "/",
    protect,
    adminOnly,
    upload.featuredImage,
    normalizeBlogData,
    validate(blogValidator),
    createBlog
);

router.put(
    "/:id",
    protect,
    adminOnly,
    upload.featuredImage,
    normalizeBlogData,
    validate(updateBlogValidator),
    updateBlog
);

router.delete("/:id", protect, adminOnly, deleteBlog);
router.patch("/:id/publish", protect, adminOnly, publishBlog);

router.get("/:slug", getBlogBySlug);

module.exports = router;
