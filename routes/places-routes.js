const express = require('express'); // have to require express in every file that uses it

const placeControllers = require('../controllers/places-controllers');

const router = express.Router(); // run express's router factory to create router

router.get('/:pid', placeControllers.getPlaceById);

// order of the routes matters.
// /api/places/user will be matched by the above route
router.get('/user/:uid', placeControllers.getPlaceByUser);

router.post('/', placeControllers.createPlace);

// and export with CJS module export
module.exports = router;
