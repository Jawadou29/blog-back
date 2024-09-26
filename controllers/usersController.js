const asyncHandler = require("express-async-handler");
const { User, validateUpdateUser } = require("../models/Users");
const bcrypt = require("bcryptjs");
const path = require("path");
const { cloudinaryUploadImage, cloudinaryRemoveImage, cloudinaryRemoveMultipleImage } = require("../utils/cloudinary");
const fs = require("fs");
const { Comment } = require("../models/Comment");
const { Post } = require("../models/Post");


/**-----------------------------------------
 * @desc get all users
 * @route /api/users/profile
 * @method GET
 * @access private (only admin)
  --------------------------------------------*/
const getAllUsersCtrl = asyncHandler(async (req, res) => {
  const users = await User.find().select("-password").populate("posts");
  res.status(200).json(users);
})

/**-----------------------------------------
 * @desc get user profile by id
 * @route /api/users/profile/:id
 * @method GET
 * @access public
  --------------------------------------------*/
  const getUserProfileCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.id).select("-password").populate("posts");
    if (!user) {
      return res.status(404).json({message: "user not found"});
    }
    res.status(200).json(user)
  })
/**-----------------------------------------
 * @desc update user
 * @route /api/users/profile/:id
 * @method PUT
 * @access private (only user himself)
  --------------------------------------------*/
const updateUserProfileCtrl = asyncHandler(async (req, res) => {
  // validate updated data
  const { error } = validateUpdateUser(req.body);
  if (error) {
    return res.status(400).json({message: error.details[0].message});
  }
  // if password updated
  if (req.body.password) {
    const salt = await bcrypt.genSalt(10);
    req.body.password = await bcrypt.hash(req.body.password, salt);
  }
  const updatedUser = await User.findByIdAndUpdate(req.params.id, {
    $set: {
      username: req.body.username,
      password: req.body.password,
      bio: req.body.bio
    }
  }, {new: true}).select("-password").populate("posts");
  res.status(201).json(updatedUser);
})

/**-----------------------------------------
 * @desc get users count
 * @route /api/users/count
 * @method GET
 * @access private (only admin)
  --------------------------------------------*/
const getUsersCount = asyncHandler(async (req, res) => {
  const count = await User.countDocuments();
  res.status(200).json(count);
})

/**-----------------------------------------
 * @desc profile photo 
 * @route /api/users/profile/profile-photo-upload
 * @method POST
 * @access private (only logger user)
--------------------------------------------*/
const profilePhotoUploadCtrl = asyncHandler(async (req, res) => {
  // validition
  if (!req.file) {
    return res.status(400).json({message: "no file provided"});
  }
  // get the path to the image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`)
  // upload to cloudinary
  const result = await cloudinaryUploadImage(imagePath)
  
  // get the user from DB
  const user = await User.findById(req.user.id)

  // delete the old profile photo if exists
  if (user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId)
  }
  // change the profile field in the db
  user.profilePhoto = {
    url: result.secure_url,
    publicId: result.public_id
  }
  await user.save();
  // send response to client
  res.status(200).json({
    message: "your profile photo uploaded successefly",
    profilePhoto: {url: result.secure_url, publicId: result.publicId}
  });
  // remove image from server
  fs.unlinkSync(imagePath);

})

/**-----------------------------------------
 * @desc delete user profile (account)
 * @route /api/users/profile/:id
 * @method DELETE
 * @access private (only admin or user himself)
--------------------------------------------*/
const deleteUserProfileCtrl = asyncHandler(async (req, res) => {
  // 1. get the user form DB
  const user = await User.findById(req.params.id);
  if (!user) {
    return res.status(404).json({message: "user not found"});
  }
  // 2. get all posts from DB
  const posts = await Post.find({user: user._id});
  // 3. get all public ids from the posts
  const publicIds = posts?.map((post) => post.image.publicId);
  // 4. delete all posts images from cloundinary that belong to that user
  if (publicIds?.length > 0) {
    await cloudinaryRemoveMultipleImage(publicIds);
  }
  // 5. delete the profile picture from cloudinary
  if (user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }
  // 6. delete user posts and comments
  await Post.deleteMany({user: user._id});
  await Comment.deleteMany({user: user._id});
  // 7. delete the user him self
  await User.findByIdAndDelete(req.params.id);
  // 8. send a response to the client
  res.status(200).json({message: "your profile has been deleted"})
})


module.exports = {
  getAllUsersCtrl,
  getUserProfileCtrl,
  updateUserProfileCtrl,
  getUsersCount,
  profilePhotoUploadCtrl,
  deleteUserProfileCtrl
}