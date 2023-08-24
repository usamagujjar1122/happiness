const mongoose = require('mongoose')

const notiModel = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId
  },
  body: {
    type: String
  },
  read: {
    type: Boolean,
    default: false
  },
  createdat: {
    type: Date,
    default: Date.now
  }
})

const Noti = mongoose.model('noti', notiModel)

module.exports = Noti