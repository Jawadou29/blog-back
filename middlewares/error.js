// not found
const notFound = (req, res, next) => {
  const error = new Error(`not found - ${req.originalUrl}`);
  res.status(404);
  next(error);
}
// error handler middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(200).json({
    message: err,
    stack: process.env.NODE_DEV === "production" ? null : err.stack,
  })
}

module.exports = {
  errorHandler,
  notFound
}