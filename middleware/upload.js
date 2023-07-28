const multer = require("multer");
const path = require("path");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, process.env.FILE_UPLOAD_PATH));
  },
  filename: function (req, file, cb) {
    if (
      file.originalname === "defualt.png" ||
      file.originalname === "defualt.jpg" ||
      file.originalname === "logo.jpg"
    ) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.originalname + "-" + uniqueSuffix + ".jpeg");
    } else {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, file.fieldname + "-" + uniqueSuffix + ".jpeg");
    }
  },
});
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startSWith("image")) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
exports.upload = multer({
  storage: storage,
  multerFilter: multerFilter,
  limits: { fieldSize: process.env.MAX_UPLOAD_FILE_SIZE },
});
