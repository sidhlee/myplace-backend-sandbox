const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'myplace/upload',
    use_filename: false,
  },
});

// multer returns a middleware
const fileUpload = multer({
  limits: 900000, // size limit: 500kb
  storage,
  // Never trust data from client. Sanitization is a MUST
  fileFilter: (req, file, cb) => {
    // Does mimetype exists in the map? (not undefined)
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    const error = isValid ? null : new Error('Invalid MIME type.');
    // arg1 - error, arg2 - accept (boolean)
    cb(error, isValid);
  },
});

module.exports = fileUpload;
