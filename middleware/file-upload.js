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
});

module.exports = fileUpload;
