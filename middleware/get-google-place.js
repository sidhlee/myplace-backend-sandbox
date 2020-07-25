const cloudinary = require('cloudinary').v2;
const { validationResult } = require('express-validator');
const HttpError = require('../models/http-error');
const { getPlaceForText } = require('../utils/location');

/**
 * Get coords, formattedAddress from the req.body.address and
 * get cloudinaryUrl, cloudinaryPublicId either from fileUpload middleware or
 * from uploading google place photo into cloudinary.
 * Attach { coords, formattedAddress, cloudinaryUrl, cloudinaryPublicId } to req
 */
const getGooglePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid input values were passed, Please try again.', 422)
    );
  }

  const { address } = req.body;
  let coords;
  let formattedAddress;
  let photoReference;
  try {
    const { formatted_address, geometry, photos } = await getPlaceForText(
      address
    );
    coords = geometry.location;
    formattedAddress = formatted_address;
    photoReference = photos[0].photo_reference;
  } catch (err) {
    return next(
      new HttpError(
        'Could not get place for the given text from google API',
        500
      )
    );
  }

  // Check if uploaded image file is attached to the req.
  // If not, upload google's image to cloudinary and attach the uploaded url to the req

  const placePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${process.env.GOOGLE_API_KEY}`;

  try {
    let cloudinaryUrl;
    let cloudinaryPublicId;

    if (!req.file || !req.file.path) {
      const result = await cloudinary.uploader.upload(placePhotoUrl, {
        folder: 'myplace/upload',
        use_filename: false,
      });
      cloudinaryUrl = result.secure_url;
      cloudinaryPublicId = result.public_id;
    } else {
      cloudinaryUrl = req.file.path;
      cloudinaryPublicId = req.file && req.file.filename;
    }

    req.place = {
      formattedAddress,
      coords,
      cloudinaryUrl,
      cloudinaryPublicId,
    };
  } catch (err) {
    return next(
      new HttpError('Could not save Google Place photo URL to cloudinary', 500)
    );
  }

  return next();
};

module.exports = getGooglePlace;
