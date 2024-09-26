const { createCommentCntr, getAllComments, deleteCommentCtrl, updateCommentCtrl } = require("../controllers/commentController");
const validateObjectId = require("../middlewares/validateObjectId");
const { verifyToken, verifyTokenAndAdmin } = require("../middlewares/verifyToken");

const router = require("express").Router();

// api/comment/
router.post("/", verifyToken, createCommentCntr);
router.get("/", verifyTokenAndAdmin, getAllComments);
// api/comment/:id
router.delete("/:id", validateObjectId, verifyToken, deleteCommentCtrl);
router.put("/:id", validateObjectId, verifyToken, updateCommentCtrl);



module.exports = router;