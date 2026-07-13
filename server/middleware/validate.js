/**
 * Zod validation middleware wrapper.
 * Validates request data (body, query, params) against a Zod schema.
 */
const validate = (schema) => (req, res, next) => {
  try {
    schema.parse({
      body: req.body,
      query: req.query,
      params: req.params,
    });
    next();
  } catch (err) {
    // Pass Zod validation errors to the global error handler
    next(err);
  }
};

module.exports = validate;
