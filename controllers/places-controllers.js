const mongoose = require('mongoose');
// import validation result from the validators we set before the controllers

const fs = require('fs');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../utils/location');
const Place = require('../models/place');
const User = require('../models/user');

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;

  let place;
  try {
    place = await Place.findById(placeId); // returns thenable Query obj
  } catch (err) {
    return next(new HttpError('ERROR: could not find a place', 500));
  }

  if (!place) {
    // triggers error handler
    throw new HttpError('Could not find a place for the given id', 404);
  }

  // { getters: true } converts ObjectId into a string in _id field
  return res.json({ place: place.toObject({ getters: true }) });
};

// Add your callbacks at the specified routes(/api/places)
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let userWithPlaces;
  try {
    // get access to the matching Place documents by ObjectId
    userWithPlaces = await User.findById(userId).populate('places');
  } catch (err) {
    return next(
      new HttpError('Fetching places failed, please try again later', 500)
    );
  }

  // now we can access places documents from userWithPlaces.places
  if (!userWithPlaces || userWithPlaces.places.length === 0) {
    // return to break (not that we need the returned value)
    // async callback must pass error to the next!
    return next(new HttpError('Could not find a place for the given id'), 404);
  }

  // map mongoose Query object into plain JS object with _id converted to string
  return res.json({
    places: userWithPlaces.places.map((place) =>
      place.toObject({ getters: true })
    ),
  });
};

const createPlace = async (req, res, next) => {
  const errors = validationResult(req);

  // peek req and return errors object
  if (!errors.isEmpty()) {
    console.log(errors);
    // you MUST send the errors in next() when working with Promise
    // throw new HttpError('Invalid inputs passed, please check your data', 422);
    return next(
      new HttpError('Invalid inputs passed, please check your data', 422)
    );
  }

  const { title, description, address, creator } = req.body;

  let coordinates;
  try {
    // returns Promise (makes API call to google geocoding)
    coordinates = await getCoordsForAddress(address);
  } catch (err) {
    return next(err);
  }

  // create new document from Place model
  const createdPlace = new Place({
    title,
    description,
    image: req.file.path, // path to the image written to the disk by fileUpload middleware
    address,
    location: coordinates,
    creator,
  });

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
      new HttpError('Could not find the given user. Please try again', 404)
    );
  }

  console.log(user);

  try {
    // create new session
    const session = await mongoose.startSession();
    // start transaction
    session.startTransaction();
    // To execute an operation in a transaction, you need to pass the session as an option.
    // In transaction, collections are not automatically created as usual
    // So you have to manually create the collection before save documents
    await createdPlace.save({ session: session });
    // mongoose 'push' method knows to insert createdPlace's ObjectId into places
    user.places.push(createdPlace);
    await user.save({ session: session });
    // commit transaction
    await session.commitTransaction();
  } catch (err) {
    // if an error gets thrown during a session, all changes are rolled back automatically.
    // errorCode 500 includes
    // - db server down
    // - db validation fails
    return next(new HttpError('Creating place failed, please try again', 500));
  }

  return res.status(200).json({ place: createdPlace });
};

// not "updatePlaceById" since we don't have any other way of updating
const updatePlace = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError('Invalid inputs passed, please check your data', 422);
  }

  // only need these for updating
  const { title, description } = req.body;
  // By convention, you get id of the object in request param, and other data in body
  const placeId = req.params.pid;

  let updatingPlace;
  try {
    updatingPlace = await Place.findById(placeId);
    console.log(updatingPlace);
  } catch (err) {
    // if id is in the wrong format, Error gets thrown and caught here
    return next(new HttpError('Error occurred while finding place', 500));
  }

  // if id is in the correct format, but cannot find matching document
  if (!updatingPlace) {
    return next(new HttpError('Could not find a place for the given id'), 404);
  }

  // place is found. now authorize the request with userId
  // updatingPlace.creator has mongoose ObjectId
  if (updatingPlace.creator.toString() !== req.userData.userId) {
    // 403 - Forbidden(Unauthorized) |  401 - Unauthorized (Unauthenticated)
    return next(new HttpError('You are not allowed to edit this place.', 403));
  }

  // we can directly update on the returned Query object
  updatingPlace.title = title;
  updatingPlace.description = description;

  try {
    await updatingPlace.save();
  } catch (err) {
    return next(new HttpError('Error occurred while updating place', 500));
  }

  // Convert Query obj into plain object before sending back
  return res
    .status(200)
    .json({ place: updatingPlace.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  let deletingPlace;
  try {
    // populate() automatically replaces the specified paths in the document
    // with the pointer to document(s) matching the specified ref(ObjectId) from other collections
    // so that you can directly manipulate the source document from the populated document.
    // To use populate, collections should be in relation by "ref".
    deletingPlace = await Place.findById(req.params.pid).populate('creator');
  } catch (err) {
    return next(new HttpError('Error occurred while finding place'), 500);
  }

  if (!deletingPlace) {
    return next(new HttpError('Could not find a place for the given id'), 404);
  }

  const imagePath = deletingPlace.image;

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await deletingPlace.remove({ session: session });
    // Now we can pull directly from Place document's creator field
    deletingPlace.creator.places.pull(deletingPlace);
    // ... and save it too.
    await deletingPlace.creator.save({ session: session });
    await session.commitTransaction();
  } catch (err) {
    return next(new HttpError('Error occurred while deleting place'), 500);
  }
  // Delete the image file from the disk when deleting a place
  // we don't await for deleting images from the disk!
  fs.unlink(imagePath, (error) => {
    console.log(error);
  });

  return res.status(200).json({ message: 'Deleted places' });
};

// these exports are merged into single object
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
