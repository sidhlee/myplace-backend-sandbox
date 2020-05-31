require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();

app.use(bodyParser.json());

// use your routes here
// If no path is given, all route paths will be "exact"
app.use('/api/places', placesRoutes); // routes are added at the given path
app.use('/api/users', usersRoutes);

// Handle unsupported routes (after all the routes and before the error handler)
app.use(() => {
  const error = new HttpError('Could not find the requested page', 404);
  throw error;
});

// when you give 4 parameters to `use`, express knows it is an error handler
app.use((err, req, res, next) => {
  // this will run if any preceding middleware throws an error

  // res already sent. pass err to next middleware
  if (res.headerSent) {
    return next(err);
  }
  // use error's status code or fall back to 500
  return (
    res
      .status(err.code || 500)
      // use error's message and provide fallback
      .json({ message: err.message || 'An unknown error occurred!' })
  );
});

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log('connected to db');
    // start server
    app.listen(5000, () => console.log('server listening to PORT 5000...'));
  })
  .catch((err) => {
    console.log(err);
  });
