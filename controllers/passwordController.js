const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { User, validateEmail, validateNewPassword } = require("../models/Users");
const VerificationToken = require("../models/VerificationToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");


/**-----------------------------------
 * @desc send reset password link
 * @route /api/password/reset-password-link
 * @method POST
 * @access public
-------------------------------------*/
const sendResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
  // 1. validation
  const { error } = validateEmail(req.body);
  if (error) {
    return res.status(400).json({message: error.details[0].message});
  }
  // 2. get the user from DB by email
  const user = await User.findOne({email: req.body.email});
  if (!user) {
    return res.status(404).json({message: "email not found"});
  }
  // 3. creating verification token
  let verificationToken = await VerificationToken.findOne({userId: user._id});
  if (!verificationToken) {
    verificationToken = new VerificationToken ({
      userId: user._id,
      token: crypto.randomBytes(32).toString("hex")
    });
  }
  await verificationToken.save();
  // 4. creating link
  const link = `${process.env.CLIENT_DOMAIN}/reset-password/${user._id}/${verificationToken.token}`;
  // 5. creating html template
  const htmlTemplate = `<a href="${link}">click here to reset your password</a>`
  // 6. seding email
  await sendEmail(user.email, "reset your password", htmlTemplate)
  // 7. response to client
  res.status(200).json({message: "password reset link sent to your email, please check your inbox"});
})



/**-----------------------------------
 * @desc get reset password link
 * @route /api/password/reset-password/:userId/:token
 * @method GET
 * @access public
-------------------------------------*/
const getResetPasswordLinkCtrl = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({message: "invalid link"});
  }
  const verificationToken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token
  })
  if (!verificationToken) {
    return res.status(400).json({message: "invalid link"});
  }
  res.status(200).json({message: "valid url"});
})

/**-----------------------------------
 * @desc reset password
 * @route /api/password/reset-password/:userId/:token
 * @method POST
 * @access public
-------------------------------------*/
const resetPasswordCtrl = asyncHandler(async (req, res) => {
  const { error } = validateNewPassword(req.body);
  if (error) {
    return res.status(400).json({message: error.details[0].message});
  }
  const user = await User.findById(req.params.userId);
  if (!user) {
    return res.status(400).json({message: "invalid link"});
  }
  const verificationToken = await VerificationToken.findOne({
    userId: user._id,
    token: req.params.token
  });
  if (!verificationToken) {
    return res.status(400).json({message: "ivalid link"})
  }
  if (!user.isAccountVerfied) {
    user.isAccountVerfied = true;
  }
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt);
  user.password = hashPassword;
  await user.save();
  await VerificationToken.deleteOne({_id: verificationToken._id});
  res.status(200).json({message: "password reset successfuly, pleas login"})
})

module.exports = {
  sendResetPasswordLinkCtrl,
  getResetPasswordLinkCtrl,
  resetPasswordCtrl
}