const axios = require('axios');
const cloudinary = require('cloudinary').v2;
const HttpError = require('../models/http-error');

const getGooglePlace = async (req, res, next) => {
  const { address } = req.body;
  // encodeURIComponent encodes the entire string including protocol and domain name
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
    address
  )}&inputtype=textquery&fields=photos,formatted_address,geometry&key=${
    process.env.GOOGLE_API
  }`;

  let place;
  try {
    const { data } = await axios(url);
    if (!data.candidates || data.candidates.length === 0) {
      return next(
        new HttpError('Could not find a place for the given address'),
        422
      );
    }
    // https://developers.google.com/places/web-service/search#find-place-responses
    place = data.candidates[0];
  } catch (err) {
    return next(new HttpError('An error occurred while getting a place.', 500));
  }

  const { formatted_address, geometry, photos } = place;
  if (!photos || photos.length === 0 || !photos[0].photo_reference) {
    return next(new HttpError('No images available for that address.', 422));
  }

  // https://developers.google.com/places/web-service/photos#photo_references
  const { photo_reference } = photos[0];

  // get image url and id from either user-uploaded image or google place photo
  let imageUrl;
  let imageId;

  if (!req.file || !req.file.path) {
    // if no image is uploaded, save photo_reference to cloudinary
    // and get image path and public id
    try {
      const referencedImage = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photo_reference}&key=${process.env.GOOGLE_API}`;
      const uploadResponse = await cloudinary.uploader.upload(referencedImage, {
        folder: '/myplace/run6/',
        use_filename: false,
      });

      imageUrl = uploadResponse.url;
      imageId = uploadResponse.public_id;
    } catch (err) {
      next(new HttpError('An error occurred while saving Google photo.', 500));
    }
  } else {
    // use user-uploaded image
    imageUrl = req.file.path;
    imageId = req.file.filename;
  }

  req.place = {
    formatted_address,
    location: geometry.location,
    imageUrl,
    imageId,
  };

  return next();
};

module.exports = getGooglePlace;
