const { createPostCtrl,
        getAllPostsCtrl,
        getSinglePostCtrl,
        getPostsCountCtrl,
        deletePostCtrl,
        updatePostCtrl,
        updatePostImgCtrl,
        toggleLikeCtrl } = require("../controllers/postController");
const photoUpload = require("../middlewares/photoUpload");
const validateObjectId = require("../middlewares/validateObjectId");
const { verifyToken } = require("../middlewares/verifyToken");


const router = require("express").Router();

// api/posts/
router.post("/", verifyToken, photoUpload.single("image"), createPostCtrl);
router.get("/", getAllPostsCtrl);

// api/posts/count
router.get("/count", getPostsCountCtrl);

// api/posts/update-image/:id
router.put("/update-image/:id", validateObjectId, verifyToken, photoUpload.single("image"), updatePostImgCtrl);

// api/posts/:id
router.get("/:id", validateObjectId, getSinglePostCtrl);
router.delete("/:id", validateObjectId, verifyToken, deletePostCtrl);
router.put("/:id", validateObjectId, verifyToken, updatePostCtrl);

// api/posts/like/:id
router.put("/like/:id", validateObjectId, verifyToken, toggleLikeCtrl)



module.exports = router;