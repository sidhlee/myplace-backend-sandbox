const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  // we can add index to the fields that requires faster execution of queries
  // { unique: true } creates index on email field
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  image: { type: String, required: true },
  // Ref Set the model that this path refers to.
  // This is the option that populate looks at to determine the foreign collection it should query.
  places: [{ type: mongoose.ObjectId, required: true, ref: 'Place' }],
});

// unique field only adds unique id to each email property of a user
// but does not check whether it has the unique value for email address
// https://www.npmjs.com/package/mongoose-unique-validator
userSchema.plugin(uniqueValidator);

module.exports = mongoose.model('User', userSchema);
