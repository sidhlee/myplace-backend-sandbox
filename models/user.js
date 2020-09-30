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
    type: String,
  },
  places: [
    {
      type: mongoose.ObjectId,
      required: true,
      ref: 'Place', // use Place model to populate places array
    },
  ],
});

module.exports = mongoose.model('User', userSchema);
