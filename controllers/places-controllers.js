const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const Place = require('../models/place');
const User = require('../models/user');
const HttpError = require('../models/http-error');
const { getCoordsForAddress } = require('../utils/location');

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
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid input values were passed. Please try again', 422)
    );
  }
  // Get coordinates with Google geocoding API
  const { title, description, address } = req.body;
  let coords;
  try {
    coords = await getCoordsForAddress(address);
  } catch (err) {
    return next(err); // feeling lazy
  }

  // Extract creator id from the token and find the user from db
  const creator = req.userData.userId;
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while finding user. Please try again',
        500
      )
    );
  }

  if (!user) {
    return next(
      new HttpError('Could not find the user with the provided token', 422)
    );
  }

  // Create a new Place mongoose document
  const newPlace = new Place({
    title,
    description,
    address,
    // TODO: replace this with the url to the user-uploaded image
    image: `https://placem.at/places?w=800&random=${req.userData.email}`,
    creator,
    location: coords,
  });

  // Save the place and push the place into user's places field
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await newPlace.save({ session });
    // mongoose push will insert the property that matches places' schema (ObjectId)
    user.places.push(newPlace);
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError(
        'An error occurred while saving the place. Please try again',
        500
      )
    );
  }

  // Send response
  return res.status(201).json({ place: newPlace });
};

const updatePlace = async (req, res, next) => {
  // Validate the request payload
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    return next(
      new HttpError('Invalid input values were passed. Please try again', 422)
    );
  }
  // Find the place from db with the req.params.pid
  const placeId = req.params.pid;
  let place;
  try {
    place = await Place.findById(placeId);
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while finding the place. Please try again',
        500
      )
    );
  }
  if (!place) {
    return next(
      new HttpError('Could not find the place with the given id', 404)
    );
  }
  // Authorize that the updating place is created by the authenticated user
  const { userId } = req.userData;
  // place.creator has a type of ObjectId
  if (place.creator.toString() !== userId) {
    return next(
      new HttpError('You are not authorized to edit this place', 403)
    );
  }
  // Update the place and save
  const { title, description } = req.body;
  place.title = title;
  place.description = description;

  try {
    await place.save();
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while updating place. Please try again',
        500
      )
    );
  }
  // Send response
  return res.status(202).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  // Find the place from db with the req.params.pid
  const placeId = req.params.pid;
  let place;
  try {
    place = Place.findById(placeId).populate('creator');
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while finding the place. Please try again',
        500
      )
    );
  }
  if (!place) {
    return next(
      new HttpError('Could not find the place for the given id', 404)
    );
  }
  // Authorize that the deleting place is created by the authenticated user
  if (place.creator.toString() !== req.userData.userId) {
    return next(
      new HttpError('You are not authorized to delete this place', 403)
    );
  }
  // Pull the place from user's places field and delete the place
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    place.creator.places.pull(place);
    await place.creator.save({ session });
    await place.remove({ session });
    await session.commitTransaction();
  } catch (err) {
    return next(
      new HttpError(
        'Error occurred while deleting place. Please try again.',
        500
      )
    );
  }
  // TODO: Delete the image file from the storage

  // Send response
  return res.status(200).json({ message: 'Place deleted' });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
