const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const cloudinary = require('cloudinary').v2;

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
      new HttpError('Could not find the place with the given id.', 404)
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
        'An error occurred while finding user. Please try again.',
        500
      )
    );
  }

  if (!user) {
    // we'll not create an error if the user has no place yet
    // we can handle that case on the front end (ie. show a message)
    return next(
      new HttpError('Could not find the user with the given id.', 404)
    );
  }

  // Send response with places
  return res.status(200).json({
    places: user.places.map((place) => place.toObject({ getters: true })),
  });
};

/**
 * Creates a place from req.body and save to db
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const createPlace = async (req, res, next) => {
  // req.body is validated in get-google-place middleware

  const { title, description } = req.body;
  // Provided by get-google-place middleware
  const {
    formattedAddress,
    coords,
    cloudinaryUrl,
    cloudinaryPublicId,
  } = req.place;

  // Extract creator id from the token and find the user from db
  const creator = req.userData.userId;
  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while finding user. Please try again.',
        500
      )
    );
  }

  if (!user) {
    return next(
      new HttpError('Could not find the user with the provided token.', 422)
    );
  }

  let newPlace;
  try {
    newPlace = new Place({
      title,
      description,
      address: formattedAddress,
      image: cloudinaryUrl,
      creator,
      location: coords,
      cloudinaryPublicId,
    });

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
        'An error occurred while saving the place. Please try again.',
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
      new HttpError('Invalid input values were passed. Please try again.', 422)
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
        'An error occurred while finding the place. Please try again.',
        500
      )
    );
  }
  if (!place) {
    return next(
      new HttpError('Could not find the place with the given id.', 404)
    );
  }
  // Authorize that the updating place is created by the authenticated user

  const { userId } = req.userData;

  // place.creator has a type of ObjectId
  if (place.creator.toString() !== userId) {
    return next(
      new HttpError('You are not authorized to edit this place.', 403)
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
        'An error occurred while updating place. Please try again.',
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
    place = await Place.findById(placeId).populate('creator');
  } catch (err) {
    return next(
      new HttpError(
        'An error occurred while finding the place. Please try again.',
        500
      )
    );
  }
  if (!place) {
    return next(
      new HttpError('Could not find the place for the given id.', 404)
    );
  }

  // Authorize that the deleting place is created by the authenticated user
  // Remember! place.creator is populated with User document
  if (place.creator.id !== req.userData.userId) {
    return next(
      new HttpError('You are not authorized to delete this place.', 403)
    );
  }

  // Pull the place from user's places field and delete the place
  try {
    // if place fields are not found, check if you forgot to add 'await'
    // in front of Place.findById
    const session = await mongoose.startSession();
    session.startTransaction();
    place.creator.places.pull(place);
    await place.creator.save({ session });
    await place.remove({ session });
    await session.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(
      new HttpError(
        'Error occurred while deleting place. Please try again.',
        500
      )
    );
  }

  if (place.cloudinaryPublicId) {
    const publicId = place.cloudinaryPublicId;
    cloudinary.uploader.destroy(publicId, (err, result) => {
      if (err) {
        console.log('Error while deleting the image: ', err);
      }
      console.log('Deleting result: ', result);
    });
  }

  // Send response
  return res.status(200).json({ message: 'Place deleted.' });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
