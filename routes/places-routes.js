const express = require('express');
const { check } = require('express-validator');
const {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
} = require('../controllers/places-controllers');
const fileUpload = require('../middlewares/file-upload');
const getGooglePlace = require('../middlewares/get-google-place');
const validate = require('../middlewares/validate');
const verifyToken = require('../middlewares/verify-token');

const router = express.Router();

router.get('/:pid', getPlaceById);
router.get('/:uid', getPlacesByUserId);

router.use(verifyToken);

router.post(
  '/',
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 4 }),
    check('address').not().isEmpty(),
  ],
  validate,
  fileUpload.single('image'),
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
