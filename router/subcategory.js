const router = require("express").Router();
const {
  subCategoryGetAll,
  deleteSubCategory,
  updateSubCategory,
  subcategoryCreate,
  subcategory,
} = require("../controller/subcategory");
const { getSubCategoryProduct } = require("../controller/product");
const { protect } = require("../middleware/protect");

router.get("/:id/product", getSubCategoryProduct);
router
  .get("/", subCategoryGetAll)
  .post("/", subcategoryCreate)
  .put("/:id", updateSubCategory)
  .delete("/:id", deleteSubCategory)
  .get("/:id", subcategory);
module.exports = router;
