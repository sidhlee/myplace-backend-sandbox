const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// configure cloudinary object
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// create a new CloudinaryStorage object passing in the configured object
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: process.env.CLOUDINARY_FOLDER, // path to the resource within cloudinary
    use_filename: false,
  },
});
// create a multer instance that we can use to create file-handling middleware
const fileUpload = multer({
  limits: {
    fileSize: 500000, // 500kb
  },
  storage,
  fileFilter: (req, file, cb) => {
    // validate mimetype
    const isValid = !!['image/png', 'image/jpg', 'image/jpeg'].find(
      (mt) => mt === file.mimetype
    );
    // create error if not valid
    const error = isValid ? null : new Error('Invalid MIME type');
    // call cb with error and validity
    cb(error, isValid);
  },
});

// export the multer instance
module.exports = fileUpload;
