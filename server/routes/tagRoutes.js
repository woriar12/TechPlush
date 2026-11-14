const express = require("express");
const router = express.Router();

const {
    getTags,
    getAdminTags,
    createTag,
    updateTag,
    deleteTag,
} = require("../controllers/tagController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
    tagValidator,
    updateTagValidator,
} = require("../validators/tagValidator");

router.get("/", getTags);

router.get("/admin/all", protect, adminOnly, getAdminTags);

router.post(
    "/",
    protect,
    adminOnly,
    validate(tagValidator),
    createTag
);

router.put(
    "/:id",
    protect,
    adminOnly,
    validate(updateTagValidator),
    updateTag
);

router.delete("/:id", protect, adminOnly, deleteTag);

module.exports = router;