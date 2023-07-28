const commentModel = require("../models/comment");
const asyncHandler = require("../middleware/asyncHandler");
const MyError = require("../utils/MyError");
const userModel = require("../models/user");
const productModel = require("../models/product");
// {url}/api/comment ==> POST
exports.createComment = asyncHandler(async (req, res, next) => {
  const { comment, userID, productID } = req.body;
  console.log(req.body);
  const user = await userModel.findById(userID);
  if (!user)
    throw new MyError(`Хэрэглэгчийн ID "${userID}" байхгүй байна`, 400);
  const product = await productModel.findById(productID);
  if (!product)
    throw new MyError("Бүтээдэхүүний " + productID + " байхгүй байна", 400);
  res.status(200).send({
    success: true,
    comment: await commentModel.create({ comment, userID, productID }),
  });
});
// {url}/api/comment ==> GET
exports.getComment = asyncHandler(async (req, res, next) => {
  const comment = await commentModel.find();
  res.status(200).send({
    success: true,
    comment: comment,
  });
});
// {url}/api/comment ==> PUT
exports.commentUpdate = asyncHandler(async (req, res, next) => {
  const comment = await commentModel.findById(req.params.id);
  if (comment.userID.toString() !== req.userID)
    throw new MyError("Та өөрийнхөө тайлбарыг засварлах эрхтэй", 403);
  res.status(200).send({
    success: true,
    comment: await commentModel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }),
  });
});
// {url}/api/comment ==> DELETE
exports.commentDelete = asyncHandler(async (req, res, next) => {
  const comment = await commentModel.findById(req.params.id);
  if (comment.userID.toString() !== req.userID)
    throw new MyError("Та өөрийнхөө тайлбарыг устгах эрхтэй", 403);
  res.status(200).send({
    success: true,
    comment: await commentModel.findByIdAndDelete(req.params.id),
  });
});
