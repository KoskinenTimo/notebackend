const supertest = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const api = supertest(app);
const User = require('../models/user');
const Note = require('../models/note');
const { initialUsers } = require('./helper_node_api_users');
const { initialNotes } = require('./helper_node_api_notes');


describe('login controller /api/login', () => {

  beforeAll(async() => {
    await User.deleteMany({});
    await User.insertMany(initialUsers);
    await Note.deleteMany({});
    await Note.insertMany(initialNotes);
  });

  test('successful login with valid credentials', async() => {
    const res = await api
      .post('/api/login')
      .send({
        username: initialUsers[0].username,
        password: 'password1'
      })
      .expect(200)
      .expect('Content-Type', /json/);

    expect(res.body.token).toBeDefined();
    expect(res.body.username).toEqual(initialUsers[0].username);
    expect(res.body.name).toEqual(initialUsers[0].name);
  });

  test('unsuccessful login with invalid username', async() => {
    const res = await api
      .post('/api/login')
      .send({
        username: 'badusername',
        password: 'password'
      })
      .expect(401);
    expect(res.body.error).toEqual('invalid username or password');
  });

  test('unsuccessful login with invalid password', async() => {
    const res = await api
      .post('/api/login')
      .send({
        username: initialUsers[0].username,
        password: 'badpassword'
      })
      .expect(401);
    expect(res.body.error).toEqual('invalid username or password');
  });
});

afterAll(() => {
  mongoose.connection.close();
});