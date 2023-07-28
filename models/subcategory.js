const mongoose = require("mongoose");
const { transliterate, slugify } = require("transliteration");

const subcategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Дэд ангиллын нэрийг оруулна уу"],
      trim: true,
      maxlength: [
        50,
        "Дэд ангиллын нэрний урт дээд тал нь 50 тэмдэгт байх ёстой",
      ],
    },
    createdUser: String,
    upedtedUser: String,
    avergeRating: {
      type: Number,
      min: [1, "rating хамгийн багадаа 1 байх ёстой"],
      max: [10, "rating хамгийн ихдээ 01 байх ёстой"],
    },
    avergePrice: {
      type: Number,
    },
    slug: String,
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
      required: true,
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: {
      virtuals: true,
    },
  }
);
subcategorySchema.virtual("product", {
  ref: "product",
  localField: "_id",
  foreignField: "subcategory",
  justOne: false,
});
subcategorySchema.pre("save", function (next) {
  this.slug = slugify(this.name);
  this.avergeRating = Math.floor(Math.random() * 10) + 1;
  next();
});
const Subcategory = mongoose.model("Subcategory", subcategorySchema);

module.exports = Subcategory;
