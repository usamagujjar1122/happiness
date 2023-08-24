const dotenv = require('dotenv')
dotenv.config()
const nodemailer = require('nodemailer')


exports.transporter = nodemailer.createTransport({
    service:"gmail",
    host:"smtp.gmail.com",
    port: 587,
    secure: false,// true for 465 , false for other ports 
    auth: {
        user: process.env.EMAIL,
        pass: process.env.PASSWORD
    }    
})
