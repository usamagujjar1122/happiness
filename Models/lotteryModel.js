const mongoose = require('mongoose')

const lotteryModel = new mongoose.Schema({
  image: {
    type: String
  },
  name: {
    type: String
  },
  description: {
    type: String
  },
  deadline: {
    type: Date
  },
  price: {
    type: Number
  },
  quota: {
    type: Number
  },
  start: {
    type: Number
  },
  end: {
    type: Number
  },
  sold: {
    type: Number,
    default: 0
  },
  list: {
    type: Array,
    default: []
  },
  winners: {
    type: Array,
    default: []
  },
  status: {
    type: String,
  },
  createdat: {
    type: Date,
    default: Date.now
  }
})

const Lottery = mongoose.model('lottery', lotteryModel)

module.exports = Lottery