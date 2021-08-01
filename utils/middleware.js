/* eslint-disable no-unused-vars */
const logger = require('./logger');
const User = require('../models/user');
const jwt = require('jsonwebtoken');

const requestLogger = (request, response, next) => {
  logger.info('Method:', request.method);
  logger.info('Path:  ', request.path);
  logger.info('Body:  ', request.body);
  logger.info('---');
  next();
};

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' });
};

const authenticateToken = async(req,res,next) => {
  const authToken = req.get('authorization');
  if (authToken && authToken.toLowerCase().startsWith('bearer ')) {
    try {
      const user = jwt.verify(authToken.substring(7), process.env.SECRET);
      req.currentUser = user;
    } catch (e) {
      res.status(401).json({ error: 'Access denied' });
    }
  } else {
    res.status(401).json({ error: 'Authorization token missing, please log in' });
  }
  next();
};

const errorHandler = (error, request, response, next) => {
  logger.error(error.message);

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' });
  } else if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  } else if (error.name === 'JsonWebTokenError') {
    return response.status(401).json({
      error: 'invalid token'
    });
  } else if (error.name === 'TokenExpiredError') {
    return response.status(401).json({
      error: 'token expired'
    });
  }

  next(error);
};

module.exports = {
  requestLogger,
  unknownEndpoint,
  errorHandler,
  authenticateToken
};