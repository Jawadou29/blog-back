const mongoose = require("mongoose");
const joi = require("joi");

const categorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
}, {
  timestamps: true
})
// categoty model 
const Category = mongoose.model("categoty", categorySchema);

// validate create category
function validateCreateCategory(obj) {
  const schema = joi.object({
    title: joi.string().trim().required().label("title"),
  });
  return schema.validate(obj);
}


module.exports = {
  Category,
  validateCreateCategory
}