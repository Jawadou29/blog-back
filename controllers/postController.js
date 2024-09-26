const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const { Post, validateCreatePost, validateUpdatePost } = require("../models/Post");
const { cloudinaryUploadImage, cloudinaryRemoveImage } = require("../utils/cloudinary");
const { Comment } = require("../models/Comment");

/**-----------------------------------------
 * @desc create new post
 * @route /api/posts/
 * @method POST
 * @access private (only loged in user)
  --------------------------------------------*/
const createPostCtrl = asyncHandler(async (req, res) => {
  // validation for image
  if (!req.file) {
    return res.status(400).json({message: "no image provided"});
  }
  // validation for data
  const { error } = validateCreatePost(req.body);
  if (error) {
    return res.status(400).json({message: error.details[0].message});
  }
  // uplaod photo
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);
  // create new post and save it to db
  const post = await Post.create({
    title: req.body.title,
    description: req.body.description,
    category: req.body.category,
    user: req.user.id,
    image: {
      url: result.secure_url,
      publicId: result.public_id
    }
  })
  // send res to the client
  res.status(201).json(post);
  // remove image from the server
  fs.unlinkSync(imagePath);
})
/**-----------------------------------------
 * @desc get all posts
 * @route /api/posts/
 * @method GET
 * @access public 
  --------------------------------------------*/
const getAllPostsCtrl = asyncHandler(async (req, res) => {
  const POST_PER_PAGE = 3;
  const {pageNumber, category} = req.query;
  let posts;
  if (pageNumber) {
    posts = await Post.find()
                      .skip((pageNumber - 1) * POST_PER_PAGE)
                      .limit(POST_PER_PAGE).sort({createdAt: -1})
                      .populate("user", ["-password"]);
  }
  else if (category) {
    posts = await Post.find({ category })
                      .sort({createdAt: -1})
                      .populate("user", ["-password"]);
  }
  else {
    posts = await Post.find()
                      .sort({createdAt: -1})
                      .populate("user", ["-password"]);
  }
  res.status(200).json(posts)
})
/**-----------------------------------------
 * @desc get single post
 * @route /api/posts/:id
 * @method GET
 * @access public
  --------------------------------------------*/
const getSinglePostCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id).populate("user", ["-password"]).populate("comments");
  if (post) {
    res.status(200).json(post);
  }
  else{
    res.status(404).json({message: "post not found"});
  }
})

/**-----------------------------------------
 * @desc get post count
 * @route /api/posts/count
 * @method GET
 * @access public 
  --------------------------------------------*/
const getPostsCountCtrl = asyncHandler(async (req, res) => {
  const count = await Post.countDocuments();
  res.status(200).json(count);
})
/**-----------------------------------------
 * @desc delete post
 * @route /api/posts/:id
 * @method DELETE
 * @access private (only user or admin) 
  --------------------------------------------*/

const deletePostCtrl = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(404).json({message: "post not found"});
  }
  if (req.user.isAdmin || req.user.id === post.user.toString()) {
    await Post.findByIdAndDelete(req.params.id);
    await cloudinaryRemoveImage(post.image.publicId);
    // delete all comments that belong to this post
    await Comment.deleteMany({postId: post._id});

    res.status(200).json({message: "post has been deleted", postId: post._id});
  }
  else{
    res.status(203).json({message: "access denied, forbidden"});
  }
});

/**-----------------------------------------
 * @desc update post
 * @route /api/posts/:id
 * @method PUT
 * @access private (only user) 
  --------------------------------------------*/
const updatePostCtrl = asyncHandler(async (req, res) => {
  // validation
  const { error } = validateUpdatePost(req.body);
  if (error) {
    return res.status(400).json({message: error.details[0].message});
  }
  // get the post from db and check if post exists
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(400).json({message: "post not found"});
  }
  // check if the post belong to logged user
  if (req.user.id !== post.user.toString()) {
    return res.status(403).json({message: "not allowed"});
  }
  // update post
  const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
    $set: {
      title: req.body.title,
      description: req.body.description,
      category: req.body.category
    }
  }, {new: true}).populate("user", ["-password"]);
  // send response to client
  res.status(200).json(updatedPost);
})

/**-----------------------------------------
 * @desc update post image
 * @route /api/posts/update-image/:id
 * @method PUT
 * @access private (only user) 
  --------------------------------------------*/
const updatePostImgCtrl = asyncHandler(async (req, res) => {
  // validation
  if (!req.file) {
    return res.status(400).json({message: "no image provided"});
  }
  // get the post from db and check if post exists
  const post = await Post.findById(req.params.id);
  if (!post) {
    return res.status(400).json({message: "post not found"});
  }
  // check if the post belong to logged user
  if (req.user.id !== post.user.toString()) {
    return res.status(403).json({message: "not allowed"});
  }
  // delete the old image
  await cloudinaryRemoveImage(post.image.publicId);
  // upload new image
  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);
  const result = await cloudinaryUploadImage(imagePath);
  // update post
  const updatedPost = await Post.findByIdAndUpdate(req.params.id, {
    $set: {
      image: {
        url: result.secure_url,
        publicId: result.public_id
      }
    }
  }, {new: true});
  // send response to client
  res.status(200).json(updatedPost);
  // remove image from server
  fs.unlinkSync(imagePath);
})
/**-----------------------------------------
 * @desc toggle post likes
 * @route /api/posts/like/:id
 * @method PUT
 * @access private (only logged user) 
  --------------------------------------------*/
const toggleLikeCtrl = asyncHandler(async (req, res) => {
  const loggedInUser = req.user.id;
  const {id: postId} = req.params;
  let post = await Post.findById(postId);
  if (!post) {
    return res.status(404).json({message: "post not found"});
  }
  const isPostAlreadyLiked = post.likes.find((user) => user.toString() === loggedInUser )
  if (isPostAlreadyLiked) {
    post = await Post.findByIdAndUpdate(postId, {
      $pull: {likes: loggedInUser}
    }, {new: true});
  } else {
    post = await Post.findByIdAndUpdate(postId, {
      $push: {likes: loggedInUser}
    }, {new: true});
  }
  res.status(200).json(post);
})

module.exports = {
  createPostCtrl,
  getAllPostsCtrl,
  getSinglePostCtrl,
  getPostsCountCtrl,
  deletePostCtrl,
  updatePostCtrl,
  updatePostImgCtrl,
  toggleLikeCtrl
}