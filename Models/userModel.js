const mongoose = require('mongoose')

const userModel = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    name: {
        type: String,
    },
    city: {
        type: String,
    },
    phone_number: {
        type: String,
    },
    balance: {
        type: Number,
        default: 0
    },
    otp: {
        type: Number,
        default: 1111,
    },
    phone: {
        type: String,
    },
    createdat: {
        type: Date,
        default: Date.now
    }

})

const User = mongoose.model('Users', userModel)

module.exports = User