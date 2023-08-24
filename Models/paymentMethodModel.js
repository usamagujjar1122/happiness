const mongoose = require('mongoose')

const paymentMethodModel = new mongoose.Schema({
  recipient_name: {
    type: String
  },
  recipient_account_number: {
    type: String
  },
  method_name: {
    type: String
  },
  createdat: {
    type: Date,
    default: Date.now
  }
})

const PaymentMethod = mongoose.model('paymentmethod', paymentMethodModel)

module.exports = PaymentMethod