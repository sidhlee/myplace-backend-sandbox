const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true },
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  creator: {
    // with ref, you can reference docs in other collections and apply operations on them
    type: mongoose.ObjectId,
    required: true,
    ref: 'User',
  },
  cloudinaryPublicId: { type: String },
});

module.exports = mongoose.model('Place', placeSchema);
