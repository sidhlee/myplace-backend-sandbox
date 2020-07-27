const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

const User = require('../models/user');
const HttpError = require('../models/http-error');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    return next(
      new HttpError('Could not find users. Please try again later.', 500)
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
    return next(
      new HttpError('Invalid input values were passed. Please try again', 422)
    );
  }
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
        'An error occurred while hashing password. Please try again.',
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
    // Cloudinary PublicId
    image: (req.file && req.file.filename) || '', // Client will show default image for empty string
  });

  try {
    await newUser.save();
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while saving user to the database. Please try again.',
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
        'An error occurred while creating access token. Please try again.',
        500
      )
    );
  }

  // Send response
  return res
    .status(201)
    .json({ userId: newUser.id, email: newUser.email, token });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  // Find the user from the database with provided email
  let user;
  try {
    user = await User.findOne({ email });
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while finding the user. Please try again.',
        500
      )
    );
  }
  if (!user) {
    return next(new HttpError('Please check your email and try again.', 422));
  }

  // Validate the payload password against hashed password from the database
  let isPasswordValid = false;
  try {
    isPasswordValid = await bcrypt.compare(password, user.password);
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while validating password. Please try again.',
        500
      )
    );
  }
  if (!isPasswordValid) {
    return next(
      new HttpError('Please check your password and try again.', 422)
    );
  }

  // Take user id & email from user and encode them into the token
  let token;
  try {
    token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_KEY,
      {
        expiresIn: '1h',
      }
    );
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while creating access token. Please try again.',
        500
      )
    );
  }

  // Send response with user id, email, and token
  return res.status(200).json({
    userId: user.id,
    userName: user.name,
    userImageUrl: user.image,
    email: user.email,
    token,
  });
};

module.exports = {
  getUsers,
  signup,
  login,
};
