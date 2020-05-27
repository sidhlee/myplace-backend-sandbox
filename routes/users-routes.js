const express = require('express'); // have to require express in every file that uses it

const usersControllers = require('../controllers/users-controllers');

const router = express.Router(); // run express's router factory to create router

router.get('/', usersControllers.getUsers);
router.post('/signup', usersControllers.signup);
router.post('/login', usersControllers.login);

module.exports = router;
