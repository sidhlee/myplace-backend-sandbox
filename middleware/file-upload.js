const aws = require('aws-sdk');
const multerS3 = require('multer-s3');
const multer = require('multer');
const { v1: uuid } = require('uuid');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg',
};

// this is a group of middlewares that we can use in out middleware chain
const fileUpload = multer({
  // configure multer which file to accept and where to store them
  limits: 500000, // upload limit of 500kb
  // storage requires multer storage driver
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      // arg1 - error, arg2 - path that I want to store my data at
      cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
      // access file arg for mimetype
      const ext = MIME_TYPE_MAP[file.mimetype];
      // arg1 - error
      cb(null, uuid() + '.' + ext);
    },
  }),
  // we shouldn't trust the validation from the client because it is hackable.
  // Frontend validation is for better user-experience, not data-sanitization.
  fileFilter: (req, file, cb) => {
    // If the mimetype exists in the map, convert it to boolean with double bang operator
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    const error = isValid ? null : new Error('Invalid mime type!');
    // arg1 - error (if any), arg2 - accept:boolean
    cb(error, isValid);
  },
});

aws.config.update({
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  region: process.env.S3_BUCKET_REGION,
});

const s3 = new aws.S3();

const s3Upload = multer({
  limits: 500000,
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET_NAME,
    acl: 'public-read',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      const fileName = Date.now().toString();
      cb(null, fileName);
    },
  }),
});

module.exports = { fileUpload, s3Upload };
