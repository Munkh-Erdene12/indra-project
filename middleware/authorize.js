const MyError = require("../utils/MyError");

exports.authorize = (...roles) => {
  return (req, res, next) => {
    req.userID;
    if (!roles.includes(req.role))
      throw new MyError(
        `Таны эрх [ ${req.role} ] энэ үйлдлийг гүйцэтгэхэд хүрэлцэхгүй байна`,
        403
      );
    next();
  };
};
