const mongoose = require('mongoose')

const AdminsModel = new mongoose.Schema({
  email: {
    type: String
  },
  password: {
    type: String
  }

})

const Admins = mongoose.model('admins', AdminsModel)

module.exports = Admins