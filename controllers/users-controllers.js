const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const User = require('../models/user');
const HttpError = require('../models/http-error');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    return next(new HttpError('Could not find users. Please try again.', 500));
  }

  // convert mongoose doc into plain object activating 'id' getter for '_id'
  return res.json({ users: users.map((u) => u.toObject({ getters: true })) });
};
const signup = async (req, res, next) => {
  const validationErrors = validationResult(req);
  if (!validationErrors.isEmpty()) {
    console.log(validationErrors);
    return next(new HttpError('Invalid inputs were passed.', 422));
  }

  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new HttpError('Email already exists.', 422));
  }

  const hashedPassword = bcrypt.hashSync(password, 12);
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    image: '', // TODO: add multer to attach uploaded file to req
    places: [],
  });

  try {
    await newUser.save();
  } catch (err) {
    return next(new HttpError('Could not signup. Please try again.', 500));
  }

  // TODO: save user info into a jwt and include it in response body

  return res.status(201).json({
    userId: newUser.id,
    email: newUser.email,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email });
  } catch (err) {
    console.log(err);
    return next(
      new HttpError('An error occurred while finding the user.', 500)
    );
  }

  if (!user) {
    return next(new HttpError('Please check your email and try again.', 401));
  }

  if (!bcrypt.compareSync(password, user.password)) {
    return next(
      new HttpError('Please check your password and try again.', 401)
    );
  }
  // TODO: create jwt with user data and include it in response body

  return res.status(200).json({
    userId: user.id,
    userName: user.name,
    email: user.email,
    userImageUrl: user.image,
  });
};

module.exports = {
  getUsers,
  signup,
  login,
};
