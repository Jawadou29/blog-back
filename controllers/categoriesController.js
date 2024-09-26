const asyncHandler = require("express-async-handler");
const { Category, validateCreateCategory } = require("../models/Category");

/**-----------------------------------------
 * @desc create new categoty
 * @route /api/categoty
 * @method POST
 * @access private (only admin) 
  --------------------------------------------*/
const createCategoryCtrl = asyncHandler(async (req, res) => {
  const { error } = validateCreateCategory(req.body);
  if (error) {
    return res.status(400).json({message: error.details[0].message});
  }
  const categoty = await Category.create({
    title: req.body.title,
    user: req.user.id
  });
  res.status(201).json(categoty);
});

/**-----------------------------------------
 * @desc get all categoty
 * @route /api/categoties
 * @method GET
 * @access public
  --------------------------------------------*/
const getAllCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find();
  res.status(200).json(categories);
});

/**-----------------------------------------
 * @desc delete category
 * @route /api/categoties/:id
 * @method DELETE
 * @access private (only admin)
  --------------------------------------------*/
const deleteCategotyCtrl = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    return res.status(404).json({message: "category not found"});
  }
  await Category.findByIdAndDelete(req.params.id);
  return res.status(200).json({message: "category has been deleted", categotyId: category._id});
});

module.exports = {
  createCategoryCtrl,
  getAllCategories,
  deleteCategotyCtrl
}