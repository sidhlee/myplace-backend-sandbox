const express = require('express');
const { check } = require('express-validator');
const { verifyToken } = require('../middleware/verify-token');

const placesControllers = require('../controllers/places-controllers');

const router = express.Router();

router.get('/:pid', placesControllers.getPlaceById);
router.get('/user/:uid', placesControllers.getPlacesByUserId);

// post, patch and delete needs userId from the token

// TODO: commented out for dev
// router.use(verifyToken);

// If successful, userId and email fields are available at req.userData

router.post(
  '/',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 5 }),
    check('address').not().isEmpty(),
  ],
  placesControllers.createPlace
);
router.patch(
  '/:pid',
  [check('title').not().isEmpty(), check('description').isLength({ min: 5 })],
  placesControllers.updatePlace
);
router.delete('/:pid', placesControllers.deletePlace);

module.exports = router;
