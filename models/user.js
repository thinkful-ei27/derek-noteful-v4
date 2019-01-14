'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  fullName: String,
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

schema.set('toJSON', {
  virtuals: true, // include built-in virtual `id`
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
    delete result.password;
  }
});

module.exports = mongoose.model('User', schema);