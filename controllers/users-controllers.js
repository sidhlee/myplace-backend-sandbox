const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');
const User = require('../models/user');

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await User.find({}, '-password');
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while finding users. Please try again later.',
        500
      )
    );
  }
  if (!users) {
    return next(new HttpError('Could not find users.', 404));
  }

  return res.json({
    users: users.map((user) => user.toObject({ getters: true })),
  });
};

const signup = async (req, res, next) => {
  const { email, name, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email });
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while checking an existing user. Please try again.',
        500
      )
    );
  }

  if (existingUser) {
    return next(new HttpError('Email already exists.', 422));
  }

  const hashedPassword = bcrypt.hashSync(password, 12);
  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    image: (req.file && req.file.path) || '',
    places: [],
  });

  try {
    await newUser.save();
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while saving the user to the database. Please try again later.',
        500
      )
    );
  }

  const token = jwt.sign(
    {
      userId: newUser.id,
      email: newUser.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );

  return res.status(201).json({
    userId: newUser.id,
    email: newUser.email,
    token,
  });
};

const login = async (req, res, next) => {
  const { email, password } = req.body;

  let user;
  try {
    user = await User.findOne({ email });
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while finding the user. Please try again later.',
        500
      )
    );
  }

  if (!user) {
    return next(new HttpError('Please check your email and try again.', 422));
  }

  const isPasswordValid = bcrypt.compareSync(password, user.password);
  if (!isPasswordValid) {
    return next(
      new HttpError('Please check your password and try again.', 422)
    );
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '1h',
    }
  );

  return res.status(200).json({
    userId: user.id,
    email: user.email,
    userName: user.name,
    userImageUrl: user.image,
    token,
  });
};

module.exports = {
  getUsers,
  signup,
  login,
};
