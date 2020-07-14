const axios = require('axios');
const HttpError = require('../models/http-error');

const getCoordsForText = async (placeText) => {
  const { data } = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${process.env.GOOGLE_API_KEY}`
  );
  // Google geocoding status codes:
  // https://developers.google.com/maps/documentation/geocoding/intro#StatusCodes
  if (!data || data.status === 'ZERO_RESULTS') {
    throw new HttpError(
      'Could not find the location for the given address',
      404
    );
  }
  const coords = data.results[0].geometry.location;

  return coords;
};

/**
 * https://developers.google.com/places/web-service/search
 * Takes place text and returns a place with photo url, coords, and formatted address
 * @param {string} placeText
 * @returns {Place} { formatted_address, geometry, photos }
 */
const getPlaceForText = async (placeText) => {
  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
    placeText
  )}&inputtype=textquery&language=en&fields=photos,geometry,formatted_address&key=${
    process.env.GOOGLE_API_KEY
  }`;

  try {
    const { data } = await axios.get(url);
    if (!data || data.status !== 'OK') {
      console.log(data);
      throw new HttpError('Could not find a place for the given address', 404);
    }
    return data.candidates[0];
  } catch (err) {
    console.log(err);
    throw new HttpError('An error occurred while getting a place.', 500);
  }
};

module.exports = { getCoordsForText, getPlaceForText };
