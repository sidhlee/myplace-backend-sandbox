const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const Place = require('../models/place');
const User = require('../models/user');
const HttpError = require('../models/http-error');

const getPlaceById = async (req, res, next) => {
  const { pid } = req.params;
  let place;
  try {
    place = await Place.findById(pid);
  } catch (err) {
    return next(new HttpError('An error occurred while finding the place'));
  }
  if (!place)
    return next(new HttpError('Could not find a place with the given id', 422));

  return res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const { uid } = req.params;
  let userWithPlaces;
  try {
    userWithPlaces = await User.findById(uid).populate('places');
  } catch (err) {
    return next(new HttpError('An error occurred while finding the user', 500));
  }
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    return next(new HttpError('Could not find a place for the user', 404));
  }

  return res.json({
    places: userWithPlaces.places.map((p) => p.toObject({ getters: true })),
  });
};
const createPlace = async (req, res, next) => {
  // validate payloads from the client
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return next(
      new HttpError('Invalid inputs were passed. Please try again', 422)
    );
  }
  // create a new place from req.body, userData and place
  const { title, description } = req.body;
  const creator = req.userData.userId; //  added by middleware(verify-token)
  const { formatted_address, location, imageUrl } = req.place; // added by middleware(get-google-place)
  const newPlace = new Place({
    title,
    description,
    address: formatted_address,
    creator,
    image: imageUrl,
    location,
  });

  // find the user from db with creator id
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(
      new HttpError('An error occurred while finding the creator'),
      500
    );
  }
  if (!user)
    return next(
      new HttpError('Could not find the creator from the database', 422)
    );

  // save the new place and push it to the creator's places array
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await newPlace.save({ session });
    user.places.push(newPlace);
    await user.save({ session });
    await session.commitTransaction(); // returns a Promise
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while saving the new place. Please try again,',
        500
      )
    );
  }
  // return response with the new place
  return res.status(201).json({
    place: newPlace,
  });
};
const updatePlace = async (req, res, next) => {};
const deletePlace = async (req, res, next) => {};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
