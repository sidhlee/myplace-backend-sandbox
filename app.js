require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cloudinary = require('cloudinary').v2;

const mongoose = require('mongoose');

const HttpError = require('./models/http-error');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');

const app = express();

app.use(bodyParser.json());

app.use(
  // without the 1st arg, client can just provide the hostname/filename to the src
  '/uploads/images/', // file path as requested from client
  express.static(path.join(__dirname, 'uploads', 'images')) // path to src on disk
);

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    // Origin, X-Requested-With, and Accept are set by the browser
    'Origin, X-Requested-With, Accept, Content-Type, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

app.use('/api/places', placesRoutes);
app.use('/api/users', usersRoutes);

app.use(() => {
  throw new HttpError(`The requested page cannot be found.`, 404);
});

app.use((error, req, res, next) => {
  console.log(error);
  // If an error occurs while uploading a file, delete the file from the disk
  if (req.file) {
    cloudinary.uploader.destroy(req.file.filename, (err, result) => {
      if (err) {
        console.log('Error while deleting the image: ', err);
      }
      console.log('Deleting result: ', result);
    });
  }

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
  `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-nfatn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) console.log(err);
    console.log(`connected to db: ${process.env.DB_NAME}`);
    app.listen(process.env.PORT, () => {
      console.log(`listening to PORT ${process.env.PORT}`);
    });
  }
);
