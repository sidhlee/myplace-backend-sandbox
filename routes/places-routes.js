const express = require('express'); // have to require express in every file that uses it

const HttpError = require('../models/http-error');

const router = express.Router(); // run express's router factory to create router

const DUMMY_PLACES = [
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

// Add your callbacks at the specified routes(/api/places)
router.get('/:pid', (req, res, next) => {
  const placeId = req.params.pid;

  const place = DUMMY_PLACES.find((place) => place.id === placeId);

  if (!place) {
    // triggers error handler
    throw new HttpError('Could not find a place for the given id', 404);
  }

  res.json({ place });
});

// order of the routes matters.
// /api/places/user will be matched by the above route
router.get('/user/:uid', (req, res, next) => {
  const userId = req.params.uid;

  const place = DUMMY_PLACES.find((p) => {
    return p.creator === userId;
  });
  if (!place) {
    // return to break (not that we need the returned value)
    // async callback must pass error to the next!
    return next(new HttpError('Could not find a place for the given id'), 404);
  }

  res.json({ place });
});

// and export with CJS module export
module.exports = router;
