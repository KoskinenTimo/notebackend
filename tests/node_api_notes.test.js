const mongoose = require('mongoose');
const supertest = require('supertest');
const app = require('../app');
const api = supertest(app);
const Note = require('../models/note');
const User = require('../models/user');
const { initialNotes,allNotesFromDb } = require('./helper_node_api_notes');
const { initialUsers } = require('./helper_node_api_users');

const loginUser = async(loginDetails) => {
  const res = await api
    .post('/api/login')
    .send(loginDetails)
    .expect(200);
  return res.body;
};

describe('notes controller /api/notes', () => {

  beforeEach(async() => {
    await User.deleteMany({});
    await User.insertMany(initialUsers);
    await Note.deleteMany({});
    await Note.insertMany(initialNotes);
  });

  describe('GET all', () => {

    test('returns an array same length as initial array', async() => {
      const res = await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/);
      expect(res.body).toBeInstanceOf(Array);
      expect(res.body).toHaveLength(initialNotes.length);
    });

    test('populates notes array with user details', async() => {
      const res = await api
        .get('/api/notes')
        .expect(200)
        .expect('Content-Type', /application\/json/);
      expect(res.body[0].user).toHaveProperty('username');
    });
  });

  describe('GET one', () => {

    test('return data in correct form', async() => {
      const testNoteId = initialNotes[0]._id;
      const res = await api
        .get(`/api/notes/${testNoteId}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      expect(res.body).toBeInstanceOf(Object);
      expect(res.body.content).toEqual(initialNotes[0].content);
    });

    test('populates note with user details', async() => {
      const testNoteId = initialNotes[0]._id;
      const res = await api
        .get(`/api/notes/${testNoteId}`)
        .expect(200)
        .expect('Content-Type', /application\/json/);
      expect(res.body.user).toHaveProperty('username');
    });

    test('return 404 status with a note id that does not exist', async() => {
      const testNoteId = '6105c53805ca590364e217c3';
      await api
        .get(`/api/notes/${testNoteId}`)
        .expect(404);
    });

    test('return 400 status with a note id that is malformatted', async() => {
      const testNoteId = '6105c53805ca590364e217c';
      const res = await api
        .get(`/api/notes/${testNoteId}`)
        .expect(400);
      expect(res.body.error).toEqual('malformatted id');
    });
  });

  describe('POST one', () => {

    test('return 201 status and data with valid credentials and note', async() => {
      const note = {
        content: 'Note 10 for testing',
        important: true
      };
      const loginDetails = {
        username: initialUsers[0].username,
        password: 'password1'
      };
      const credentials = await loginUser(loginDetails);
      const res = await api
        .post('/api/notes')
        .send(note)
        .set({ Authorization: `Bearer ${credentials.token}` })
        .expect(201);
      expect(res.body.content).toEqual(note.content);
      const notesInDbInTheEnd = await allNotesFromDb();
      expect(notesInDbInTheEnd.map(note => note.content))
        .toContain(note.content);
    });

    test('return 401 status with missing or invalid auth token', async() => {
      const note = {
        content: 'Note 10 for testing',
        important: true
      };
      const loginDetails = {
        username: initialUsers[0].username,
        password: 'password1'
      };
      const credentials = await loginUser(loginDetails);
      const res1 = await api
        .post('/api/notes')
        .send(note)
        .set('Authorization', `${credentials.token}`)
        .expect(401);
      expect(res1.body.error).toEqual('Authorization token missing, please log in');
      const res2 = await api
        .post('/api/notes')
        .send(note)
        .expect(401);
      expect(res2.body.error).toEqual('Authorization token missing, please log in');
    });

    test('return 400 status if content is missing', async() => {
      const note = {
        important: true
      };
      const loginDetails = {
        username: initialUsers[0].username,
        password: 'password1'
      };
      const credentials = await loginUser(loginDetails);
      const res = await api
        .post('/api/notes')
        .send(note)
        .set({ Authorization: `Bearer ${credentials.token}` })
        .expect(400);
      expect(res.body.error).toContain('Content is required');
    });

    test('return 400 status if content is less than 5 characters', async() => {
      const note = {
        content: 'aaaa',
        important: true
      };
      const loginDetails = {
        username: initialUsers[0].username,
        password: 'password1'
      };
      const credentials = await loginUser(loginDetails);
      const res = await api
        .post('/api/notes')
        .send(note)
        .set({ Authorization: `Bearer ${credentials.token}` })
        .expect(400);
      expect(res.body.error).toContain('Content must be atleast 5 characters');
    });
  });

  describe('DELETE one', () => {
    beforeEach(async() => {
      await User.deleteMany({});
      await User.insertMany(initialUsers);
      await Note.deleteMany({});
      await Note.insertMany(initialNotes);
    });

    test('return 204 status and note removed from db', async() => {
      const noteIdToBeRemoved = initialNotes[0]._id;
      const loginDetails = {
        username: initialUsers[0].username,
        password: 'password1'
      };
      const credentials = await loginUser(loginDetails);
      await api
        .delete(`/api/notes/${noteIdToBeRemoved}`)
        .set('Authorization', `Bearer ${credentials.token}`)
        .expect(204);
      const notesInDbInTheEnd = await allNotesFromDb();
      expect(notesInDbInTheEnd.map(note => note.id)).not.toContain(noteIdToBeRemoved);
    });

    test('return 401 status if user is not the owner of the note', async() => {
      const noteIdToBeRemoved = initialNotes[0]._id;
      const loginDetails = {
        username: initialUsers[1].username,
        password: 'password2'
      };
      const credentials = await loginUser(loginDetails);
      await api
        .delete(`/api/notes/${noteIdToBeRemoved}`)
        .set('Authorization', `Bearer ${credentials.token}`)
        .expect(401);
    });

    test('return 404 status if a note is not found with the id', async() => {
      const noteIdToBeRemoved = initialNotes[0]._id;
      const loginDetails = {
        username: initialUsers[0].username,
        password: 'password1'
      };
      const credentials = await loginUser(loginDetails);
      await api
        .delete(`/api/notes/${noteIdToBeRemoved}`)
        .set('Authorization', `Bearer ${credentials.token}`)
        .expect(204);
      const res = await api
        .delete(`/api/notes/${noteIdToBeRemoved}`)
        .set('Authorization', `Bearer ${credentials.token}`)
        .expect(404);
      expect(res.body.error).toEqual('Not found');
    });
  });

  describe('UPDATE one', () => {

    test('return 201 status and updated note data', async() => {
      const noteIdToBeUpdated = initialNotes[0]._id;
      const loginDetails = {
        username: initialUsers[0].username,
        password: 'password1'
      };
      const updateDetails = {
        content: 'This note was UPDATED'
      };
      const credentials = await loginUser(loginDetails);
      const res = await api
        .put(`/api/notes/${noteIdToBeUpdated}`)
        .send(updateDetails)
        .set('Authorization', `Bearer ${credentials.token}`)
        .expect(201)
        .expect('Content-Type', /application\/json/);
      expect(res.body.content).toEqual(updateDetails.content);
      const updatedNoteInDb = await Note.findById(noteIdToBeUpdated);
      expect(updatedNoteInDb.content).toEqual(updateDetails.content);
    });

    test('return 401 status if user is not the creater of the note', async() => {
      const noteIdToBeUpdated = initialNotes[0]._id;
      const loginDetails = {
        username: initialUsers[1].username,
        password: 'password2'
      };
      const updateDetails = {
        content: 'This note was UPDATED'
      };
      const credentials = await loginUser(loginDetails);
      await api
        .put(`/api/notes/${noteIdToBeUpdated}`)
        .send(updateDetails)
        .set('Authorization', `Bearer ${credentials.token}`)
        .expect(401);
    });

    test('return 404 status if the note does not exist', async() => {
      const noteIdToBeUpdated = initialNotes[0]._id;
      const loginDetails = {
        username: initialUsers[1].username,
        password: 'password2'
      };
      const updateDetails = {
        content: 'This note was UPDATED'
      };
      const credentials = await loginUser(loginDetails);
      await Note.findByIdAndRemove(noteIdToBeUpdated);
      const res = await api
        .put(`/api/notes/${noteIdToBeUpdated}`)
        .send(updateDetails)
        .set('Authorization', `Bearer ${credentials.token}`)
        .expect(404);
      expect(res.body.error).toEqual('Not found');
    });
  });
});

afterAll(() => {
  mongoose.connection.close();
});