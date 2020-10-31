const express = require('express');
const { check } = require('express-validator');

const { getUsers, signup, login } = require('../controllers/users-controllers');
const fileUpload = require('../middlewares/file-upload');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/', getUsers);

router.post(
  '/signup',
  // multer parses multipart/form-data which is used for sending binary files
  // (bodyParser does not handle multipart bodies)
  // so you need to put this BEFORE validation so that the middleware
  // can find each field in the body object
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
