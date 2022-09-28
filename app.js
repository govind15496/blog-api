const express = require('express');
const compression = require('compression');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();

require('./config/passport');

const usersRouter = require('./routes/users');
const postsRouter = require('./routes/posts');
const commentsRouter = require('./routes/comments');

const PORT = process.env.PORT || 8080;

// Set up mongoose connection
var mongoose = require('mongoose');
var mongoURI = process.env.MONGO_URI;
mongoose
  .connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('connected to db');
  });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const app = express();

app.use(compression());
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/users/', usersRouter);
app.use('/api/posts/', postsRouter);
app.use('/api/comments', commentsRouter);
app.get('*', function (req, res) {
  res
    .status(404)
    .send('Oops! You are lost.\nWe can not find the page you are looking for.');
});

app.listen(PORT, () => {
  console.log(`Running at http://localhost:${PORT}`);
});
