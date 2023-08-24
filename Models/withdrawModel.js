const mongoose = require('mongoose')

const WithdrawModel = new mongoose.Schema({
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
  account_holder_name: {
    type: String,
  },
  account_number: {
    type: String,
  },
  createdat: {
    type: Date,
    default: Date.now
  }

})

const Withdraw = mongoose.model('withdraw', WithdrawModel)

module.exports = Withdraw