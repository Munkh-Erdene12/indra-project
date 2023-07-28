const productModel = require("../models/product");
const asyncHandler = require("../middleware/asyncHandler");
const MyError = require("../utils/MyError");
const userModel = require("../models/user");
const path = require("path");
const fs = require("fs/promises");
const paginate = require("../utils/pagenate");

// {url}/api/product ==> POST ==> admin
exports.createProduct = asyncHandler(async (req, res, next) => {
  let images = [];
  let productData = {};

  if (!req.files) {
    productData = {
      ...req.body,
    };
  } else {
    productData = {
      ...req.body,
      image: images,
    };
  }
  const product = await productModel.create(productData);
  product.createdUser = req.userID;
  product.save();
  res.status(200).json({
    success: true,
    data: product,
  });
});
// {url}/api/category/:id/product
exports.getSubCategoryProduct = asyncHandler(async (req, res, next) => {
  const product = await productModel.find({ subcategory: req.params.id });

  res.status(200).send({
    success: true,
    count: product.length,
    data: product,
  });
});
// {url}/api/product
exports.getAllProduct = asyncHandler(async (req, res, next) => {
  const select = req.query.select;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  ["select", "page", "limit", "sort"].forEach((el) => delete req.query[el]);
  const query = req.query;
  const pagination = await paginate(page, limit, productModel);
  const product = await productModel
    .find(query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  for (let i of product) {
    if (i.saleTimeEnd < new Date()) {
      i.saleTimeEnd = undefined;
      await i.save();
    }
  }
  res.status(200).send({
    success: true,
    count: product.length,
    data: product,
    pagination,
  });
});
// {url}/api/product/:id
exports.getProduct = asyncHandler(async (req, res, next) => {
  const product = await productModel.findById(req.params.id);
  if (!product)
    throw new MyError(`Бүтээдэхүүн олдсонгүй ID: ${req.params.id}`, 400);
  product.uzsenHuniiToo += 1;
  await product.save();
  res.status(200).send({
    success: true,
    data: product,
  });
});
// {url}/api/product UPDATE => admin or operator
exports.updateProduct = asyncHandler(async (req, res, next) => {
  const product = await productModel.findById(req.params.id);
  if (!product)
    throw new MyError(`Бүтээдэхүүн олдсонгүй ID: ${req.params.id}`, 400);
  if (product.createdUser.toString() !== req.userID && req.role !== "admin")
    throw new MyError("Та зөвхөн өөрийнхөө бүтээдэхүүн засварлах эрхтэй", 403);

  for (let i in req.body) {
    product[i] = req.body[i];
  }
  product.updateUser = req.userID;
  product.save();

  res.status(200).send({
    success: true,
    data: product,
  });
});
// {url}/api/product DELETE => admin
exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const product = await productModel.findById(req.params.id);

  if (!product)
    throw new MyError(`Бүтээдэхүүн олдсонгүй ID: ${req.params.id}`, 400);

  if (product.createdUser.toString() !== req.userID && req.role !== "admin")
    throw new MyError(
      "Та зөвхөн өөрийнхөө бүтээдэхүүнийг л устгах эрхтэй",
      403
    );
  const productDelete = await productModel.findByIdAndDelete(req.params.id);
  await product.avergePrice();
  const user = await userModel.findById(req.userID);
  res.status(200).send({
    whoDeleted: user.name,
    deleteUserID: req.userID,
    success: true,
    data: productDelete,
  });
});
// {url}/api/product/:id/photo
exports.productPhotoUpload = asyncHandler(async (req, res, next) => {
  const product = await productModel.findById(req.params.id);
  if (!product) throw new MyError("Бүтээдэхүүн олдсонгүй ID " + req.params.id);

  const files = req.files.file;

  if (!Array.isArray(files) || files.length === 0) {
    throw new MyError("Зураг олдсонгүй.", 400);
  }
  for (const file of files) {
    if (!file.mimetype.startsWith("image/jpeg"))
      throw new MyError("Та зураг upload хийнэ үү.", 400);

    if (file.size > process.env.MAX_UPLOAD_FILE_SIZE)
      throw new MyError("Таны зурагны хэмжээ хэтэрсэн байна.", 400);

    const date = new Date().getTime();
    const fileName = `image-${date}${path.parse(file.name).ext}`;

    try {
      await file.mv(
        `${path.join(__dirname, "..", "public", "image", "upload")}/${fileName}`
      );
      product.updateUser = req.userID;
      product.image.push(fileName);

      await product.save();
    } catch (err) {
      console.error("Файлыг хуулах явцад алдаа гарлаа. Алдаа:", err.message);
      throw new MyError("Файлыг хуулах явцад алдаа гарлаа.", 400);
    }
  }

  res.status(200).send({
    success: true,
    data: product,
  });
});
