const mongoose = require('mongoose');

const placeSchema = mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  address: { type: String, required: true },
  creator: { type: mongoose.ObjectId, required: true, ref: 'User' },
  image: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
});

module.exports = mongoose.model('Place', placeSchema);
