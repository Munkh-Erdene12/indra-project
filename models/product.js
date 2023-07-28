const mongoose = require("mongoose");
const productSchame = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Бүтээдэхүүний нэрийг оруулна уу"],
    },
    shortContent: {
      type: String,
      required: [true, "Бүтээдэхүүний тухай оруулна уу"],
    },
    bestSeller: {
      type: String,
      default: false,
    },
    uzsenHuniiToo: {
      type: Number,
      default: 0,
    },
    totalBlance: Number,
    image: Array,
    price: {
      type: Number,
      required: [true, "Бүтээдэхүүний үнийг оруулна уу"],
    },
    subcategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subcategory",
      required: [true, "дэд категори ID оруулна уу"],
    },
    createdUser: String,
    updateUser: String,
    saleTimeStart: Date,
    saleTimeEnd: Date,

    os: String,
    cpu: String,
    cpuCore: String,
    cpuGhz: String,
    gpu: String,
    monitor: String,
    ram: String,
    ramType: String,
    storageType: String,
    storage: String,
    input: String,
    keymouse: String,
    camera: String,
    videoRecording: String,
    trueDepthCamera: String,
    faceID: String,
    gps: String,
    videoCalling: String,
    audioCalling: String,
    audioPlayBack: String,
    videoPlayBack: String,
    magsafe: String,
    sensor: String,
    audio: String,
    wlan: String,
    battery: String,
    charging: String,
    weight: String,
    size: String,
    features: String,
    protect: String,
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
productSchame.virtual("comment", {
  ref: "comment",
  localField: "_id",
  foreignField: "productID",
  justOne: false,
});
productSchame.statics.avgPrice = async function (catID) {
  const obj = await this.aggregate([
    { $match: { subcategory: catID } },
    { $group: { _id: "$subcategory", avgPrice: { $avg: "$price" } } },
  ]);
  let avgPrice = null;
  if (obj.length > 0) avgPrice = Math.round(obj[0].avgPrice);

  await this.model("Subcategory").findByIdAndUpdate(catID, {
    avergePrice: avgPrice,
  });
  return obj;
};
productSchame.pre("save", async function (next) {
  this.totalBlance = Math.floor(Math.random() * 50 + 1);
  this.constructor.avgPrice(this.subcategory);
  next();
});

module.exports = mongoose.model("product", productSchame);
