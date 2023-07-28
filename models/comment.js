const mongoose = require("mongoose");

const commentSchame = new mongoose.Schema({
  comment: {
    type: String,
    trim: true,
  },
  userID: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
  },
  productID: {
    type: mongoose.Schema.ObjectId,
    ref: "product",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
commentSchame.pre("save", function (next) {
  this.comment = this.comment.charAt(0).toUpperCase() + this.comment.slice(1);
  next();
});
module.exports = mongoose.model("comment", commentSchame);
