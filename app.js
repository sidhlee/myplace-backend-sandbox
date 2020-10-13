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

  if (req.place && req.place.imageId) {
    await destroyImage(req.place.imageId);
    console.log('Rolled back uploading the Google place image to Cloudinary.');
  } else if (req.file && req.file.filename) {
    // if req.place doesn't exist, it means that the error was thrown before getGooglePlace middleware
    // So check for the image uploaded from multer and destroy it.
    await destroyImage(req.file.filename);
    console.log('Rolled back uploading the place image to Cloudinary.');
  }

  // Send error message with status

  // error.code is a string label for identifying the type of error(eg. 'LIMIT_FILE_SIZE')
  return res.status(err.status || 500).json({
    message: err.message || 'An unknown error occurred.',
  });
});

mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (mongoError) => {
    if (mongoError) {
      console.log(mongoError);
      console.log('Error connecting to mongoDB...');
    } else {
      console.log('connected to db...');
    }
    app.listen(process.env.PORT || 5000, () => {
      console.log(`Listening to port: ${process.env.PORT || 5000}`);
    });
  }
);
