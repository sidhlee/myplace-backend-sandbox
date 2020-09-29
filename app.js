require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');

const bodyParser = require('body-parser');

const app = express();

app.use(bodyParser.json());



mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true}, (mongoError) => {
  if (mongoError) { console.log('Error connecting to mongoDB...'); }
  else { console.log('connected to db...')}
  app.listen(process.env.PORT || 5000, () => {
    console.log(`Listening to port: ${process.env.PORT || 5000}`)
  })
})