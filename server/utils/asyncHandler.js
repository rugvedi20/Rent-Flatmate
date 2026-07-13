/**
 * Wraps async Express routes to automatically catch promise rejections
 * and pass them to the next middleware (the global error handler).
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
