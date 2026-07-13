const logger = require("../utils/logger");

/**
 * Centralized error handler middleware.
 * Formats errors to ensure a standard structure for the client.
 */
function errorHandler(err, req, res, next) {
  // If response headers are already sent, delegate to Express default
  if (res.headersSent) {
    return next(err);
  }

  // Log error stack trace
  logger.error(`${err.message || "Internal server error"}`, err.stack);

  let statusCode = err.status || err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = undefined;

  // Handle common Mongoose / Database errors
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors).map((e) => e.message);
  } else if (err.code === 11000) {
    statusCode = 409;
    message = "Duplicate key error";
    // Try to parse duplicate field key from index error
    if (err.keyValue) {
      errors = Object.keys(err.keyValue).map((key) => `${key} already exists`);
    }
  } else if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid value for path: ${err.path}`;
  } else if (err.name === "ZodError") {
    statusCode = 400;
    message = "Validation failed";
    errors = err.errors.map((e) => `${e.path.join(".")}: ${e.message}`);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
}

module.exports = errorHandler;
