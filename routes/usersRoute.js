const router = require("express").Router();
const { getAllUsersCtrl, getUserProfileCtrl, updateUserProfileCtrl, getUsersCount, profilePhotoUploadCtrl, deleteUserProfileCtrl } = require("../controllers/usersController");
const {verifyTokenAndAdmin, verifyTokenAndUser, verifyToken, verifyTokenAndUserOrAdmin } = require("../middlewares/verifyToken");
const validateObjectId = require("../middlewares/validateObjectId");
const photoUpload = require("../middlewares/photoUpload");


// /api/users/profile
router.get("/profile", verifyTokenAndAdmin, getAllUsersCtrl);
// /api/users/profile/:id
router.get("/profile/:id", validateObjectId, getUserProfileCtrl);
router.put("/profile/:id", validateObjectId, verifyTokenAndUser, updateUserProfileCtrl);
// /api/users/count
router.get("/count", verifyTokenAndAdmin, getUsersCount);
// api/users/profile/profile-photo-upload
router.post("/profile/profile-photo-upload", verifyToken, photoUpload.single("image"), profilePhotoUploadCtrl);
// /api/users/profile/:id
router.delete("/profile/:id", validateObjectId, verifyTokenAndUserOrAdmin, deleteUserProfileCtrl)
module.exports = router;