const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const JWT = require("jsonwebtoken");
const crypto = require("crypto");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Хэрэглэгчийн нэрийг оруулна уу"],
    },
    lastname: {
      type: String,
      required: [true, "Та овогоо оруулна уу"],
    },
    email: {
      type: String,
      required: [true, "Хэрэглэгчийн имэйл хаягийг оруулж өгнө үү"],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Имэйл хаяг буруу байна.",
      ],
    },
    role: {
      type: String,
      required: [true, "Хэрэглэгчийн эрхийг оруулна уу"],
      enum: ["user", "operator"],
      default: "user",
    },
    image: { type: String, default: "../image/home/defualt.jpg" },

    password: {
      type: String,
      minlength: 4,
      required: [true, "Нууц үгээ оруулна уу"],
      select: false,
    },
    twoFactorAuth: {
      enabled: {
        type: Boolean,
        default: false,
      },
      secret: {
        type: String,
      },
    },
    birthDate: {
      type: String,
      required: [true, "Та төрсөн он, сар, өдрөө оруулна уу"],
    },
    gender: String,
    wishList: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "product",
        },
        count: {
          type: Number,
          default: 1,
        },
      },
    ],
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
UserSchema.virtual("comment", {
  ref: "comment",
  localField: "_id",
  foreignField: "userID",
});
UserSchema.virtual("addWishtList", {
  ref: "User",
  localField: "_id",
  foreignField: "userID",
  justOne: false,
});
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) next();
  const salt = await bcrypt.genSalt(16);
  this.password = await bcrypt.hash(this.password, salt);
});

UserSchema.methods.getJsonWebToken = function () {
  const token = JWT.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRESIN }
  );

  return token;
};
UserSchema.methods.renewToken = function (oldToken) {
  const newToken = JWT.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRESIN }
  );
  return newToken;
};

UserSchema.methods.checkPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};
UserSchema.methods.generatePasswordChangeToken = function () {
  const resetToken = crypto.randomBytes(20).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

  return resetToken;
};
module.exports = mongoose.model("User", UserSchema);
