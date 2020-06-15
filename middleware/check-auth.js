const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
  // allow pre-flight request to continue without checking for token
  if (req.method === 'OPTIONS') {
    return next();
  }
  // token can be considered as a metadata attached to the request
  try {
    const token = req.headers.authorization.split(' ')[1]; // Authorization: 'Bearer TOKEN'
    if (!token) {
      // token is not provided
      throw new Error('Authentication failed!');
    }
    // verify returns the original object that was encoded into jwt
    const decodedToken = jwt.verify(
      token,
      // this private key will invalidate a tempered token
      'secret_key_that_only_the_server_knows'
    );
    // add decoded userId into the request
    req.userData = { userId: decodedToken.userId };
    return next();
  } catch (err) {
    // authorization header doesn't exist
    return next(new HttpError('Authentication failed!', 401));
  }
};
