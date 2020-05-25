const express = require('express'); // have to require express in every file that uses it

const router = express.Router(); // run express's router factory to create router

// Add your callbacks at the specified routes & methods
router.get('/', (req, res, next) => {
  console.log('GET request in place');
  res.json({ message: 'works!' });
});

// and export with CJS module export
module.exports = router;
