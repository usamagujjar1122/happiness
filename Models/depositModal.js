const mongoose = require('mongoose')

const depositModel = new mongoose.Schema({
  user: {
    type: mongoose.Types.ObjectId,
    require: true
  },
  status: {
    type: String,
    default: "pending"
  },
  amount: {
    type: Number,
  },
  method: {
    type: String,
  },
  account_number: {
    type: String,
  },
  account_holder_name: {
    type: String,
  },
  createdat: {
    type: Date,
    default: Date.now()
  }

})

const Deposit = mongoose.model('deposit', depositModel)

module.exports = Deposit