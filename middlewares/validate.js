const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(new HttpError('Invalid inputs were passed.', 422));
  }
  return next();
};

module.exports = validate;
