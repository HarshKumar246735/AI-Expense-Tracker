const ApiError = require("../utils/ApiError");

// validate(schema, "body" | "query" | "params")
const validate = (schema, source = "body") => (req, res, next) => {
  const result = schema.safeParse(req[source] || {});
  if (!result.success) {
    const errors = result.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }));
    const err = new ApiError(400, errors.map((e) => e.message).join(", "));
    err.errors = errors;
    return next(err);
  }
  req[source] = result.data;
  next();
};

const validateId = (param = "id") => (req, res, next) =>
  /^[a-f\d]{24}$/i.test(req.params[param]) ? next() : next(new ApiError(400, "Invalid id"));

module.exports = { validate, validateId };
