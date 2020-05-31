const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, required: true }, // image url
  address: { type: String, required: true },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
  },
  // populates creator field with the document with matching ObjectId from 'users' collection
  creator: { type: mongoose.ObjectId, required: true, ref: 'User' },
});

// 'places' collection will be created
module.exports = mongoose.model('Place', placeSchema);
