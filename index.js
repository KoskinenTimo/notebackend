require('dotenv').config()
const express = require('express')
const app = express()
const cors = require('cors')
const Note = require('./models/note');

app.use(express.static('build'))
app.use(cors())
app.use(express.json())

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

app.use(requestLogger)


app.get('/api/notes', (req,res) => {
  Note.find({}).then(notes => {
    res.json(notes)
  })
})

app.post('/api/notes', (request, response, next) => {
  const body = request.body

  const note = new Note({
    content: body.content,
    important: body.important || false,
    date: new Date(),
  })

  note.save()
    .then(savedNote => savedNote.toJSON())
    .then(formattedNote => {
      response.json(formattedNote);
    })
    .catch(err => next(err))
})

app.get('/api/notes/:id', (request, response, next) => {
  Note.findById(request.params.id)
    .then(note => {
      if (note) {
        response.json(note)
      } else {
        response.status(404).end();
      }
      
    })
    .catch(err => next(err));
})

app.delete('/api/notes/:id', (request, response) => {
  const id = request.params.id;
  Note.findByIdAndRemove(id)
    .then(result => {
      response.status(204).end();
    })
    .catch(err => next(err));
})

app.put('/api/notes/:id', (request,response) => {
  const id = request.params.id;
  const { body } = request;
  const note = {
    content: body.content,
    important: body.important
  }

  Note.findByIdAndUpdate(id, note, { new: true })
    .then(updatedNote => {
      response.json(updatedNote);
    })
    .catch(err => next(err));
})

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.log(error.message);
  if (error.name === "CastError") {;
    return response.status(400).send({ error: 'malformatted id' })
  } else if (error.name === "ValidationError") {
    return response.status(400).json({ error: error.message });
  }
  next(error)  
}

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})