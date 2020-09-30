require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');
const HttpError = require('./models/http-error');

const usersRouter = require('./routes/users-routes');
const placesRouter = require('./routes/places-routes');

const app = express();

app.use(bodyParser.json());

app.use('/api/users', usersRouter);
// app.use('/api/places', placesRouter);

app.use(() => {
  throw new HttpError('Could not find the requested page.', 404);
});

app.use((err, req, res, next) => {
  console.log(err);
  if (res.headerSent) {
    return next(err);
  }
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
