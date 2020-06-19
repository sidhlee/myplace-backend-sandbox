const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minLength: 6 },
  image: { type: String, required: true },
  places: [{ type: mongoose.ObjectId, required: true, ref: 'Place' }],
});

// uniqueValidator throws mongoose validation error before saving the document to the mongodb
// when the unique constraint is violated
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
