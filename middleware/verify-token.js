const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

const verifyToken = (req, res, next) => {
  // Allow preflight requests to pass through
  if (req.method === 'OPTIONS') {
    return next();
  }
  try {
    // Extract token from the header and decode it with the secret key

    // Header is sent in the format:
    // Authorization: 'Bearer TOKEN'
    const token = req.headers.authorization.split(' ')[1];
    if (!token) {
      throw new HttpError(
        'Authentication token is missing from the header',
        401
      );
    }
    const decodedToken = jwt.verify(token, process.env.KWT_KEY);

    // Attach decoded token to the request
    req.userData = { userId: decodedToken.userId };

    // Go to next middleware
    return next();
  } catch (err) {
    return next(
      new HttpError('An error occurred while verifying the token', 500)
    );
  }
};

module.exports = { verifyToken };
