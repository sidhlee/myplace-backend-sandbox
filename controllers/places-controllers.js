const mongoose = require('mongoose');

const HttpError = require('../models/http-error');
const Place = require('../models/place');
const User = require('../models/user');

const destroyImage = require('../utils/destroyImage');

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
    user = await User.findById(uid).populate('places');
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

  // Find the user from token
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

  // Create a new place
  const newPlace = new Place({
    title,
    description,
    address: formatted_address,
    image: imageUrl,
    imageId,
    creator: userId,
    location,
  });

  // Update user
  user.places.push(newPlace);

  // Save place and user
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

  // Send response (new place)
  return res.status(201).json({
    place: newPlace.toObject({ getters: true }),
  });
};

const updatePlace = async (req, res, next) => {
  const { title, description } = req.body;
  const { pid } = req.params;

  // Find place from db
  let place;
  try {
    place = await Place.findById(pid);
  } catch (err) {
    return next(
      new HttpError('An error occurred while finding the place.', 500)
    );
  }
  if (!place) {
    return next(new HttpError('Could not find a place with the given id', 404));
  }

  // Check authorization (is the request from the creator?)
  if (req.userData.userId !== place.creator.toString()) {
    return next(
      new HttpError('You are not authorized to update this place.', 403)
    );
  }

  // Update place
  place.title = title;
  place.description = description;

  // Save
  try {
    await place.save();
  } catch (err) {
    return next(
      new HttpError('Could not update the place. Please try again.', 500)
    );
  }

  // Send response (updated place)
  return res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
  const { pid } = req.params;
  const { userId } = req.userData;

  let place;
  try {
    place = await Place.findById(pid).populate('creator');
  } catch (err) {
    return next(
      new HttpError('An error occurred while finding the place.', 500)
    );
  }
  if (!place) {
    return next(new HttpError('Could not find a place for the given id.', 404));
  }

  if (userId !== place.creator.id) {
    return next(
      new HttpError('You are not authorized to delete this place.', 403)
    );
  }

  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    place.creator.places.pull(place);
    await place.creator.save({ session });
    // doc.remove() is deprecated!!
    await place.deleteOne({ session });
    await session.commitTransaction();
  } catch (err) {
    return next(
      new HttpError('Could not delete the place. Please try again.', 500)
    );
  }

  // Destroy deleted image from the cloudinary
  await destroyImage(place.imageId);

  return res.json({ message: 'Place deleted.' });
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
