const asyncHandler = require("express-async-handler");
const { Comment, validateCreateComment, validateUpdateComment } = require("../models/Comment");
const { User } = require("../models/Users");

/**-----------------------------------------
 * @desc create new comment
 * @route /api/comment
 * @method POST
 * @access private (only logged user) 
  --------------------------------------------*/
const createCommentCntr = asyncHandler(async (req, res) => {
  const { error } = validateCreateComment(req.body);
  if (error) {
    res.status(400).json({message: error.details[0].message});
  }
  const profile = await User.findById(req.user.id);
  const comment = await Comment.create({
    postId: req.body.postId,
    text: req.body.text,
    user: req.user.id,
    username: profile.username
  })
  res.status(202).json(comment);
})

/**-----------------------------------------
 * @desc get all comments
 * @route /api/comment
 * @method GET
 * @access private (only admin) 
  --------------------------------------------*/
const getAllComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find().populate("user");
  res.status(200).json(comments);
})

/**-----------------------------------------
 * @desc delete comment
 * @route /api/comment/:id
 * @method DELETE
 * @access private (only admin or owner of comment) 
  --------------------------------------------*/
const deleteCommentCtrl = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({message: "comment not found"});
  }
  if (req.user.isAdmin || req.user.id == comment.user.toString()) {
    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({message: "comment has been deleted"});
  } else {
    res.status(403).json({message: "not allowed to delet this comment"});
  }
})

/**-----------------------------------------
 * @desc update comment
 * @route /api/comment/:id
 * @method PUT
 * @access private (only owner of comment) 
  --------------------------------------------*/
const updateCommentCtrl = asyncHandler(async (req, res) => {
  const { error } = validateUpdateComment(req.body);
  if (error) {
    return res.status(200).json({message: error.details[0].message});
  }
  const comment = await Comment.findById(req.params.id);
  if (!comment) {
    return res.status(404).json({message: "comment not found"});
  }
  if (req.user.id !== comment.user.toString()) {
    return res.status(403).json({message: "not allowed to update this comment"});
  }
  const updatedComment = await Comment.findByIdAndUpdate(req.params.id, {
    $set: {
      text: req.body.text,
    }
  }, {new: true})
  res.status(200).json(updatedComment)
})

module.exports = {
  createCommentCntr,
  getAllComments,
  deleteCommentCtrl,
  updateCommentCtrl
}