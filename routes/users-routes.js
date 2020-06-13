const express = require('express'); // have to require express in every file that uses it
const { check } = require('express-validator');

const usersControllers = require('../controllers/users-controllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router(); // run express's router factory to create router

router.get('/', usersControllers.getUsers);

router.post(
  '/signup',
  // Add multer middleware that retrieves a single file
  // 'image' is the name of the field that holds the image data in the body object
  fileUpload.single('image'),
  [
    check('name').not().isEmpty(),
    check('email')
      .normalizeEmail() // Test@test.com => test@test.com
      .isEmail(),
    check('password').isLength({ min: 6 }),
  ],
  usersControllers.signup
);

// don't need validation here
// (if user not found, we're sending out errors)
router.post('/login', usersControllers.login);

module.exports = router;
