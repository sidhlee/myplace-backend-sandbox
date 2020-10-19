const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// specify cloud_name, api_key, api_secret
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    use_filename: false,
    folder: process.env.CLOUDINARY_FOLDER,
  },
});

const fileUpload = multer({
  storage,
  limits: {
    fileSize: 500000,
  },
  fileFilter: (req, file, cb) => {
    const isValid = !!['image/png', 'image/jpg', 'image/jpeg'].find(
      (mt) => mt === file.mimetype
    );
    const error = isValid ? null : new Error('Invalid MIME type');
    cb(error, isValid);
  },
});

module.exports = fileUpload;

/* 
<File properties>
File objects will expose the following properties mapped from the Cloudinary API:

filename - public_id of the file on cloudinary
path	- A URL for fetching the file
size	- Size of the file in bytes

===================
EXAMPLE Request Object
===================
{
  ...
  file:
    { fieldname: 'image',
      originalname: 'IMG_8660.JPG',
      encoding: '7bit',
      mimetype: 'image/jpeg',
      path:
        'https://res.cloudinary.com/dprnfmgwy/image/upload/v1603086494/myplace/test/hi4ikmgywmxg9rrmuoxo.jpg',
      size: 330045,
      filename: 'myplace/test/hi4ikmgywmxg9rrmuoxo' },
  ...
}
*/
