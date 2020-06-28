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
});

module.exports = fileUpload;
