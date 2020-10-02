const express = require('express');
const { check } = require('express-validator');
const {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
} = require('../controllers/places-controllers');
const getGooglePlace = require('../middlewares/get-google-place');
const validate = require('../middlewares/validate');

const router = express.Router();

router.get('/:pid', getPlaceById);
router.get('/:uid', getPlacesByUserId);

router.post(
  '/',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 4 }),
    check('address').not().isEmpty(),
  ],
  validate,
  getGooglePlace,
  createPlace
);
router.patch(
  '/:pid',
  [check('title').not().isEmpty(), check('description').isLength({ min: 4 })],
  validate,
  updatePlace
);
router.delete('/:pid', deletePlace);

module.exports = router;
