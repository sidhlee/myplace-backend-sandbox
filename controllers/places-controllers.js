const Place = require('../models/place');
const User = require('../models/user');
const HttpError = require('../models/http-error');

const getPlaceById = async (req, res, next) => {
  // Find the place from db with req.params.pid
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while finding place. Please try again.',
        500
      )
    );
  }

  if (!place) {
    return next(
      new HttpError('Could not find the place with the given id', 404)
    );
  }
  // Send response with place
  return res.status(200).json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  // Find the user from db with req.params.uid and populate places field
  const userId = req.params.uid;
  let user;
  try {
    user = await User.findById(userId).populate('places');
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while finding user. Please try again',
        500
      )
    );
  }

  if (!user) {
    // we'll not create an error if the user has no place yet
    // we can handle that case on the front end (ie. show a message)
    return next(
      new HttpError('Could not find the user with the given id', 404)
    );
  }

  // Send response with places
  return res.status(200).json({
    places: user.places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  // Validate the request payload
  // Get coordinates with Google geocoding API
  // Create a new Place mongoose document
  // Extract creator id from the token and find the user from db
  // Save the place and push the place into user's places field
  // Send response
};

const updatePlace = async (req, res, next) => {
  // Validate the request payload
  // Find the place from db with the req.params.pid
  // Authorize that the updating place is created by the authenticated user
  // Update the place and save
  // Send response
};

const deletePlace = async (req, res, next) => {
  // Find the place from db with the req.params.pid
  // Authorize that the deleting place is created by the authenticated user
  // Pull the place from user's places field and delete the place
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
