require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const HttpError = require('./models/http-error');

const usersRouter = require('./routes/users-routes');
const placesRouter = require('./routes/places-routes');

const destroyImage = require('./utils/destroyImage');

const app = express();

app.use(bodyParser.json());

app.use('/api/users', usersRouter);
app.use('/api/places', placesRouter);

app.use(() => {
  throw new HttpError('Could not find the requested page.', 404);
});

app.use(async (err, req, res, next) => {
  console.log(err);
  // If header is already sent, skip to the next middleware
  if (res.headerSent) {
    return next(err);
  }

  // If the error was thrown after saving the place image,
  // destroy saved image from cloudinary
  const publicId = req.place && req.place.imageId;
  if (publicId) {
    await destroyImage(publicId);
  }

  // Send error message with code
  return res.status(err.code || 500).json({
    message: err.message || 'An unknown error occurred.',
  });
});

mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (mongoError) => {
    if (mongoError) {
      console.log('Error connecting to mongoDB...');
    } else {
      console.log('connected to db...');
    }
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Listening to port: ${process.env.PORT || 5000}`);
    });
  }
);
