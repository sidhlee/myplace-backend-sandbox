const jwt = require('jsonwebtoken');
const HttpError = require('../models/http-error');

module.exports = (req, res, next) => {
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
      'secret_key_that_only_the_server_knows'
    );
    // add decoded data into the request
    req.userData = { userId: decodedToken.userId };
    return next();
  } catch (err) {
    // authorization header doesn't exist
    return next(new HttpError('Authentication failed!', 401));
  }
};
