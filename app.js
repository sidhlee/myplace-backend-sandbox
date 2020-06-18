require('dotenv').config();
// To delete the file on rollback
const aws = require('aws-sdk');
const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const placesRoutes = require('./routes/places-routes');
const usersRoutes = require('./routes/users-routes');
const HttpError = require('./models/http-error');

const app = express();
const s3 = new aws.S3();

app.use(bodyParser.json());

// Any file requested at '/uploads/images/' will be statically served
app.use('/uploads/images', express.static(path.join('uploads', 'images')));

app.use((req, res, next) => {
  // allow req from browsers of any domain (including our app localhost:3000)
  // this rule only applies to browser (Not to other apps like Postman)
  res.setHeader('Access-Control-Allow-Origin', '*');
  // Allow the following headers from the request sent from browsers
  res.setHeader(
    'Access-Control-Allow-Headers',
    // Origin, X-Requested-With, Accept are set by the browser automatically
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  // sets which http methods are allowed on frontend
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});

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
  /*
  req.file => 
  { 
    fieldname: 'image',
    originalname: 'user_placeholder.png',
    encoding: '7bit',
    mimetype: 'image/png',
    size: 216568,
    bucket: 'mern-myplace-uploads-images',
    key: '1592479678674',
    acl: 'private',
    contentType: 'application/octet-stream',
    contentDisposition: null,
    storageClass: 'STANDARD',
    serverSideEncryption: null,
    metadata: { fieldName: 'image' },
    location: 'https://mern-myplace-uploads-images.s3.amazonaws.com/1592479678674',
    etag: '"4788048f319dc48101678d9e69f5077e"',
    versionId: undefined }
  */

  if (req.file) {
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Delete: {
        Objects: [{ Key: req.file.key }],
      },
    };
    // Rollback the creation of file in s3 on error
    s3.deleteObjects(params, (error, data) => {
      if (error) console.log(error, error.stack);
      else console.log(data);
    });
  }

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
      .json({
        message: err.message || 'An unknown error occurred!',
      })
  );
});

mongoose
  .connect(
    `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0-nfatn.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log('connected to db');
    // start server
    app.listen(process.env.PORT || 5000, () =>
      console.log('server listening to PORT 5000...')
    );
  })
  .catch((err) => {
    console.log(err);
  });
