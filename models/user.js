const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  image: {
    type: String, // user image can be an empty string, and App will show the default user placeholder image
  },
  places: [
    {
      type: mongoose.ObjectId,
      required: true,
      ref: 'Place',
    },
  ],
});

module.exports = mongoose.model('User', userSchema);
