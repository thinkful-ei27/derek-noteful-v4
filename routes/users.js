'use strict';

const express = require('express');
const mongoose = require('mongoose');

const User = require('../models/user');

const router = express.Router();

router.post('/', (req, res, next) => {
  const { fullName, username, password } = req.body;

  if (!username) {
    const err = new Error('Missing `username` in request body');
    err.status = 400;
    return next(err);
  }

  if (!password) {
    const err = new Error('Missing `password` in request body');
    err.status = 400;
    return next(err);
  }

  const newUser = { fullName, username, password };

  User.create(newUser)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('Username already exists');
        err.status = 400;
      }
      next(err);
    });
});

module.exports = router;