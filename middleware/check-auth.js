const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      return next(new HttpError('Cannot find authentication token.', 401));
    }
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    req.userData = { userId: decodedToken.userId, email: decodedToken.email };
    return next(); // Don't forget to call next!
  } catch (err) {
    return next(new HttpError('Authentication failed.', 500));
  }
};
