const express = require('express');
const { check } = require('express-validator');

const fileUpload = require('../middlewares/file-upload');
const getGooglePlace = require('../middlewares/get-google-place');

const verifyToken = require('../middlewares/verify-token');

const {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
} = require('../controllers/places-controllers');

const router = express.Router();

router.get('/:pid', getPlaceById);
router.get('/user/:uid', getPlacesByUserId);

router.use(verifyToken);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title').not().isEmpty(),
    check('description').isLength({ min: 4 }),
    check('address').not().isEmpty(),
  ],
  getGooglePlace,
  createPlace
);
router.patch(
  '/:pid',
  [check('title').not().isEmpty(), check('description').isLength({ min: 4 })],
  updatePlace
);
router.delete('/:pid', deletePlace);

module.exports = router;
