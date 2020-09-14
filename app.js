require('dotenv').config();

const express = require('express');

const app = express();

app.get('/', (req, res) => {
  return res.send('works');
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`listening to port ${process.env.PORT || 5000}`);
});
