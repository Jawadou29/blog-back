const mongoose = require("mongoose");
const joi = require("joi");

const commentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "post",
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true
  },
  text: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true
  }
}, {
  timestamps: true
})
// comment model 
const Comment = mongoose.model("comment", commentSchema);

// validate create commnent
function validateCreateComment(obj) {
  const schema = joi.object({
    postId: joi.string().required().label("post id"),
    text: joi.string().required(),
  });
  return schema.validate(obj);
}

// validate update comment
function validateUpdateComment(obj) {
  const schema = joi.object({
    text: joi.string().required(),
  });
  return schema.validate(obj);
}


module.exports = {
  Comment,
  validateCreateComment,
  validateUpdateComment
}