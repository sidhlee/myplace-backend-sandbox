const getPlaceById = (req, res, next) => {
  // Find the place from db with req.params.pid
  // Send response with place
};

const getPlacesByUserId = (req, res, next) => {
  // Find the user from db with req.params.uid
  // Send response with places
};

const createPlace = (req, res, next) => {
  // Validate the request payload
  // Get coordinates with Google geocoding API
  // Create a new Place mongoose document
  // Extract creator id from the token and find the user from db
  // Save the place and push the place into user's places field
  // Send response
};

const updatePlace = (req, res, next) => {
  // Validate the request payload
  // Find the place from db with the req.params.pid
  // Authorize that the updating place is created by the authenticated user
  // Update the place and save
  // Send response
};

const deletePlace = (req, res, next) => {
  // Find the place from db with the req.params.pid
  // Authorize that the deleting place is created by the authenticated user
  // Pull the place from user's places field and delete the place
};

module.exports = {
  getPlaceById,
  getPlacesByUserId,
  createPlace,
  updatePlace,
  deletePlace,
};
