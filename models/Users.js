const mongoose = require("mongoose");
const joi = require("joi");
const jwt = require("jsonwebtoken");
const passwordComplexity = require("joi-password-complexity");


// user schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minLength: 2,
    maxLength: 100,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    minLength: 5,
    maxLength: 100,
    uniqe: true,
  },
  password: {
    type: String,
    required: true,
    trim: true,
    minLength: 8,
  },
  profilePhoto: {
    type: Object,
    default: {
      url: "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png",
      publicId: null
    }
  },
  bio: {
    type: String,
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  isAccountVerfied: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: {virtuals: true},
  toObject: { virtuals: true }
});

// populate posts that belongs to this user when he/she get his/her profile
userSchema.virtual("posts", {
  ref: "post",
  foreignField: "user",
  localField: "_id"
})


//genrate token
userSchema.methods.genrateToken = function () {
  return jwt.sign({id: this._id, isAdmin: this.isAdmin}, process.env.SECRET_KEY)
}

// user model
const User = mongoose.model("user", userSchema);

// validate register user
function validateRegisterUser(obj) {
  const schema = joi.object({
    username: joi.string().trim().min(2).max(100).required(),
    email: joi.string().trim().min(5).max(100).required().email(),
    password: passwordComplexity().required(),
  })
  return schema.validate(obj);
}
// validate login user
function validateLoginUser(obj) {
  const schema = joi.object({
    email: joi.string().trim().min(5).max(100).email(),
    password: joi.string().trim().min(8)
  })
  return schema.validate(obj);
}
// validate updated user
function validateUpdateUser(obj) {
  const schema = joi.object({
    username: joi.string().trim().min(2).max(100),
    password: passwordComplexity(),
    bio: joi.string()
  })
  return schema.validate(obj);
}
// validate email
function validateEmail(obj) {
  const schema = joi.object({
    email: joi.string().trim().min(5).max(100).email(),
  })
  return schema.validate(obj);
}

// validate new password
function validateNewPassword(obj) {
  const schema = joi.object({
    password: passwordComplexity().required(),
  })
  return schema.validate(obj);
}
module.exports = {
  User,
  validateRegisterUser,
  validateLoginUser,
  validateUpdateUser,
  validateEmail,
  validateNewPassword
}