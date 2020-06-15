const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user'); // import User model

const getUsers = async (req, res, next) => {
  let users;
  try {
    // we could also set the projection as 'name email'
    users = await User.find({}, '-password');
  } catch (err) {
    return next(
      new HttpError(
        'An Error occurred while finding users. Please try again later',
        500
      )
    );
  }
  return res.json({
    users: users.map((user) => user.toObject({ getters: true })),
  });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    // throw doesn't get handled in async function
    // throw new HttpError('Invalid inputs passed, please check your data', 422);
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const { name, email, password } = req.body;

  let userWithGivenEmail;
  try {
    userWithGivenEmail = await User.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError('Signing up failed, please try again later', 500)
    );
  }

  if (userWithGivenEmail) {
    return next(
      new HttpError('Could not create user, email already exist.', 422)
    );
  }
  let hashedPassword;
  // arg2 - salt rounds
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(new HttpError('Could not create user, please try again', 500));
  }

  const createdUser = new User({
    name,
    email,
    // req.file/path holds the provided path in destination field(uploads/images/fileName)
    // We can prepend the address before path in the frontend
    image: /* 'http://localhost:5000/' + */ req.file.path,
    password: hashedPassword,
    places: [], // the empty initial value will be populated once we add a new place.
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError('Signing up failed, please try again', 500));
  }

  let token;
  // payload can be anything that can identify the user with
  try {
    token = jwt.sign(
      { userId: createdUser.id, email: createdUser.email }, // payload
      'secret_key_that_only_the_server_knows', // secret
      { expiresIn: '1h' } // options - good practice to expire the token in one hour
    );
  } catch (err) {
    return next(new HttpError('Signing up failed, please try again', 500));
  }

  return (
    res
      .status(201)
      // we decided to return these to the client when signed up
      .json({ userId: createdUser.id, email: createdUser.email, token })
  );
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let identifiedUser;
  try {
    // get user from db
    identifiedUser = await User.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError('Logging in failed, please try again later', 500)
    );
  }

  if (!identifiedUser) {
    return next(
      new HttpError('Could not identify user with the given credentials.', 401)
    );
  }

  // If user exists in db, compare pw with hashed one.
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, identifiedUser.password);
  } catch (err) {
    // server error
    return next(new HttpError('Could not log in. Please try again later', 500));
  }

  // Throw for invalid pw
  if (!isValidPassword) {
    return next(
      new HttpError('Could not log in. Please check your password', 401)
    );
  }

  let token;
  try {
    token = jwt.sign(
      { userId: identifiedUser.id, email: identifiedUser.email }, // payload
      'secret_key_that_only_the_server_knows', // secret
      { expiresIn: '1h' } // options - good practice to expire the token in one hour
    );
  } catch (err) {
    return next(new HttpError('Logging in failed, please try again', 500));
  }

  // All pass. Log user in.
  return res.status(200).json({
    userId: identifiedUser.id,
    email: identifiedUser.email,
    token,
    // client will attach this token to the future requests to
    // access the routes that require authentication
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
