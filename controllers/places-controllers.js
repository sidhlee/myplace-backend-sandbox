const { v4: uuid } = require('uuid');
// import validation result from the validators we set before the controllers
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const getCoordsForAddress = require('../utils/location');
const Place = require('../models/place');

let DUMMY_PLACES = [
  {
    id: 'p1',
    title: 'Youido Park',
    description: 'Beautiful park surrounded by sky scrapers in Youido, Seoul',
    imageUrl: 'https://placem.at/places?w=1260&h=750&random=1',
    address: '68 Yeouigongwon-ro, Yeoui-dong, Yeongdeungpo-gu, Seoul', // cspell: disable-line
    location: {
      lat: 37.524482,
      lng: 126.919066,
    },
    creator: 'u1',
  },
];

const getPlaceById = async (req, res) => {
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
  res.json({ place: place.toObject({ getters: true }) });
};

// Add your callbacks at the specified routes(/api/places)
const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;

  let places;
  try {
    places = await Place.find({ creator: userId }); // pass query obj
  } catch (err) {
    return next(
      new HttpError('Fetching places failed, please try again later', 500)
    );
  }

  if (!places || places.length === 0) {
    // return to break (not that we need the returned value)
    // async callback must pass error to the next!
    return next(new HttpError('Could not find a place for the given id'), 404);
  }

  // map mongoose Query object into plain JS object with _id converted to string
  return res.json({
    places: places.map((place) => place.toObject({ getters: true })),
  });
};

const createPlace = async (req, res, next) => {
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
    image: 'https://placem.at/places?w=1260&h=750&random=1',
    address,
    location: coordinates,
    creator,
  });

  try {
    await createdPlace.save();
  } catch (err) {
    const error = new HttpError('Creating place failed, please try again', 500);
    return next(err);
  }

  res.status(200).json({ place: createdPlace });
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

const deletePlace = (req, res, next) => {
  const deletingPlace = DUMMY_PLACES.find((p) => p.id === req.params.pid);
  if (!deletingPlace) {
    return next(new HttpError('Could not find a place for the given id'), 404);
  }
  DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== req.params.pid);
  return res.status(200).json({ message: 'Deleted places.' });
};

// these exports are merged into single object
exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
