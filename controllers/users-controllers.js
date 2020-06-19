const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const HttpError = require('../models/http-error');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    return next(
      new HttpError('Could not find users. Please try again later', 500)
    );
  }

  return res.json({
    users: users.map((user) => user.toObject({ getters: true })),
  });
};

const signup = async (req, res, next) => {
  const { name, email, password } = req.body;

  // check if a user with the same email exists
  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while checking existing user. Please try again',
        500
      )
    );
  }

  if (existingUser) {
    return next(new HttpError('Could not sign up. Email already exists.', 422));
  }

  // Hash password
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while hashing password. Please try again',
        500
      )
    );
  }

  // Create a new user with given data and save
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    places: [],
    // TODO: replace this with url to the user image uploaded from the client
    image: `https://placem.at/people?w=400&random=${email}`,
  });

  try {
    await newUser.save();
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while saving user to the database. Please try again',
        500
      )
    );
  }

  // Create token from user data
  let token;
  try {
    token = jwt.sign(
      {
        userId: newUser.id,
        email: newUser.email,
      },
      process.env.JWT_KEY,
      { expiresIn: '1h' }
    );
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while creating a new token. Please try again',
        500
      )
    );
  }

  // Send response
  return res
    .status(201)
    .json({ userId: newUser.id, email: newUser.email, token });
};

const login = async () => {};

module.exports = {
  getUsers,
  signup,
  login,
};
