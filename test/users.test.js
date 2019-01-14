'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');
const express = require('express');
const sinon = require('sinon');

const app = require('../server');
const User = require('../models/user');
const { users } = require('../db/data');
const { TEST_MONGODB_URI } = require('../config');

chai.use(chaiHttp);
const expect = chai.expect;
const sandbox = sinon.createSandbox();

describe('Noteful API - Users', function () {

  before(function () {
    return mongoose.connect(TEST_MONGODB_URI, { useNewUrlParser: true, useCreateIndex: true })
      .then(() => Promise.all([
        User.deleteMany()
      ]));
  });

  beforeEach(function () {
    return Promise.all([
      User.insertMany(users)
    ]);
  });

  afterEach(function () {
    sandbox.restore();
    return Promise.all([
      User.deleteMany()
    ]);
  });

  after(function () {
    return mongoose.disconnect();
  });

  describe('POST /api/users', function () {
    it('should create and return a new user when provided valid username, password, and fullName', function () {
      const newUser = {
        fullName: 'Test User',
        username: 'testuser',
        password: 'password'
      };
      let res;
      return chai.request(app)
        .post('/api/users')
        .send(newUser)
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('id', 'fullName', 'username');
          return User.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.fullName).to.equal(data.fullName);
          expect(res.body.username).to.equal(data.username);
        });
    });

    it('should create and return a new user when provided valid username and password (fullName optional)', function () {
      const newUser = {
        username: 'testuser',
        password: 'password'
      };
      let res;
      return chai.request(app)
        .post('/api/users')
        .send(newUser)
        .then(_res => {
          res = _res;
          expect(res).to.have.status(201);
          expect(res).to.have.header('location');
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body).to.have.all.keys('id', 'username');
          return User.findById(res.body.id);
        })
        .then(data => {
          expect(res.body.id).to.equal(data.id);
          expect(res.body.username).to.equal(data.username);
        });
    });

    it('should return an error when missing "username" field', function () {
      const newUser = {
        password: 'password'
      };
      return chai.request(app)
        .post('/api/users')
        .send(newUser)
        .then(res => {
          expect(res).to.have.status(422);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing \'username\' in request body');
        });
    });

    it('should return an error when missing "password" field', function () {
      const newUser = {
        username: 'testuser'
      };
      return chai.request(app)
        .post('/api/users')
        .send(newUser)
        .then(res => {
          expect(res).to.have.status(422);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Missing \'password\' in request body');
        });
    });

    it('should return an error when "username" is not a string', function () {
      const newUser = {
        username: 12345,
        password: 'password'
      };
      return chai.request(app)
        .post('/api/users')
        .send(newUser)
        .then(res => {
          expect(res).to.have.status(422);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.code).to.equal(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Incorrect field type: expected string');
          expect(res.body.location).to.equal('username');
        });
    });

    it('should return an error when "password" is not a string', function () {
      const newUser = {
        username: 'testuser',
        password: 12345
      };
      return chai.request(app)
        .post('/api/users')
        .send(newUser)
        .then(res => {
          expect(res).to.have.status(422);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.code).to.equal(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Incorrect field type: expected string');
          expect(res.body.location).to.equal('password');
        }); 
    });

    it('should return an error when "fullName" is not a string', function () {
      const newUser = {
        username: 'testuser',
        password: 'password',
        fullName: 12345 
      };
      return chai.request(app)
        .post('/api/users')
        .send(newUser)
        .then(res => {
          expect(res).to.have.status(422);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.code).to.equal(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Incorrect field type: expected string');
          expect(res.body.location).to.equal('fullName');
        }); 
    });

    it('should return an error when "username" has leading or trailing whitespace', function () {
      const newUser = {
        username: '   testuser   ',
        password: 'password'
      };
      return chai.request(app)
        .post('/api/users')
        .send(newUser)
        .then(res => {
          expect(res).to.have.status(422);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.code).to.equal(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Cannot start or end with whitespace');
          expect(res.body.location).to.equal('username');
        }); 
    });

    it('should return an error when "password" has leading or trailing whitespace', function () {
      const newUser = {
        username: 'testuser',
        password: '   password   '
      };
      return chai.request(app)
        .post('/api/users')
        .send(newUser)
        .then(res => {
          expect(res).to.have.status(422);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.code).to.equal(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Cannot start or end with whitespace');
          expect(res.body.location).to.equal('password');
        }); 
    });

    it('should return an error when "username" is less than one character', function () {
      const newUser = {
        username: '',
        password: 'password'
      };
      return chai.request(app)
        .post('/api/users')
        .send(newUser)
        .then(res => {
          expect(res).to.have.status(422);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.code).to.equal(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Must be at least 1 characters long');
          expect(res.body.location).to.equal('username');
        });
    });

    it('should return an error when "password" is less than eight characters', function () {
      const newUser = {
        username: 'testuser',
        password: '1234567'
      };
      return chai.request(app)
        .post('/api/users')
        .send(newUser)
        .then(res => {
          expect(res).to.have.status(422);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.code).to.equal(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Must be at least 8 characters long');
          expect(res.body.location).to.equal('password');
        });
    });

    it('should return an error when "password" is greater than seventy-two characters', function () {
      const newUser = {
        username: 'testuser',
        password: 'a'.repeat(73)
      };
      return chai.request(app)
        .post('/api/users')
        .send(newUser)
        .then(res => {
          expect(res).to.have.status(422);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.code).to.equal(422);
          expect(res.body.reason).to.equal('ValidationError');
          expect(res.body.message).to.equal('Must be at most 72 characters long');
          expect(res.body.location).to.equal('password');
        });
    });

    it('should return an error when given a duplicate username', function () {
      return User.findOne()
        .then(data => {
          const newUser = {
            username: data.username,
            password: 'password'
          };
          return chai.request(app).post('/api/users').send(newUser);
        })
        .then(res => {
          expect(res).to.have.status(400);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Username already exists');
        });
    });

    it('should catch errors and respond properly', function () {
      sandbox.stub(User.schema.options.toJSON, 'transform').throws('FakeError');

      const newUser = {
        fullName: 'Test User',
        username: 'testuser',
        password: 'password'
      };

      return chai.request(app)
        .post('/api/users')
        .send(newUser)
        .then(res => {
          expect(res).to.have.status(500);
          expect(res).to.be.json;
          expect(res.body).to.be.a('object');
          expect(res.body.message).to.equal('Internal Server Error');
        });
    });
  });
});