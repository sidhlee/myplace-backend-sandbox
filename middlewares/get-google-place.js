const { validationResult } = require('express-validator');
const axios = require('axios');
const cloudinary = require('cloudinary').v2;

const HttpError = require('../models/http-error');

const getGooglePlace = async (req, res, next) => {
  // validate form data
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs were passed. Please try again.', 422)
    );
  }
  // get place from the address
  const { address } = req.body;

  let place;
  try {
    const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
      address
    )}&inputtype=textquery&fields=photos,formatted_address,name,geometry&key=${
      process.env.GOOGLE_KEY
    }`;
    const { data } = await axios(url);
    if (!data || data.status !== 'OK') {
      console.log(data);
      return next(
        new HttpError('Could not get a place for the given address', 404)
      );
    }
    // https://developers.google.com/places/web-service/search#find-place-responses
    place = data.candidates[0];
  } catch (err) {
    return next(new HttpError('An error occurred while getting a place', 500));
  }
  // get photoReference from place
  const { formatted_address, geometry, photos } = place;
  if (!photos || !photos[0] || !photos[0].photoReference) {
    return next(new HttpError('No images available for that address.', 422));
  }
  const { photoReference } = photos[0];

  let imageUrl;
  let imageId;

  // if no file was uploaded, upload google place photo to cloudinary
  if (!req.file || !req.file.path) {
    // https://developers.google.com/places/web-service/photos
    const placePhotoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${process.env.GOOGLE_KEY}`;
    try {
      // https://cloudinary.com/documentation/image_upload_api_reference#sample_response
      const uploadResponse = await cloudinary.uploader.upload(placePhotoUrl, {
        folder: 'myplace/upload',
        use_filename: false,
      });
      imageUrl = uploadResponse.secure_url;
      imageId = uploadResponse.public_id;
    } catch (err) {
      return next(
        new HttpError('An error occurred while uploading google photo.', 500)
      );
    }
  } else {
    // if the user uploaded the file, multer middleware already uploaded that to the cloudinary
    // https://www.npmjs.com/package/multer#file-information
    imageUrl = req.file.path;
    imageId = req.file.filename;
  }

  // add place to req {formattedAddress, coords, imageUrl, imageId }
  req.place = {
    formatted_address,
    location: geometry.location,
    imageUrl,
    imageId,
  };

  return next();
};

module.exports = getGooglePlace;
