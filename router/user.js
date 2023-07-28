const router = require("express").Router();
const {
  login,
  register,
  forgetPassword,
  resetPassword,
  addToWishlist,
  getWishlist,
  deleteWishlist,
  logout,
  purchase,
  getUsers,
  updateUser,
  deleteUser,
} = require("../controller/user");
const { protect } = require("../middleware/protect");
const { authorize } = require("../middleware/authorize");
router.post("/login", login);
router.post("/register", register);

router
  .post("/forget-password", forgetPassword)
  .post("/reset-password", resetPassword)
  .get("/add-to-wishlist", protect, getWishlist)
  .post("/add-to-wishlist", protect, addToWishlist)
  .delete("/add-to-wishlist/:productID", protect, deleteWishlist)
  .post("/logout", logout)
  .post("/purchase", protect, purchase)
  .get("/", protect, authorize("admin"), getUsers)
  .put("/", protect, updateUser)
  .delete("/", protect, authorize("admin"), deleteUser);
module.exports = router;
