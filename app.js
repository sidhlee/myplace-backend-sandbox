require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');

const app = express();

app.use(bodyParser.json());

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use(() => {
  throw new HttpError(`The requested page cannot be found.`, 404);
});

app.use((error, req, res, next) => {
  if (res.headerSent) {
    // if any error is thrown after the response is sent,
    // we'll just delegate the error to the next middleware
    return next(error);
  }
  return res
    .status(error.code || 500)
    .json({ message: error.message || 'An unknown error occurred' });
});

mongoose.connect(
  process.env.MONGO_URI,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) console.log(err);
    console.log('connected to db...');
    app.listen(process.env.PORT, () => {
      console.log(`listening to PORT ${process.env.PORT}`);
    });
  }
);
