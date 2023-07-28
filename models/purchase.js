const mongoose = require("mongoose");

const billPurchae = new mongoose.Schema({
  totalPayments: {
    type: Number,
    default: 0,
  },
});
module.exports = mongoose.model("bill", billPurchae);
