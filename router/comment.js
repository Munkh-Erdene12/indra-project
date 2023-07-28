const router = require("express").Router();
const {
  getComment,
  createComment,
  commentUpdate,
  commentDelete,
} = require("../controller/comment");
const { protect } = require("../middleware/protect");
router
  .get("/", getComment)
  .post("/", createComment)
  .put("/:id", protect, commentUpdate)
  .delete("/:id", protect, commentDelete);
module.exports = router;
