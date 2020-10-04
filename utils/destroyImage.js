const cloudinary = require('cloudinary').v2;

/**
 * Removes image from cloudinary and returns Promise
 * @param {string} imageId imageId (publicId) of the deleting image
 * @returns {Promise}
 */
const destroyImage = (imageId) => {
  return cloudinary.uploader.destroy(imageId, (error, result) => {
    if (error) {
      console.log('Failed deleting image.', error);
    } else {
      console.log('Deleted image.', result);
    }
  });
};

module.exports = destroyImage;
