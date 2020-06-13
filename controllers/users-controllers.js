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

  const createdUser = new User({
    name,
    email,
    // req.file/path holds the provided path in destination field(uploads/images/fileName)
    // We can prepend the address before path in the frontend
    image: /* 'http://localhost:5000/' + */ req.file.path,
    password, // we'll encrypt the password later
    places: [], // the empty initial value will be populated once we add a new place.
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

  return res.status(200).json({
    message: 'Logged in!',
    user: identifiedUser.toObject({ getters: true }),
  });
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
