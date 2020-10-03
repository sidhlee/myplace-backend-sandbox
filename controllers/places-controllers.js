const mongoose = require('mongoose');
const HttpError = require('../models/http-error');
const Place = require('../models/place');
const User = require('../models/user');

const getPlaceById = async (req, res, next) => {
  const { pid } = req.params;

  let place;
  try {
    place = await Place.findById(pid);
  } catch (err) {
    return next(
      new HttpError('An error occurred while finding the place.', 500)
    );
  }
  if (!place) {
    return next(new HttpError('Could not find a place for the given id.', 422));
  }

  return res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
  const { uid } = req.params;

  let user;
  try {
    user = await (await User.findById(uid)).populate('places');
  } catch (err) {
    return next(
      new HttpError('An error occurred while finding the user.', 500)
    );
  }
  if (!user) {
    return next(new HttpError('Could not find a user with the given id.', 422));
  }
  if (user.places.length === 0) {
    return next(new HttpError('Could not find any places for the user.', 404));
  }

  return res.json({
    places: user.places.map((p) => p.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
  const { title, description } = req.body;
  const { userId } = req.userData;
  const { formatted_address, location, imageUrl, imageId } = req.place;

  let user;
  try {
    user = await User.findById(userId);
  } catch (err) {
    return next(
      new HttpError('An error occurred while finding the creator.', 500)
    );
  }

  if (!user) {
    return next(new HttpError('Could not find the creator.', 500));
  }

  const newPlace = new Place({
    title,
    description,
    address: formatted_address,
    image: imageUrl,
    imageId,
    creator: userId,
    location,
  });

  user.places.push(newPlace);

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    await newPlace.save({ session });
    await user.save({ session });
    await session.commitTransaction();
  } catch (err) {
    console.log(err);
    return next(new HttpError('Could not save the new place.', 500));
  }

  return res.status(201).json({
    place: newPlace.toObject({ getters: true }),
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
