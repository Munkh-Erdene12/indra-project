const subCategory = require("../models/subcategory");
const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utils/MyError");
const paginate = require("../utils/pagenate");
const productModel = require("../models/product");
// {url}/api/subcategory/ ==> POST ==> admin
exports.subcategoryCreate = asyncHandler(async (req, res, next) => {
  const createSubCategory = await subCategory.create(req.body);
  res.status(200).send({
    success: true,
    data: createSubCategory,
  });
});
// {url}/api/subcategory/ ==> GET
exports.subCategoryGetAll = asyncHandler(async (req, res, next) => {
  const select = req.query.select;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  ["select", "page", "limit", "sort"].forEach((el) => delete req.query[el]);
  const query = req.query;
  const pagination = await paginate(page, limit, subCategory);

  const categories = await subCategory
    .find(query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  res.status(200).send({
    success: true,
    count: categories.length,
    data: categories,
    pagination,
  });
});
// {url}/api/subcategory/:id ==> GET
exports.subcategory = asyncHandler(async (req, res, next) => {
  const categories = await subCategory
    .findById(req.params.id)
    .populate("product");
  res.status(200).send({
    success: true,
    data: categories,
  });
});
// {url}/api/subcategory/:id ==> PUT ==> admin or operator
exports.updateSubCategory = asyncHandler(async (req, res, next) => {
  const updateSubCategory = await subCategory.findById(req.params.id);
  if (!updateSubCategory)
    throw new myError(`Дэд категори олдсонгүй ID: ${req.params.id}`, 400);
  if (
    updateSubCategory.createdUser.toString() !== req.userID &&
    req.role !== "admin"
  )
    throw new myError("Та зөвхөн өөрийнхөө дэд категори засварлах эрхтэй", 403);

  for (let i in req.body) {
    updateSubCategory[i] = req.body[i];
  }
  updateSubCategory.upedtedUser = req.userID;
  updateSubCategory.save();

  res.status(200).send({
    success: true,
    data: updateSubCategory,
  });
});
// {url}/api/subcategory/:id ==> DELETE  ==> admin
exports.deleteSubCategory = asyncHandler(async (req, res, next) => {
  const subcategoryDelte = await subCategory.findByIdAndDelete(req.params.id);
  if (!category)
    throw new myError(`Дэд категорги устагдасангүй ID: ${req.params.id}`, 400);

  const productDelete = await productModel.deleteMany({
    category: req.params.id,
  });

  if (!productDelete)
    throw new myError(`Бүтээдэхүүн устгагдсангүй ID: ${req.params.id}`, 400);
  res.status(200).send({
    success: true,
    category,
    productDelete,
  });
});
