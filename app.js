const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');

const app = express();

// use your routes here
// If no path is given, all route paths will be "exact"
app.use('/api/places', placesRoutes); // routes are added at the given path

// when you give 4 parameters to `use`, express knows it is an error handler
app.use((err, req, res, next) => {
  // this will run if any preceding middleware throws an error

  // res already sent. pass err to next middleware
  if (res.headerSent) {
    return next(err);
  }
  // use error's status code or fall back to 500
  res
    .status(err.code || 500)
    // use error's message and provide fallback
    .json({ message: err.message || 'An unknown error occurred!' });
});

// start server
app.listen(5000);
