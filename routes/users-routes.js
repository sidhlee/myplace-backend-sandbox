const express = require('express');
const { check } = require('express-validator');

const { getUsers, signup, login } = require('../controllers/users-controllers');
const fileUpload = require('../middlewares/file-upload');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', getUsers);

router.post(
  '/signup',
  fileUpload.single('image'),
  // must include validation when pushing into the db
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  validate,
  signup
);

router.post('/login', login);

module.exports = router;
