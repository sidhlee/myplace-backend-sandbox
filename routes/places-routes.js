const express = require('express'); // have to require express in every file that uses it

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
  {
    id: 'p2',
    title: ' Park',
    description: 'Beautiful park surrounded by sky scrapers in Youido, Seoul',
    imageUrl: 'https://placem.at/places?w=1260&h=750&random=2',
    address: '68 Yeouigongwon-ro, Yeoui-dong, Yeongdeungpo-gu, Seoul', // cspell: disable-line
    location: {
      lat: 37.524482,
      lng: 126.919066,
    },
    creator: 'u2',
  },
];

// Add your callbacks at the specified routes & methods
router.get('/:pid', (req, res, next) => {
  const placeId = req.params.pid;
  const place = DUMMY_PLACES.find((place) => place.id === placeId);
  res.json({ place });
});

// and export with CJS module export
module.exports = router;
