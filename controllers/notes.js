/* eslint-disable no-unused-vars */
const notesRouter = require('express').Router();
const Note = require('../models/note');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const { authenticateToken } = require('../utils/middleware');
const { createError } = require('../utils/createError');


/**
 * GET all Notes from db
 */
notesRouter.get('/', async(req,res,next) => {
  const notes = await Note
    .find({})
    .populate('user', { username: 1, name: 1 });
  res.json(notes.map(note => note.toJSON()));
});

/**
 * POST one Note to db
 */
notesRouter.post('/', authenticateToken, async(req,res,next) => {
  const { currentUser,body } = req;
  const note = new Note({
    content: body.content,
    important: body.important === undefined ? false : body.important,
    date: new Date(),
    user: currentUser.id
  });
  const savedNote = await note.save();
  const user = await User.findById(currentUser.id);
  user.notes = user.notes.concat(savedNote._id);
  await user.save();

  res.status(201).json(savedNote.toJSON());
});

/**
 * GET one Note from db
 */
notesRouter.get('/:id', async(req,res,next) => {
  const note = await Note
    .findById(req.params.id)
    .populate('user', { username: 1, name: 1 });
  if (note) {
    res.json(note.toJSON());
  } else {
    res.status(404).end();
  }
});

/**
 * DELETE one Note from db
 */
notesRouter.delete('/:id', authenticateToken, async(req,res,next) => {
  const note = await Note.findById(req.params.id);
  if (!note) {
    res.status(404).json({ error: 'Not found' });
  }
  if (req.currentUser.id === note.user.toString()) {
    await Note.findByIdAndRemove(req.params.id);
    res.status(204).end();
  } else {
    next(createError(401,'Not the note creator, access denied'));
  }
});

/**
 * UPDATE one Note in db
 */
notesRouter.put('/:id', authenticateToken, async(req,res,next) => {
  const note = await Note.findById(req.params.id);
  if (!note) {
    res.status(404).json({ error: 'Not found' });
  }
  if (req.currentUser.id === note.user.toString()) {
    const id = req.params.id;
    const { content,important } = req.body;
    const newNote = {
      content: content,
      important: important
    };
    const updatedNote = await Note.findByIdAndUpdate(id, newNote, { new: true });
    res.status(201).json(updatedNote);
  } else {
    next(createError(401,'Not the note creator, access denied'));
  }

});


module.exports = notesRouter;