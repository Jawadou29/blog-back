const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const { User, validateRegisterUser, validateLoginUser } = require("../models/Users");
const VerificationToken = require("../models/VerificationToken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

/**-----------------------------------------
 * @desc register new user - sign up
 * @route /api/auth/register
 * @method POST
 * @access public
  --------------------------------------------*/
const registerUserCtrl = asyncHandler(async (req, res) => {
  // validation
  const { error } = validateRegisterUser(req.body);
  if (error) {
    return res.status(400).json({message: error.details[0].message});
  }
  // is user already exists
  let user = await User.findOne({email: req.body.email});
  if (user) {
    return res.status(400).json({message: "user already exist"});
  }
  // hash the password
  const salt = await bcrypt.genSalt(10);
  const hashPassword = await bcrypt.hash(req.body.password, salt)
  // new user and save it to db
  user = new User({
    username: req.body.username,
    email: req.body.email,
    password: hashPassword,
  })
  await user.save()

  // sending email
  // 1. creating new verification and save it to db
  const verificationToken = new VerificationToken({
    userId: user._id,
    token: crypto.randomBytes(32).toString('hex')
  })
  await verificationToken.save();
  // 2. making the link
  const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;
  // 3. putting the link into html template
  const htmlTemplate = `
    <div>
      <p>click on link below to verify your email</p>
      <a href="${link}">verify</a>
    </div>
  `
  // 4. sending email to user
  await sendEmail(user.email, "verify your email", htmlTemplate);

  // send response to client
  res.status(201).json({message: "we sent you an email, please verify your email address"});
})

/**-----------------------------------------
 * @desc login user
 * @route /api/auth/login
 * @method POST
 * @access public
  --------------------------------------------*/
const loginUserCtrl = asyncHandler(async (req, res) => {
  // validate login user
  const { error } = validateLoginUser(req.body);
  if (error) {
    return res.status(400).json({message: error.details[0].message});
  }
  // is user exists
  const user = await User.findOne({email: req.body.email});
  if (!user) {
    return res.status(400).json({message: "invalid email or password"});
  }
  // check the password
  const isPassword = await bcrypt.compare(req.body.password, user.password);
  if (!isPassword) {
    return res.status(400).json({message: "invalid email or password"});
  }

  // sending email
  if (!user.isAccountVerfied) {
    let verificationToken = await VerificationToken.findOne({
      userId: user._id,
    })
    if (!verificationToken) {
      verificationToken = new VerificationToken({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      })
      await verificationToken.save();
      const link = `${process.env.CLIENT_DOMAIN}/users/${user._id}/verify/${verificationToken.token}`;
      const htmlTemplate = `
        <div>
          <p>click on link below to verify your email</p>
          <a href="${link}">verify</a>
        </div>
      `;
      await sendEmail(user.email, "verify your email", htmlTemplate);
    }
    return res.status(400).json({message: "we sent you an email, please verify your email address"})
  }

  // genrate token 
  const token = user.genrateToken();
  // response to client
  res.status(200).json({
    _id: user._id,
    isAdmin: user.isAdmin,
    profilePhoto: user.profilePhoto,
    token,
    username: user.username
  })
})

/**-----------------------------------------
 * @desc login user
 * @route /api/auth/:userId/verify/:token
 * @method GET
 * @access public
  --------------------------------------------*/
const verifyUserAccountCtrl = asyncHandler(async (req, res) => {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(400).json({message: "ivalid link"});
    }
    const verifacationToken = await VerificationToken.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!verifacationToken) {
      return res.status(400).json({message: "ivalid link"});
    }
    user.isAccountVerfied = true;
    await user.save();
    await VerificationToken.deleteOne({_id: verifacationToken._id});
    res.status(200).json({message: "your account verified"});
})


module.exports = {
  registerUserCtrl,
  loginUserCtrl,
  verifyUserAccountCtrl
}