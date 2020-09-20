const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

const verifyToken = (req, res, next) => {
  if (req.method === 'OPTIONS') return next();

  if (!req.headers.authorization)
    return next(new HttpError('Missing authorization header.', 401));

  // req.headers.authorization => 'bearer TOKEN'
  const token = req.headers.authorization;

  if (!token)
    return next(
      new HttpError('Token is missing from the authorization header', 401)
    );

  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    return next(new HttpError('Invalid token', 401));
  }

  req.userData = { userId: decodedToken.userId };
  return next();
};

module.exports = verifyToken;
