const mongoose = require('mongoose')

const ticketModel = new mongoose.Schema({
  event: {
    type: mongoose.Types.ObjectId
  },
  user: {
    type: mongoose.Types.ObjectId
  },
  ticket_number: {
    type: String
  },
  createdat: {
    type: Date,
    default: Date.now
  }
})

const Ticket = mongoose.model('ticket', ticketModel)

module.exports = Ticket