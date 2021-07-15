const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('give password as argument')
  process.exit(1)
}

const password = process.argv[2]

const url =`mongodb+srv://timokoskinen:${password}@cluster0.mnkgc.mongodb.net/fs2021-notes?retryWrites=true&w=majority`

mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, useCreateIndex: true })

const noteSchema = new mongoose.Schema({
  content: String,
  date: Date,
  important: Boolean,
})

const Note = mongoose.model('Note', noteSchema)

if (process.argv.length === 3) {

  Note.find({})
    .then(result => {
      console.log("Notes:");
      result.forEach(record => {
        console.log(`${record.content} ${record.important}`);
      })
      mongoose.connection.close();
    })
} else {
  const content = process.argv[3];
  const date = new Date();
  const important = process.argv[4];
  const note = new Note({
    content: content,
    date: date,
    important: important,
  })
  
  note.save().then(response => {
    console.log(`Added note ${content}`)
    mongoose.connection.close()
  })
}

