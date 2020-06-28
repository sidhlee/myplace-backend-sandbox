const multer = require('multer');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
};

// multer returns a middleware
const fileUpload = multer({
  limits: 900000, // size limit: 500kb
  storage: multer.diskStorage({
    // configure storage
    destination: (req, file, cb) => {
      cb(null, 'uploads/images');
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, `${new Date().getTime()}.${ext}`);
    },
  }),
  // Never trust data from client. Sanitization is a MUST
  fileFilter: (req, file, cb) => {
    // Does mimetype exists in the map?
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    const error = isValid ? null : new Error('Invalid MIME type.');
    // arg1 - error, arg2 - accept (boolean)
    cb(error, isValid);
  },
});

module.exports = fileUpload;
