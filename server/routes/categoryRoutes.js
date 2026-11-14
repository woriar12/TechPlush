const express = require("express");
const router = express.Router();

const {
    getCategories,
    getAdminCategories,
    createCategory,
    updateCategory,
    deleteCategory,
} = require("../controllers/categoryController");

const { protect } = require("../middleware/authMiddleware");
const { adminOnly } = require("../middleware/adminMiddleware");
const validate = require("../middleware/validateMiddleware");

const {
    categoryValidator,
    updateCategoryValidator,
} = require("../validators/categoryValidator");

router.get("/", getCategories);

router.get("/admin/all", protect, adminOnly, getAdminCategories);

router.post(
    "/",
    protect,
    adminOnly,
    validate(categoryValidator),
    createCategory
);

router.put(
    "/:id",
    protect,
    adminOnly,
    validate(updateCategoryValidator),
    updateCategory
);

router.delete("/:id", protect, adminOnly, deleteCategory);

module.exports = router;