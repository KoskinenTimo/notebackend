const Note = require('../models/note');


const initialNotes = [
  {
    _id: '6105c53805ca590364e217c2',
    content: 'Note 1 for testing',
    important: true,
    date: '2021-07-31T21:48:40.100Z',
    user: {
      _id: '6105c3beb6590908e4175456',
      username: 'mattimeika',
      name: 'Matti Meikäläinen'
    },
    __v: 0
  },
  {
    _id: '6105c54405ca590364e217c8',
    content: 'Note 2 for testing',
    important: false,
    date: '2021-07-31T21:48:52.025Z',
    user: {
      _id: '6105c3beb6590908e4175456',
      username: 'mattimeika',
      name: 'Matti Meikäläinen'
    },
    __v: 0
  },
  {
    _id: '6105c54a05ca590364e217ce',
    content: 'Note 3 for testing',
    important: true,
    date: '2021-07-31T21:48:58.967Z',
    user: {
      _id: '6105c3beb6590908e4175456',
      username: 'mattimeika',
      name: 'Matti Meikäläinen'
    },
    __v: 0
  },
  {
    _id: '6105c58305ca590364e217d5',
    content: 'Note 4 for testing',
    important: true,
    date: '2021-07-31T21:49:55.848Z',
    user: {
      _id: '6105c3d0b6590908e417545a',
      username: 'taunotai',
      name: 'Tauno Taitava'
    },
    __v: 0
  },
  {
    _id: '6105c59005ca590364e217db',
    content: 'Note 5 for testing',
    important: false,
    date: '2021-07-31T21:50:08.146Z',
    user: {
      _id: '6105c3d0b6590908e417545a',
      username: 'taunotai',
      name: 'Tauno Taitava'
    },
    __v: 0
  },
  {
    _id: '6105c59305ca590364e217e1',
    content: 'Note 6 for testing',
    important: false,
    date: '2021-07-31T21:50:11.553Z',
    user: {
      _id: '6105c3d0b6590908e417545a',
      username: 'taunotai',
      name: 'Tauno Taitava'
    },
    __v: 0
  },
  {
    _id: '6105c59905ca590364e217e7',
    content: 'Note 7 for testing',
    important: true,
    date: '2021-07-31T21:50:17.464Z',
    user: {
      _id: '6105c3d0b6590908e417545a',
      username: 'taunotai',
      name: 'Tauno Taitava'
    },
    __v: 0
  }
];

const allNotesFromDb = async() => {
  return await Note.find({});
};


module.exports = {
  initialNotes,
  allNotesFromDb
};