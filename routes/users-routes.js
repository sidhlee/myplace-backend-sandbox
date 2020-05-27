const express = require('express'); // have to require express in every file that uses it
const { check } = require('express-validator');

const usersControllers = require('../controllers/users-controllers');

const router = express.Router(); // run express's router factory to create router

router.get('/', usersControllers.getUsers);

router.post(
  '/signup',
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
