const router = require("express").Router();
const { protect } = require("../middleware/protect");
const { authorize } = require("../middleware/authorize");
const {
  createCategory,
  getCategorys,
  updateCategory,
  getCategory,
  deleteCategory,
} = require("../controller/category");

router
  .post("/", protect, authorize("admin"), createCategory)
  .get("/", getCategorys)
  .get("/:id", getCategory);
router
  .put("/:id", protect, authorize("admin", "operator"), updateCategory)
  .delete("/:id", protect, authorize("admin", "operator"), deleteCategory);
module.exports = router;
