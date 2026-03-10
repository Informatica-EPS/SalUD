const { ValidationError } = require("sequelize");

const logErrors = (err, req, res, next) => {
  console.error(err);
  next(err);
};

const ORMErrorHandler = (err, req, res, next) => {
  if (err instanceof ValidationError) {
    res
      .status(409)
      .json({ statusCode: 409, message: err.name, errors: err.errors });
  }

  next(err);
};

const errorHandler = (err, req, res, next) => {
  console.error(err);
  res.status(500).json({
    message: err.message || "Internal Server Error",
    stack: err.stack || null,
  });
};

module.exports = { errorHandler, logErrors, ORMErrorHandler };
