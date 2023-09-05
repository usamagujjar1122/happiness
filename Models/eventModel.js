const mongoose = require('mongoose')

const eventModel = new mongoose.Schema({
  name: {
    type: String,
  },
  description: {
    type: String,
  },
  price: {
    type: Number,
  },
  quota: {
    type: Number,
  },
  deadline: {
    type: Number,
  },
  starts_at: {
    type: Number,
  },
  image: {
    type: String,
  },
  sold: {
    type: Number,
    default: 0
  },
  fake_participants: {
    type: Number,
    default: 0
  },
  sold_list: {
    type: Array,
    default: []
  },
  winners: {
    type: Array,
    default: []
  },
  createdat: {
    type: Date,
    default: Date.now
  }

})

const Event = mongoose.model('event', eventModel)

module.exports = Event