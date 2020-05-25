const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');

const app = express();

// use your routes here
// If no path is given, all route paths will be "exact"
app.use('/api/places', placesRoutes); // routes are added at the given path

// start server
app.listen(5000);
