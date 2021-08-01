const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const api = supertest(app);
const User = require('../models/user');
const Note = require('../models/note');
const { initialUsers } = require('./helper_node_api_users');
const { initialNotes } = require('./helper_node_api_notes');


describe('users controller /api/users', () => {

  beforeAll(async() => {
    await User.deleteMany({});
    await User.insertMany(initialUsers);
    await Note.deleteMany({});
    await Note.insertMany(initialNotes);
  });

  describe('GET all', () => {

    test('returns data in correct form', async() => {
      const res = await api
        .get('/api/users')
        .expect(200)
        .expect('Content-Type', /json/);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body).toHaveLength(initialUsers.length);
    });
  });

  describe('POST one', () => {

  });
});

afterAll(() => {
  mongoose.connection.close();
});