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

const signup = async (req, res, next) => {};
const login = async (req, res, next) => {};

module.exports = {
  getUsers,
  signup,
  login,
};
