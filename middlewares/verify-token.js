const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

const verifyToken = (req, res, next) => {
  // 1. bypass preflight request
  if (req.method === 'OPTIONS') {
    return next();
  }

  // 2. check authorization header & extract token from it
  if (!req.headers.authorization) {
    return next(new HttpError('Missing authorization header.', 401));
  }

  // Authorization: bearer TOKEN
  const token = req.headers.authorization.split(' ')[1];
  if (!token) {
    return next(
      new HttpError('Token is missing from the authorization header.', 401)
    );
  }

  // 3. decode user data from the token
  let decodedToken;
  try {
    // will throw if token is invalid
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new HttpError('Invalid token', 401));
  }

  // 4. attach user data to req object
  req.userData = {
    userId: decodedToken.userId,
  };

  // 5. continue to next middleware
  return next();
};

module.exports = verifyToken;
