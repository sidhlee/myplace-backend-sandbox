const { v4: uuid } = require('uuid');
// import validation result from the validators we set before the controllers
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');

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

const getPlaceById = (req, res) => {
  const placeId = req.params.pid;

  const place = DUMMY_PLACES.find((p) => p.id === placeId);

  if (!place) {
    // triggers error handler
    throw new HttpError('Could not find a place for the given id', 404);
  }

  res.json({ place });
};

// Add your callbacks at the specified routes(/api/places)
const getPlacesByUserId = (req, res, next) => {
  const userId = req.params.uid;

  const places = DUMMY_PLACES.filter((p) => p.creator === userId);

  if (!places || places.length === 0) {
    // return to break (not that we need the returned value)
    // async callback must pass error to the next!
    return next(new HttpError('Could not find a place for the given id'), 404);
  }

  return res.json({ places });
};

const createPlace = (req, res) => {
  // peek req and return errors object
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.log(errors);
    throw new HttpError('Invalid inputs passed, please check your data', 422);
  }

  const { title, description, coordinates, address, creator } = req.body;
  const createdPlace = {
    id: uuid(),
    title,
    description,
    location: coordinates,
    address,
    creator,
  };

  DUMMY_PLACES.push(createdPlace); // unshift if you want to prepend it

  res.status(200).json({ place: createdPlace });
};

// not "updatePlaceById" since we don't have any other way of updating
const updatePlace = (req, res, next) => {
  // only need these for updating
  const { title, description } = req.body;
  // By convention, you get id of the object in request param, and other data in body
  const placeId = req.params.pid;

  const updatingPlace = DUMMY_PLACES.find((p) => p.id === placeId);
  if (!updatingPlace) {
    return next(new HttpError('Could not find a place for the given id'), 404);
  }

  // find returns pointer to the object inside array
  // so we need to copy the properties into new object and update them
  const newPlace = { ...updatingPlace };
  const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);
  newPlace.title = title;
  newPlace.description = description;

  DUMMY_PLACES[placeIndex] = newPlace;

  return res.status(200).json({ place: newPlace });
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
