const { validationResult } = require('express-validator');

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

  const { name, email, password, places } = req.body;

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

  const createdUser = new User({
    name,
    email,
    image: 'https://placem.at/people/w=400&h=400',
    password, // we'll encrypt the password later
    places,
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(new HttpError('Signing up failed, please try again', 500));
  }

  return res
    .status(201)
    .json({ user: createdUser.toObject({ getters: true }) });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let identifiedUser;
  try {
    identifiedUser = await User.findOne({ email: email });
  } catch (err) {
    return next(
      new HttpError('Logging in failed, please try again later', 500)
    );
  }

  if (!identifiedUser || identifiedUser.password !== password) {
    return next(
      new HttpError('Could not identify user with the given credentials.', 401)
    );
  }

  return res.status(200).json({ message: 'Logged in!' });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
