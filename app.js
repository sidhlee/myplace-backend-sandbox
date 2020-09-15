require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cloudinary = require('cloudinary').v2;

const HttpError = require('./models/http-error');
const usersRouter = require('./routes/users-routes');
const placesRouter = require('./routes/places-routes');

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With',
    'Accept',
    'Content-Type',
    'Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/api/users', usersRouter);
app.use('/api/places', placesRouter);

app.use(() => {
  throw new HttpError('The requested Page could not be found.', 404);
});

app.use((err, req, res, next) => {
  console.log('Global Error->', err);

  // rollback uploaded file on error
  if (req.file) {
    console.log('file -> ', req.file);
    cloudinary.uploader.destroy(req.file.filename, (deleteError, result) => {
      if (deleteError) console.log('Error deleting file: ', deleteError);
      console.log('Deleted file: ', req.file.originalname, result);
    });
  }

  // if response is already sent, call next middleware with error
  if (res.headerSent) {
    console.log('[headerSent]');
    return next(err);
  }
  // Multer adds non-number error code (e.g. 'LIMIT_FILE_SIZE) to the error object
  // which throws express RangeError: Invalid status code
  const errorCode = typeof err.code === 'number' ? err.code : 500;

  return res.status(errorCode).json({
    message: err.message || 'An unknown error occurred',
  });
});

mongoose.connect(
  process.env.MONGO_URI,
  { useNewUrlParser: true, useUnifiedTopology: true },
  (dbConnectionError) => {
    if (dbConnectionError) console.log(dbConnectionError);
    console.log('connected to db');
    app.listen(process.env.PORT || 5000, () => {
      console.log(`listening to the port ${process.env.PORT || 5000}`);
    });
  }
);
