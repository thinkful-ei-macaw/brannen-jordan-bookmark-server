require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const {
  NODE_ENV
} = require('./config');
const winston = require('winston');

const app = express();

const morganOption = (NODE_ENV === 'production') ?
  'tiny' :
  'common';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: 'info.log'
    })
  ]
});

if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

// set up middleware
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(validateBearerToken);

function validateBearerToken(req, res, next) {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(' ')[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({
      error: 'Unauthorized request'
    });
  }
  next();
}


app.get('/bookmarks', (req, res) => {
  res.json(bookmarks);
});

app.get('/bookmark/:id', (req, res) => {
  const { id } = req.params;
  const bookmark = bookmarks.find(b => b.id === parseInt(id));

  if (!bookmark) {
    logger.error(`Bookmark with id ${id} not found.`);
    return res
      .status(404)
      .send('Bookmark Not Found');
  }
  res.json(bookmark);
});



// error handling
// eslint-disable-next-line no-unused-vars
const errorHandler = (error, req, res, next) => {
  let response;
  if (NODE_ENV === 'production') {
    response = {
      error: {
        message: 'Server error'
      }
    };
  } else {
    response = {
      message: error.message,
      error
    };
  }

  res.status(500).json(response);
};

app.use(errorHandler);


// the bottom line, literally

const bookmarks = [{
  id: 1,
  title: 'Random Title',
  rating: 5
}];






module.exports = app;