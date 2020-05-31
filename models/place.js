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
  // Ref Set the model that this path refers to.
  // This is the option that populate looks at to determine the foreign collection it should query.
  creator: { type: mongoose.ObjectId, required: true, ref: 'User' },
});

// 'places' collection will be created
module.exports = mongoose.model('Place', placeSchema);
