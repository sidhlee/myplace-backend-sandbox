const axios = require('axios');
const HttpError = require('../models/http-error');

const getCoordsForAddress = async (address) => {
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

module.exports = { getCoordsForAddress };
