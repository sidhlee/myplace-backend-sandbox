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
router.get('/user/:uid', getPlacesByUserId);

router.use(verifyToken);

router.post(
  '/',
  // multer middleware has to come before express-validator
  // to be able to parse the multipart/form-data
  fileUpload.single('image'),
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
