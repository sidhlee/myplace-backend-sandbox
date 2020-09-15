const express = require('express');
const { check } = require('express-validator');

const { getUsers, signup, login } = require('../controllers/users-controllers');
const fileUpload = require('../middlewares/file-upload');

const router = express.Router();

router.get('/', getUsers);

router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name').not().isEmpty(),
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  signup
);

// no need to validate because we're not storing data to the db
router.post('/login', login);

module.exports = router;
