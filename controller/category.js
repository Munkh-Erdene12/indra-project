const categoryModel = require("../models/category");
const subCategoryModel = require("../models/subcategory");
const asyncHandler = require("../middleware/asyncHandler");
const myError = require("../utils/MyError");
const paginate = require("../utils/pagenate");
// {url}/api/category ==> POST ==> admin
exports.createCategory = asyncHandler(async (req, res, next) => {
  const category = await categoryModel.create(req.body);
  res.status(200).send({
    success: true,
    category,
  });
});
// {url}/api/category ==> GET
exports.getCategorys = asyncHandler(async (req, res, next) => {
  const select = req.query.select;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const sort = req.query.sort;
  ["select", "page", "limit", "sort"].forEach((el) => delete req.query[el]);
  const query = req.query;
  const pagination = await paginate(page, limit, categoryModel);

  const categorys = await categoryModel
    .find(query, select)
    .sort(sort)
    .skip(pagination.start - 1)
    .limit(limit);
  console.log(categorys);
  if (categorys.length == 0) throw new myError("Категори хоосон байна", 400);
  res.status(200).send({
    success: true,
    count: categorys.length,
    categorys,
    pagination,
  });
});
// {url}/api/category/:id ==> GET
exports.getCategory = asyncHandler(async (req, res, next) => {
  const category = await categoryModel
    .findById(req.params.id)
    .populate("Sub-category");
  if (!category) throw new myError("Категори байхгүй байна", 400);
  res.status(200).send({
    success: true,
    category,
  });
});
// {url}/api/category ==> PUT ==> admin or operator
exports.updateCategory = asyncHandler(async (req, res, next) => {
  const category = await categoryModel.findById(req.params.id);
  if (!category)
    throw new myError(`Категори олдсонгүй ID: ${req.params.id}`, 400);
  if (category.createUser.toString() !== req.userID && req.role !== "admin")
    throw new myError("Та зөвхөн өөрийнхөө  категори засварлах эрхтэй", 403);

  for (let attribute in req.body) {
    category[attribute] = req.body[attribute];
  }
  category.save();
  res.send({
    data: category,
  });
});
// {url}/api/category ==> delete ==> admin
exports.deleteCategory = asyncHandler(async (req, res, next) => {
  const category = await categoryModel.findByIdAndDelete(req.params.id);
  if (!category)
    throw new myError(`Категорги устагдасангүй ID: ${req.params.id}`, 400);

  const subCategory = await subCategoryModel.deleteMany({
    category: req.params.id,
  });

  if (!subCategory)
    throw new myError(
      `Категорийн дэд категори устгагдсангүй ID: ${req.params.id}`,
      400
    );
  res.status(200).send({
    success: true,
    category,
    subCategory,
  });
});
