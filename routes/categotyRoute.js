const { createCategoryCtrl, getAllCategories, deleteCategotyCtrl } = require("../controllers/categoriesController");
const validateObjectId = require("../middlewares/validateObjectId");
const { verifyTokenAndAdmin } = require("../middlewares/verifyToken");
const router = require("express").Router();

// api/categories/
router.post("/", verifyTokenAndAdmin, createCategoryCtrl)
router.get("/", getAllCategories)
// api/categories/:id
router.delete("/:id", validateObjectId, verifyTokenAndAdmin, deleteCategotyCtrl);

module.exports = router;