const logger = (req, res, next) => {
  console.log(
    `${req.method} ${req.protocol}://${req.hostname}${req.originalUrl}`.rainbow
  );
  next();
};
module.exports = logger;
