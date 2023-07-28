const path = require("path");
const express = require("express");
const connectDB = require("./data");
const cors = require("cors");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const morgan = require("morgan");
const rfs = require("rotating-file-stream");
const bodyParser = require("body-parser");
const colors = require("colors");
dotenv.config({ path: "./config/config.env" });
connectDB();

const app = express();

const corsOption = {
  origin: "http://localhost:3000",
  optionsSuccessStatus: 200,
  allowHeaders: "Authorization, Set-Cookie, Content-Type",
  methods: "*",
  credentials: true,
};
const sessionOption = {
  secret: process.env.SESSION__SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: false,
    maxAge: 30 * 24 * 60 * 60 * 1000,
  },
};
app.use(fileUpload());
app.use(express.json());
app.use(cookieParser());
app.use(cors(corsOption));
app.use(bodyParser.json());
app.use(session(sessionOption));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static("public"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "view"));

const accessLogStream = rfs.createStream("access.log", {
  interval: "1d",
  path: path.join(__dirname, "log"),
});
app.use(morgan("combined", { stream: accessLogStream }));

const userRouter = require("./router/user");
const productRouter = require("./router/product");
const subCategoryRouter = require("./router/subcategory");
const categoryRouter = require("./router/category");
const commentRouter = require("./router/comment");
const errorHandler = require("./middleware/errorHandler");
const logger = require("./middleware/logger");
app.use("/api/users", userRouter);
app.use("/api/category", categoryRouter);
app.use("/api/subcategory", subCategoryRouter);
app.use("/api/product", productRouter);
app.use("/api/comment", commentRouter);
app.use(logger);
app.use(errorHandler);
const serverPort = app.listen(process.env.SERVER__PORT, () => {
  console.log(
    `server listen ${process.env.SERVER__PORT} port`.green.underline.bold
  );
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Алдаа гарлаа: => ${err}`.underline.red.bold);
  serverPort.close(() => {
    console.log("close server port".red.bold.underline);
    process.exit(1);
  });
});
