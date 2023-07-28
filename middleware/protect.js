const asyncHandler = require("./asyncHandler");
const jwt = require("jsonwebtoken");
const MyError = require("../utils/MyError");
const userModel = require("../models/user");
exports.protect = asyncHandler(async (req, res, next) => {
  const authorizationHeader = req.headers.authorization;
  let token = null;
  if (authorizationHeader) {
    token = authorizationHeader.split(" ")[1];
  } else if (req.cookies) {
    token = req.cookies["user_token"];
  }
  if (!token)
    throw new MyError(
      "Энэ үйлдлийг хийхэд таны эрх хүрэхгүй байна. Та эхлээд логин хийнэ үү",
      401
    );
  const tokenObj = jwt.verify(token, process.env.JWT_SECRET);
  req.userID = tokenObj.id;
  req.role = tokenObj.role;

  try {
    const tokenObj = jwt.verify(token, process.env.JWT_SECRET);
    req.userID = tokenObj.id;
    req.role = tokenObj.role;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      const user = await userModel();
      const newToken = user.renewToken(token);
      res.cookie("user_token", newToken, {
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      });
      token = newToken;
      req.cookies.user_token = newToken;
      const tokenObj = jwt.verify(token, process.env.JWT_SECRET);
      req.userID = tokenObj.id;
      req.role = tokenObj.role;

      next();
    } else {
      throw new MyError("Токен шалгахад алдаа гарлаа", 401);
    }
  }
});
