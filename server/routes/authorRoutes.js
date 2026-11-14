const express = require("express");
const router = express.Router();

const {
    getAuthors,
    getAdminAuthors,
    createAuthor,
    updateAuthor,
    deleteAuthor,
} = require("../controllers/authorController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const upload = require("../middleware/uploadMiddleware");
const validate = require("../middleware/validateMiddleware");
const {
    authorValidator,
    updateAuthorValidator,
} = require("../validators/authorValidator");

router.get("/", getAuthors);

router.get("/admin/all", protect, adminOnly, getAdminAuthors);

router.post(
    "/",
    protect,
    adminOnly,
    upload.profileImage,
    validate(authorValidator),
    createAuthor
);

router.put(
    "/:id",
    protect,
    adminOnly,
    upload.profileImage,
    validate(updateAuthorValidator),
    updateAuthor
);

router.delete("/:id", protect, adminOnly, deleteAuthor);

module.exports = router;
