const express = require('express');
const { check } = require('express-validator');
const { verifyToken } = require('../middleware/verify-token');

const placesControllers = require('../controllers/places-controllers');
const fileUpload = require('../middleware/file-upload');
const getGooglePlace = require('../middleware/get-google-place');

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById);
router.get('/user/:uid', placesControllers.getPlacesByUserId);

// post, patch and delete needs userId from the token
router.use(verifyToken); // don't need to run the middleware (it's a function, not a factory)

// If successful, userId and email fields are available at req.userData

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 4 }),
    check('address').not().isEmpty(),
  ],
  getGooglePlace,
  placesControllers.createPlace
);

router.patch(
  '/:pid',
  [check('title').not().isEmpty(), check('description').isLength({ min: 4 })],
  placesControllers.updatePlace
);

router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
