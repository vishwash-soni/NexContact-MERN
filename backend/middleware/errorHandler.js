const AppError = require("../utils/AppError");
const env = require("../config/env");

const notFound = (req, res, next) =>
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let status = err.statusCode || err.status || 500;
  let message = err.message;

  if (err instanceof AppError) {
    // as-is
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON body";
  } else if (err.type === "entity.too.large") {
    status = 413;
    message = "Request body too large";
  } else if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  } else if (err.name === "CastError") {
    status = 400;
    message = `Invalid ${err.path}`;
  } else if (err.code === 11000) {
    status = 409;
    message = "This record already exists";
  } else if (err.name === "MulterError") {
    status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
    message = err.code === "LIMIT_FILE_SIZE" ? "Image is too large (max 5 MB)" : err.message;
  } else if (status >= 500 || !err.expose) {
    status = 500;
    message = "Something went wrong";
  }

  if (status >= 500) console.error(`[${req.method} ${req.originalUrl}]`, err);

  res.status(status).json({ message, ...(env.isProd ? {} : { stack: err.stack }) });
};

module.exports = { notFound, errorHandler };
