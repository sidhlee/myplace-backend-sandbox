const express = require('express');
const bodyParser = require('body-parser');

const placesRoutes = require('./routes/places-routes');

const app = express();

// use your routes here
app.use(placesRoutes);

// start server
app.listen(5000);
