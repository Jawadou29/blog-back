const mongoose = require("mongoose");
const joi = require("joi");

// post schema
const postSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minLength: 2,
    maxLength: 200,
  },
  description: {
    type: String,
    required: true,
    trim: true,
    minLength: 10,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "user",
  },
  category: {
    type: String,
    required: true
  },
  image: {
    type: Object,
    default: {
      url: "",
      publicId: null
    }
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ]
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: {virtuals: true}
});

// populate comments for this post
postSchema.virtual("comments", {
  ref: "comment",
  foreignField: "postId",
  localField: "_id"
})


// post model
const Post = mongoose.model("post", postSchema);

// validate create Post
function validateCreatePost(obj) {
  const schema = joi.object({
    title: joi.string().trim().min(2).max(200).required(),
    description: joi.string().trim().min(10).required(),
    category: joi.string().trim().required(),
  })
  return schema.validate(obj);
}

// validate update Post
function validateUpdatePost(obj) {
  const schema = joi.object({
    title: joi.string().trim().min(2).max(200),
    description: joi.string().trim().min(10),
    category: joi.string().trim(),
  })
  return schema.validate(obj);
}

module.exports = {
  Post,
  validateCreatePost,
  validateUpdatePost
}