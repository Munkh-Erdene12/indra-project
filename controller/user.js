const asyncHandler = require("../middleware/asyncHandler");
const userModel = require("../models/user");
const MyError = require("../utils/MyError");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const bill = require("../models/purchase");
const sendEmail = require("../utils/mail");
const fs = require("fs");
const path = require("path");
const productModel = require("../models/product");
const user = require("../models/user");
// {url}/api/users/register ==> POST
exports.register = asyncHandler(async (req, res, next) => {
  const { name, lastname, email, password, birthDate, gender, enable2FA } =
    req.body;
  // Create a new user object
  const user = await userModel.create({
    name: name,
    lastname: lastname,
    email: email,
    password: password,
    birthDate: birthDate,
    gender: gender,
  });
  const token = user.getJsonWebToken();
  const cookieOption = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  res.status(200).cookie("user_token", token, cookieOption).send({
    success: "register",
    user,
    token,
  });
});
// {url}/api/users/login ==> POST
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password)
    throw new MyError("имэйл болон нууц үгээ дамжуулна уу", 400);

  const user = await userModel.findOne({ email }).select("+password");

  if (!user) throw new MyError("имэйл болон нууц үгээ зөв оруулна уу", 401);

  const ok = await user.checkPassword(password);

  if (!ok) throw new MyError("имэйл болон нууц үгээ зөв оруулна уу", 401);

  const token = user.getJsonWebToken();
  // req.headers.authorization = `Bearer ${token}`;
  const cookieOption = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  res.status(200).cookie("user_token", token, cookieOption).send({
    success: true,
    login: true,
    token: user.getJsonWebToken(),
    user: user,
  });
});
// {url}/api/users/logout ==> POST
exports.logout = asyncHandler(async (req, res, next) => {
  const cookieOption = {
    expires: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };
  res.status(200).cookie("user_token", token, cookieOption).send({
    success: true,
    token: user.getJsonWebToken(),
    user: "logout",
  });
});
// {url}/api/users/ ==> GET
exports.getUsers = asyncHandler(async (req, res, next) => {
  const user = await userModel.find();
  if (!user) throw new MyError("Бүртгэлтэй хэрэглэгч байхгүй байна", 400);
  res.status(200).send({
    success: true,
    users: user,
  });
});
// {url}/api/users/ ==> PUT
exports.updateUser = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user)
    throw new MyError(
      `хэрэглэгчийг шинжилж чадсангүй  хэрэглэчийн ID: ${req.params.id} буруу байна`,
      400
    );
  res.status(200).send({
    success: true,
    getUser: user,
  });
});
// {url}/api/users/forget-password ==> POST
exports.forgetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.email)
    throw new MyError("Та нууц үг сэргээх имэйл хаягаа оруулна уу", 400);
  const user = await userModel.findOne({ email: req.body.email });

  if (!user)
    throw new MyError(` ${req.body.email} имэйлтэй  хэрэглэгч олдсонгүй `, 400);
  const resetToken = user.generatePasswordChangeToken();
  await user.save({ validateBeforeSave: false });

  const link = `<!DOCTYPE html>
<html lang="en-US">
  <head>
    <meta content="text/html; charset=utf-8" http-equiv="Content-Type" />
    <title>Reset Password Email Template</title>
    <meta name="description" content="Reset Password Email Template." />
    <style type="text/css">
      a:hover {
        text-decoration: underline !important;
      }
    </style>
  </head>

  <body
    marginheight="0"
    topmargin="0"
    marginwidth="0"
    style="margin: 0px; background-color: #f2f3f8"
    leftmargin="0"
  >
    <!--100% body table-->
    <table
      cellspacing="0"
      border="0"
      cellpadding="0"
      width="100%"
      bgcolor="#f2f3f8"
      style="
        @import url(https://fonts.googleapis.com/css?family=Rubik:300,400,500,700|Open+Sans:300,400,600,700);
        font-family: 'Open Sans', sans-serif;
      "
    >
      <tr>
        <td>
          <table
            style="background-color: #f2f3f8; max-width: 670px; margin: 0 auto"
            width="100%"
            border="0"
            align="center"
            cellpadding="0"
            cellspacing="0"
          >
            <tr>
              <td style="height: 80px">&nbsp;</td>
            </tr>
            <tr>
              <td style="text-align: center">
      
              </td>
            </tr>
            <tr>
              <td style="height: 20px">&nbsp;</td>
            </tr>
            <tr>
              <td>
                <table
                  width="95%"
                  border="0"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                  style="
                    max-width: 670px;
                    background: #fff;
                    border-radius: 3px;
                    text-align: center;
                    -webkit-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                    -moz-box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                    box-shadow: 0 6px 18px 0 rgba(0, 0, 0, 0.06);
                  "
                >
                  <tr>
                    <td style="height: 40px">&nbsp;</td>
                  </tr>
                  <tr>
                    <td style="padding: 0 35px">
                      <h1
                        style="
                          color: #1e1e2d;
                          font-weight: 500;
                          margin: 0;
                          font-size: 32px;
                          font-family: 'Rubik', sans-serif;
                        "
                      >
                        You have requested to reset your password
                      </h1>
                      <span
                        style="
                          display: inline-block;
                          vertical-align: middle;
                          margin: 29px 0 26px;
                          border-bottom: 1px solid #cecece;
                          width: 100px;
                        "
                      ></span>
                      <p
                        style="
                          color: #455056;
                          font-size: 15px;
                          line-height: 24px;
                          margin: 0;
                        "
                      >
                        We cannot simply send you your old password. A unique
                        link to reset your password has been generated for you.
                        To reset your password, click the following link and
                        follow the instructions.
                      </p>
                      <a
                        href="http://localhost:3000/reset-password"
                        style="
                          background: #20e277;
                          text-decoration: none !important;
                          font-weight: 500;
                          margin-top: 35px;
                          color: #fff;
                          text-transform: uppercase;
                          font-size: 14px;
                          padding: 10px 24px;
                          display: inline-block;
                          border-radius: 50px;
                        "
                        >Reset Password</a
                      >
                    </td>
                  </tr>
                  <tr>
                    <td style="height: 40px">&nbsp;</td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="height: 20px">&nbsp;</td>
            </tr>
            <tr>
              <td style="text-align: center">
                <p
                  style="
                    font-size: 14px;
                    color: rgba(69, 80, 86, 0.7411764705882353);
                    line-height: 18px;
                    margin: 0 0 0;
                  "
                >
                  &copy; <strong>www.rakeshmandal.com</strong>
                </p>
              </td>
            </tr>
            <tr>
              <td style="height: 80px">&nbsp;</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;
  const info = await sendEmail({
    email: user.email,
    subject: "Нууц үг өөрчлөх хүсэлт",
    message: link,
  });
  res.status(200).send({
    success: true,
    resetToken: resetToken,
  });
});
// {url}/api/users/reset-password/ ==> POST
exports.resetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body.resetToken || !req.body.password)
    throw new MyError("Та нууц үгээ дамжуулна уу", 400);
  const encrypted = crypto
    .createHash("sha256")
    .update(req.body.resetToken)
    .digest("hex");
  const user = await userModel.findOne({
    resetPasswordToken: encrypted,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    throw new MyError("Алдаа гарлаа!", 400);
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  const newToken = user.renewToken();
  await user.save();
  res.status(200).json({
    success: true,
    token: newToken,
    user: user,
  });
});
// {url}/api/users/add-to-wishlist/ ==> POST
exports.addToWishlist = asyncHandler(async (req, res, next) => {
  const { productID, count } = req.body; // count-г дэлгэцнээс авах
  const id = req.userID;

  const user = await userModel.findById(id);

  let name = [];

  if (!user) {
    return res.status(404).json({
      success: false,
      error: "Хэрэглэгч олдсонгүй",
    });
  }
  const existingWishlistItem = user.wishList.find(
    (item) => item.product == productID
  );
  if (existingWishlistItem) {
    existingWishlistItem.count += count || 1;
  } else {
    user.wishList.push({ product: productID, count: count || 1 });
  }
  await user.save();
  let sumTotalPrice = 0;
  const productIDs = user.wishList.map((item) => item.product);
  const productCount = user.wishList.map((item) => item.count);
  const products = await productModel.find({ _id: { $in: productIDs } });
  for (let i in products) {
    sumTotalPrice += products[i].price * productCount[i];
    name.push(products[i].name);
  }
  res.status(200).send({
    success: true,
    data: user.wishList,
    name,
    sumTotalPrice,
  });
});
// {url}/api/users/ ==> POST
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await userModel.findByIdAndDelete(req.params.id);
  if (!user)
    throw new MyError(
      `хэрэглэгчийн бүртгэлийг устгаж чадсангүй буруу ID: ${req.params.id}`,
      400
    );
  res.status(200).send({
    success: true,
    getUser: user,
  });
});
// {url}/api/users/add-to-wishlist/ ==> GET
exports.getWishlist = asyncHandler(async (req, res, next) => {
  const list = await userModel.findById(req.userID).select("wishList");

  const productIDs = list.wishList.map((item) => item.product);
  const productCount = list.wishList.map((item) => item.count);
  const products = await productModel.find({ _id: { $in: productIDs } });
  let sumPrice = 0;
  let productName = [];
  for (let i in products) {
    productName.push(products[i].name);
    sumPrice += products[i].price * productCount[i];
  }
  res.status(200).send({
    success: true,
    sumPrice: sumPrice,
    productName,
    data: list,
  });
});
// {url}/api/users/add-to-wishlist/:id ==> DELTE
exports.deleteWishlist = asyncHandler(async (req, res, next) => {
  const { productID } = req.params;
  const id = req.userID;

  const user = await userModel.findById(id);
  if (!user) {
    return res.status(404).json({
      success: false,
      error: "Хэрэглэгч олдсонгүй",
    });
  }

  const wishlistIndex = user.wishList.findIndex(
    (item) => item.product._id.toString() === productID
  );
  if (wishlistIndex === -1) {
    return res.status(404).json({
      success: false,
      error: "Бүтээгдэхүүн олдсонгүй",
    });
  }

  const deleteWhislist = user.wishList.splice(wishlistIndex, 1);

  await user.save();

  res.status(200).json({
    success: true,
    data: await deleteWhislist,
  });
});
// {url}/api/purchase ==> / POST
exports.purchase = asyncHandler(async (req, res, next) => {
  const wishlist = await userModel.findById(req.userID).select("wishList");
  const productIDs = wishlist.wishList.map((item) => item.product);
  const countProduct = wishlist.wishList.map((item) => item.count);
  const products = await productModel.find({ _id: { $in: productIDs } });
  let sumPrice = 0;
  let productName = [];
  if (!wishlist || wishlist.wishList.length === 0) {
    return res
      .status(400)
      .json({ success: false, message: "Wishlist хоосон байна." });
  }
  for (let i in products) {
    sumPrice += products[i].price * countProduct[i];
    productName.push(products[i].name);

    const totalBalance = parseInt(products[i].totalBlance);
    const count = parseInt(countProduct[i]);

    const remainingBalance = totalBalance - count;
    console.log(remainingBalance);
    const result = await productModel.findByIdAndUpdate(products[i]._id, {
      totalBlance: remainingBalance,
    });
  }
  wishlist.wishList = [];
  wishlist.save();
  const purchase = await bill.findOne();
  if (!purchase) {
    const newPurchase = new bill({ totalPayments: sumPrice });
    await newPurchase.save();
  } else {
    purchase.totalPayments += sumPrice;
    await purchase.save();
  }
  res.status(200).json({
    success: true,
    sumPrice: sumPrice,
    productName: productName,
  });
});
