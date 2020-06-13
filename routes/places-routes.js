const express = require('express'); // have to require express in every file that uses it
const { check } = require('express-validator');

const placeControllers = require('../controllers/places-controllers');
const fileUpload = require('../middleware/file-upload');

const router = express.Router(); // run express's router factory to create router

router.get('/:pid', placeControllers.getPlaceById);

// order of the routes matters.
// /api/places/user will be matched by the above route
router.get('/user/:uid', placeControllers.getPlacesByUserId);

// validate form entries for request with body
router.post(
  '/',
  fileUpload.single('image'),
  // register validator
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
    // we're not checking coordinates (we'll get coordinates from Maps API)
  ],
  placeControllers.createPlace
);

router.patch(
  '/:pid',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    // we're not checking coordinates (we'll get coordinates from Maps API)
  ],
  placeControllers.updatePlace
);

router.delete('/:pid', placeControllers.deletePlace);

// and export with CJS module export
module.exports = router;
