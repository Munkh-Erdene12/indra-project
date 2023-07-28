const fs = require("fs");
const mongoose = require("mongoose");
const colors = require("colors");
const dotenv = require("dotenv");
const subCategory = require("./models/subcategory");
const product = require("./models/product");
dotenv.config({ path: "./config/config.env" });

mongoose.connect(process.env.MONGODB__URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const subcategoryJSON = JSON.parse(
  fs.readFileSync(__dirname + "/data/subcategory.json", "utf-8")
);
const productJSON = JSON.parse(
  fs.readFileSync(__dirname + "/data/product.json", "utf-8")
);
const importData = async () => {
  try {
    await subCategory.create(subcategoryJSON);
    await product.create(productJSON);
    console.log("өгөгдлийг импортлолоо.... ".green.inverse);
  } catch (err) {
    console.log(err);
  }
};

const delteData = async () => {
  try {
    await subCategory.deleteMany();
    await product.deleteMany();
    console.log("өгөгдлийг бүгдийг устаглаа...".red.inverse);
  } catch (err) {
    console.log(err.red);
  }
};
if (process.argv[2] === "-i") {
  importData();
} else if (process.argv[2] === "-d") {
  delteData();
}
