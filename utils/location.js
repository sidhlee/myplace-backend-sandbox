require('dotenv').config();
const axios = require('axios');

const HttpError = require('../models/http-error');

async function getCoordsForAddress(address) {
  // fallback when we don't have API key
  // return {
  //   lat: 37.524482,
  //   lng: 126.919066,
  // };
  const response = await axios.get(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${process.env.GOOGLE_API_KEY}`
  );

  // check docs for data shape
  // https://developers.google.com/maps/documentation/geocoding/start
  const { data } = response;

  if (!data || data.status === 'ZERO_RESULTS') {
    const error = new HttpError(
      'Could not find location for the given address.',
      422
    );
    throw error;
  }
  const coordinates = data.results[0].geometry.location;

  return coordinates;
}

module.exports = getCoordsForAddress;
