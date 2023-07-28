const router = require("express").Router();
const {
  createProduct,
  getAllProduct,
  updateProduct,
  getProduct,
  deleteProduct,
  productPhotoUpload,
} = require("../controller/product");
const { upload } = require("../middleware/upload");
const { protect } = require("../middleware/protect");
router
  .post("/", protect, upload.array("image"), createProduct)
  .get("/", getAllProduct)
  .put("/", protect, updateProduct)
  .delete("/", protect, deleteProduct)
  .post("/:id/photo", protect, productPhotoUpload)
  .get("/:id", getProduct);
module.exports = router;
