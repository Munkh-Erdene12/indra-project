const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Категорийн нэрийг оруулна уу"],
      unique: true,
      trim: true,
      maxlength: [
        50,
        "Категорийн нэрний урт дээд тал нь 50 тэмдэгт байх ёстой",
      ],
    },
    slug: String,
    createUser: String,
    updateUser: String,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: {
      virtuals: true,
    },
  }
);
categorySchema.virtual("Sub-category", {
  ref: "Subcategory",
  localField: "_id",
  foreignField: "category",
  justOne: false,
});
categorySchema.pre("save", function (next) {
  this.slug = slugify(this.name);
  next();
});
module.exports = mongoose.model("category", categorySchema);
