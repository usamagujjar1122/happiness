const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const jwt_decode = require("jwt-decode");
const helper = require('../utils/helper');
const Stripe = require('stripe');
const Deposit = require("../Models/depositModal");
const withdraw = require("../Models/withdrawModel");
const Withdraw = require("../Models/withdrawModel");
const Event = require("../Models/eventModel");
const Ticket = require("../Models/ticketModel");
const Noti = require("../Models/notificationModel");
const PaymentMethod = require("../Models/paymentMethodModel");
const Admins = require("../Models/admins");
var transporter = nodemailer.createTransport({
  host: "gmail",
  port: 587,
  secure: false,// true for 465 , false for other ports 
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD
  },

})
exports.test = async (req, res) => {
  try {
    await helper.sendNotification(
      'fC3WUffxSHmclpiTNOzIXF:APA91bFWubHkbzQLyQLCIzsfrk_-01Jnhv88L4xANfP4Js3HKK6bSNo8F-6SxnTWdjGSSgCe_BDlbm6rXn8IwA8FdaQx7WgrESMO-fsvo9iPiIRa7RikBQhxPsxLEkz8wGkLjjTkEJNn',
      {
        title: "New QR codes generated",
        body: `${req.body.bagsCount} new bags have been successfully generated for you.`,
      }
    );
    return res.status(200).json({ success: true, })

  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, })

  }
}
exports.signup = async (req, res) => {
  try {
    const { name, email, password, phone, agree, city } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Full Name" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Email" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Password" });
    }
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Plase Enter Phone Number" });
    }
    if (!email.includes('@')) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter valid Email" });
    }
    if (password.length < 8) {
      return res
        .status(400)
        .json({ success: false, message: "Password must have 8 characters" });
    }
    if (!agree) {
      return res
        .status(400)
        .json({ success: false, message: "Please agree to the terms and conditions" });
    }
    const fuser = await User.findOne({ email: email });
    if (fuser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered please login to continue",
      });
    }
    const p = await bcrypt.hash(password, 12);
    // const stripe_customer_id = await helper.createStripeCustomer(email);
    const user = new User({ name, email, phone, password: p, otp: helper.generateOTP(), city });
    await user.save();
    const token = jwt.sign({ _id: user._id }, "JWT_SECRET");

    return res.status(200).json({
      success: true,
      message: "Account Created Successfully",
      data: { token },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.admin_login = async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await Admins.findOne({
      email, password
    })
    if (user) {
      return res.status(200).json({ success: true })
    } else {
      return res.status(400).json({ success: false });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}
exports.create_admin = async (req, res) => {
  try {
    const { email, password, key } = req.body
    if (key !== "LoraBC") {
      return res
        .status(400)
        .json({ success: false, message: "Un-Authorized" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter email" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Please enter password" });
    }
    const user = await Admins.findOne({
      email
    })
    if (user) {
      return res.status(400).json({ success: false, message: 'User Pre-Exists' })
    } else {
      const user = new Admins({ email, password })
      await user.save()
      return res.status(200).json({ success: true, message: 'User creater' });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password, fcm } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Email" });
    }
    if (!password) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Password" });
    }
    const user = await User.findOne({ email: email });
    if (user) {
      const compare = await bcrypt.compare(password, user.password);
      if (compare) {
        const token = jwt.sign({ _id: user._id }, "JWT_SECRET");
        const events = await Event.aggregate([
          {
            $lookup: {
              from: 'tickets',
              localField: 'sold_list',
              foreignField: 'ticket_number',
              as: 'tickets',
              pipeline: [
                { $match: { user: user._id } }
              ]
            }
          }
        ])
        const deposits = await Deposit.find({ user: user._id })
        const withdraws = await Withdraw.find({ user: user._id })
        const notifications = await Noti.find({ user: user._id })
        const unread = await Noti.findOne({ user: user._id, read: false })
        const payment_methods = await PaymentMethod.find()
        let noti_status = false
        if (unread) {
          noti_status = true
        }
        user.fcm = fcm
        await user.save()
        return res
          .status(200)
          .json({ success: true, message: "Login Success", user, token, deposits, withdraws, events, notifications, noti_status, payment_methods });
      } else {
        return res
          .status(400)
          .json({ success: false, message: "Invalid Crediantials" });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: "Not a registered user",
      });
    }
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message });
  }

};

exports.loaduser = async (req, res) => {
  const { token, fcm } = req.headers;
  if (token) {
    var data = jwt_decode(token);
    try {
      const docs = await User.findById(data._id)
      if (docs) {
        const events = await Event.aggregate([
          {
            $lookup: {
              from: 'tickets',
              localField: 'sold_list',
              foreignField: 'ticket_number',
              as: 'tickets',
              pipeline: [
                { $match: { user: docs._id } }
              ]
            }
          }
        ])
        const deposits = await Deposit.find({ user: data._id })
        const withdraws = await Withdraw.find({ user: data._id })
        const notifications = await Noti.find({ user: data._id })
        const unread = await Noti.findOne({ user: data._id, read: false })
        const payment_methods = await PaymentMethod.find()
        let noti_status = false
        if (unread) {
          noti_status = true
        }
        docs.fcm = fcm
        await docs.save()
        if (docs) {
          res.status(200).json({ success: true, user: docs, token: token, deposits, withdraws, events, notifications, noti_status, payment_methods })
        } else {
          res.status(400).json({ success: false })
        }
      } else {
        res.status(400).json({ success: false, message: "failed to get user" })
      }
    } catch (error) {
      console.log(error)
      res.send({ success: false, message: "failed to get user" })
    }
  }
  else {
    res.status(400).json({ success: false, message: "failed to get user" })
  }
};

exports.forgot_step_1 = async (req, res) => {
  const { email } = req.body;
  try {
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Email" });
    }
    const docs = await User.findOne({ email: email })
    if (docs) {
      const otp = helper.generateOTP()
      // transporter.sendMail({
      //   from: process.env.EMAIL,
      //   to: email,
      //   subject: "Flatbot Reset Password",
      //   html: `
      //   <div style="font-family: Helvetica,Arial,sans-serif;min-width:1000px;overflow:auto;line-height:2">
      //   <div style="margin:50px auto;width:70%;padding:20px 0">
      //     <div style="border-bottom:1px solid #eee">
      //       <a href="" style="font-size:1.4em;color: #00466a;text-decoration:none;font-weight:600">Flatot</a>
      //     </div>
      //     <p style="font-size:1.1em">Hi,</p>
      //     <p>Thank you for choosing Flatot. Use the following OTP to reset your password.</p>
      //     <h2 style="background: #00466a;margin: 0 auto;width: max-content;padding: 0 10px;color: #fff;border-radius: 4px;">${otp}</h2>
      //     <p style="font-size:0.9em;">Regards,<br />Flatot</p>
      //     <hr style="border:none;border-top:1px solid #eee" />
      //     <div style="float:right;padding:8px 0;color:#aaa;font-size:0.8em;line-height:1;font-weight:300">
      //       <p>Flatot Inc</p>
      //       <p>1600 Amphitheatre Parkway</p>
      //       <p>California</p>
      //     </div>
      //   </div>
      // </div>
      //       `
      // })
      docs.otp = otp
      docs.save()
      res.status(200).json({ success: true, message: 'OTP sent to email address' })
    } else {
      res.status(400).json({ success: false, message: 'Email not registered' })
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.forgot_step_2 = async (req, res) => {
  const { email, otp } = req.body;
  try {
    const matched = await User.findOne({ email: email, otp: otp })
    if (matched) {
      res.status(200).json({ success: true, message: "OTP matched" })
    } else {
      return res.status(400).json({ success: false, message: "OTP match failed" });
    }
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.forgot_step_3 = async (req, res) => {
  const { email, password, confirm_password } = req.body;
  try {
    if (password !== confirm_password) {
      return res
        .status(400)
        .json({ success: false, message: "Password match failed" });
    }
    const p = await bcrypt.hash(password, 12);
    await User.findOneAndUpdate({ email: email }, { password: p })
    res.status(200).json({ success: true, message: "Password reset" })
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

exports.edit_profile_1 = async (req, res) => {
  const token = req.headers.token;
  const { full_name, occupation, monthly_income, age, any_pets } = req.body;
  if (token) {
    try {
      var data = jwt_decode(token);
      const user = await User.findById(data._id)
      if (user) {
        user.full_name = full_name
        user.occupation = occupation
        user.monthly_income = monthly_income
        user.age = age
        user.any_pets = any_pets
        await user.save()
        return res.status(200).json({ success: true, data: user })
      }
      else {
        return res.status(400).json({ success: false, message: 'Invalid Attempt' });
      }
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  } else {
    return res.status(400).json({ success: false, message: 'Invalid Attempt' });
  }
};

exports.edit_profile_2 = async (req, res) => {
  const token = req.headers.token;
  const { previous_rental_history_and_reference, hobbies_and_interests, credit_score, smoking_status } = req.body;
  if (token) {
    try {
      var data = jwt_decode(token);
      const user = await User.findById(data._id)
      if (user) {
        user.previous_rental_history_and_reference = previous_rental_history_and_reference
        user.hobbies_and_interests = hobbies_and_interests
        user.credit_score = credit_score
        user.smoking_status = smoking_status
        await user.save()
        return res.status(200).json({ success: true, data: user })
      }
      else {
        return res.status(400).json({ success: false, message: 'Invalid Attempt' });
      }
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  } else {
    return res.status(400).json({ success: false, message: 'Invalid Attempt' });
  }
};

exports.edit_profile_3 = async (req, res) => {
  const token = req.headers.token;
  const { rental_duration, number_of_people_to_be_shared_with, cleaning_habits, prefered_quiet_hours, working_hours } = req.body;
  if (token) {
    try {
      var data = jwt_decode(token);
      const user = await User.findById(data._id)
      if (user) {
        user.rental_duration = rental_duration
        user.number_of_people_to_be_shared_with = number_of_people_to_be_shared_with
        user.cleaning_habits = cleaning_habits
        user.prefered_quiet_hours = prefered_quiet_hours
        user.working_hours = working_hours
        await user.save()
        return res.status(200).json({ success: true, data: user, message: 'Information Saved' })
      }
      else {
        return res.status(400).json({ success: false, message: 'Invalid Attempt' });
      }
    } catch (error) {
      return res.status(400).json({ success: false, message: error.message });
    }
  } else {
    return res.status(400).json({ success: false, message: 'Invalid Attempt' });
  }
};
exports.save_listing = async (req, res) => {
  const data = req.body.data
  const token = req.headers.token
  var decoded = jwt_decode(token);
  const user = await User.findById(decoded._id)
  if (user) {
    try {

    } catch (error) {
      console.log(error)
      return res.status(400).json({ success: false, message: error.message });
    }
  } else {
    return res.status(400).json({ success: false, message: 'Invalid Attempt' });
  }
}





exports.payment = async (req, res) => {
  const token = req.headers.token
  var decoded = jwt_decode(token);
  const user = await User.findById(decoded._id)
  if (user) {
    const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          // Provide the exact Price ID (for example, pr_1234) of the product you want to sell
          price: "price_1NKMZJJmdHhkpQiP5DmgjlBh",
          // price: "price_1NLkP0FKy8Ssys2PN1cN5m6n",
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `http://localhost:5000/success/${decoded._id}`,
      cancel_url: `http://localhost:5000/failure/${decoded._id}`,
    });

    res.send({ url: session.url });
  } else {
    return res.status(400).json({ success: false, message: 'Invalid Attempt' });
  }
};


exports.deposit_request = async (req, res) => {
  try {
    const token = req.headers.token
    var decoded = jwt_decode(token);
    const user = await User.findById(decoded._id)
    if (!user) {
      return res.status(400).json({ success: false, message: 'Un-Authorized Attempt' })
    }
    const { amount, account_holder_name, account_number, method } = req.body
    if (amount === 0) {
      return res.status(400).json({ success: false, message: 'Minumum deposit amount in Pkr 1' })
    }
    if (!account_holder_name) {
      return res.status(400).json({ success: false, message: 'Account Holder Name is required' })
    }
    if (!account_number) {
      return res.status(400).json({ success: false, message: 'Account Number is required' })
    }
    if (!method) {
      return res.status(400).json({ success: false, message: 'Deposit method is required' })
    }
    const pre = await Deposit.findOne({ user: user._id, status: 'pending' })
    if (pre) {
      return res.status(400).json({ success: false, message: 'You have a pending deposit request' })
    }
    const deposit = new Deposit({ user })
    deposit.amount = amount
    deposit.account_holder_name = account_holder_name
    deposit.account_number = account_number
    deposit.method = method
    deposit.save()

    const noti = new Noti({ user, body: "Deposit request sent. Please wait for approval." })
    await noti.save()
    return res.status(200).json({ success: true, message: 'Deposit Request sent', deposit, noti })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: true, message: error.message })
  }
}


exports.withdraw_request = async (req, res) => {
  try {
    const token = req.headers.token
    var decoded = jwt_decode(token);
    const user = await User.findById(decoded._id)
    if (!user) {
      return res.status(400).json({ success: false, message: 'Un-Authorized Attempt' })
    }
    const { amount, account_holder_name, account_number, method } = req.body
    if (amount === 0) {
      return res.status(400).json({ success: false, message: 'Minumum withdraw amount in Pkr 1' })
    }
    if (!account_holder_name) {
      return res.status(400).json({ success: false, message: 'Account Holder Name is required' })
    }
    if (!account_number) {
      return res.status(400).json({ success: false, message: 'Account Number is required' })
    }
    if (!method) {
      return res.status(400).json({ success: false, message: 'Withdraw method is required' })
    }
    const pre = await Withdraw.findOne({ user: user._id, status: 'pending' })
    if (pre) {
      return res.status(400).json({ success: false, message: 'You have a pending withdraw request' })
    }
    const withdraw = new Withdraw({ user })
    withdraw.amount = amount
    withdraw.account_holder_name = account_holder_name
    withdraw.account_number = account_number
    withdraw.method = method
    withdraw.save()
    user.balance = user.balance - amount
    user.save()

    const noti = new Noti({ user, body: "Withdraw request sent. Please wait for approval." })
    await noti.save()
    return res.status(200).json({ success: true, message: 'Withdraw Request sent', withdraw, user, noti })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}

exports.purchase_ticket = async (req, res) => {
  try {
    const token = req.headers.token
    var decoded = jwt_decode(token);
    const user = await User.findById(decoded._id)
    if (!user) {
      return res.status(400).json({ success: false, message: 'Un-Authorized Attempt' })
    }
    const { quantity, id } = req.body
    if (quantity <= 0) {
      return res.status(400).json({ success: false, message: 'Select minimum 1 ticket' })
    }
    const event = await Event.findById(id)
    console.log('event, ', event)
    if (quantity * event.price > user.balance) {
      return res.status(400).json({ success: false, message: 'Insufficent balance' })
    }
    if (quantity > event.quota - event.sold) {
      return res.status(400).json({ success: false, message: `Only ${event.quota - event.sold} tickets left` })
    }

    // 
    // Function to generate a random string of capital letters
    function generateRandomLetters(length) {
      const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
      let result = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        result += letters.charAt(randomIndex);
      }
      return result;
    }

    // Function to generate a random number with a specific number of digits
    function generateRandomNumber(digits) {
      const min = Math.pow(10, digits - 1);
      const max = Math.pow(10, digits) - 1;
      return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    // Function to generate a unique lottery number
    function generateUniqueLotteryNumber(existingNumbers) {
      let lotteryNumber;
      do {
        const letters = generateRandomLetters(3);
        const digits = generateRandomNumber(6);
        lotteryNumber = letters + digits.toString().padStart(6, '0');
      } while (existingNumbers.includes(lotteryNumber));
      return lotteryNumber;
    }

    // Generate unique lottery numbers
    const numberOfLotteryNumbers = quantity;
    // const lotteryNumbers = [];

    for (let i = 0; i < numberOfLotteryNumbers; i++) {
      const newLotteryNumber = generateUniqueLotteryNumber(event.sold_list);
      event.sold_list.push(newLotteryNumber);
      event.sold += 1
      const ticket = new Ticket({ user, event, ticket_number: newLotteryNumber })
      await ticket.save()
    }
    user.balance -= (event.price * quantity)
    await user.save()
    await event.save()
    const events = await Event.aggregate([
      {
        $lookup: {
          from: 'tickets',
          localField: 'sold_list',
          foreignField: 'ticket_number',
          as: 'tickets',
          pipeline: [
            { $match: { user: user._id } }
          ]
        }
      }
    ])
    return res.status(200).json({ success: true, message: 'Tickets Purchased', user, events })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}

exports.noti_del = async (req, res) => {
  try {
    const item = req.body.item
    await Noti.findByIdAndDelete(item._id)
    return res.status(200).json({ success: true, message: 'Notification Deleted', item })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}

exports.noti_read = async (req, res) => {
  try {
    const token = req.headers.token
    var decoded = jwt_decode(token);
    const user = await User.findById(decoded._id)
    if (!user) {
      return res.status(400).json({ success: false, message: 'Un-Authorized Attempt' })
    }
    const notis = await Noti.find({ user, noti_status: false })
    for (let i = 0; i < notis.length; i++) {
      notis[i].read = true;
      await notis[i].save()
    }
    return res.status(200).json({ success: true, message: 'Notification Deleted' })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}




// ADMIN SIDE


exports.admin_get_deposits = async (req, res) => {
  try {
    const deposits = await Deposit.find({ status: 'pending' })
    return res.status(200).json({ success: true, message: 'Deposits list loaded', deposits })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}

exports.approve_deposit = async (req, res) => {
  try {
    const item = req.body.item
    const user = await User.findById(item.user)
    user.balance = user.balance + item.amount
    const deposit = await Deposit.findById(item._id)
    deposit.status = "approved"
    await deposit.save()
    const noti = new Noti({ user: item.user, body: `Deposit of ${item.amount} approved.` })
    await noti.save()
    await user.save()
    await helper.sendNotification(
      user.fcm,
      {
        title: "Deposit approved",
        body: `Rs${item.amount} added to your account balance`,
      }
    );
    return res.status(200).json({ success: true, message: 'Deposit Approved', deposit })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}

exports.reject_deposit = async (req, res) => {
  try {
    const item = req.body.item
    const user = await User.findById(item.user)
    const deposit = await Deposit.findById(item._id)
    deposit.status = "rejected"
    await deposit.save()
    const noti = new Noti({ user: item.user, body: `Deposit of ${item.amount} rejected.` })
    await noti.save()
    await helper.sendNotification(
      user.fcm,
      {
        title: "Deposit rejected",
        body: `Your deposit request for Rs${item.amount} is rejected`,
      }
    );
    return res.status(200).json({ success: true, message: 'Deposit Rejected', deposits })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}


exports.admin_get_withdraws = async (req, res) => {
  try {
    const withdraws = await Withdraw.find({ status: 'pending' })
    return res.status(200).json({ success: true, message: 'Withdraws list loaded', withdraws })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}

exports.approve_withdraw = async (req, res) => {
  try {
    const item = req.body.item
    const user = await User.findById(item.user)
    const withdraw = await Withdraw.findById(item._id)
    withdraw.status = "approved"
    await withdraw.save()
    const noti = new Noti({ user: item.user, body: `Withdraw of ${item.amount} approved.` })
    await noti.save()
    await helper.sendNotification(
      user.fcm,
      {
        title: "Withdraw approved",
        body: `Your withdraw request for Rs${item.amount} is approved`,
      }
    );
    return res.status(200).json({ success: true, message: 'Withdraw Approved', withdraw })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}

exports.reject_withdraw = async (req, res) => {
  try {
    const item = req.body.item
    const withdraw = await Withdraw.findById(item._id)
    withdraw.status = "rejected"
    await withdraw.save()
    const user = await User.findById(item.user)
    user.balance = item.balance
    const noti = new Noti({ user: item.user, body: `Withdraw of ${item.amount} rejected.` })
    await noti.save()
    await user.save()
    await helper.sendNotification(
      user.fcm,
      {
        title: "Withdraw rejected",
        body: `Your withdraw request for Rs${item.amount} is rejected`,
      }
    );
    return res.status(200).json({ success: true, message: 'Withdraw Rejected', withdraw })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}
exports.add_event = async (req, res) => {
  try {
    const { name, description, deadline, starts_at, quota, price, image, fake_participants } = req.body
    const start = new Date(starts_at)
    const end = new Date(deadline)
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Name" });
    }
    if (!description) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter description" });
    }
    if (!deadline) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter deadline" });
    }
    if (!starts_at) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Starting date" });
    }
    if (!price) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Price" });
    }
    if (!quota) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter quota" });
    }
    if (!image) {
      return res
        .status(400)
        .json({ success: false, message: "Please Upload Image" });
    }
    if (!fake_participants || fake_participants <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Valid Number of fake participants" });
    }

    const event = new Event({ name, fake_participants, description, starts_at: start.getTime(), deadline: end.getTime(), quota, price, image, sold: 0, sold_list: [], winners: [] })
    await event.save()
    const users = await User.find()
    for (let i = 0; i < users.length; i++) {
      await helper.sendNotification(
        users[i].fcm,
        {
          title: "New Event added",
          body: `${event.name} is added to event list.`,
        }
      );
    }
    return res.status(200).json({ success: true, message: 'Event added' })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}
exports.edit_event = async (req, res) => {
  try {

    const { name, description, deadline, starts_at, quota, price, image, id, fake_participants } = req.body
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Name" });
    }
    if (!description) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter description" });
    }
    if (!deadline) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter deadline" });
    }
    if (!starts_at) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Starting date" });
    }
    if (!price) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Price" });
    }
    if (!quota) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter quota" });
    }
    if (!image) {
      return res
        .status(400)
        .json({ success: false, message: "Please Upload Image" });
    }
    const event = await Event.findById(id)
    if (!event) {
      return res
        .status(400)
        .json({ success: false, message: "Event not found in DB!" });
    }
    if (!fake_participants || fake_participants <= 0) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Valid Number of fake participants" });
    }
    event.name = name
    event.description = description
    event.price = price
    event.quota = quota
    event.starts_at = starts_at
    event.deadline = deadline
    event.image = image
    event.fake_participants = fake_participants
    await event.save()
    return res.status(200).json({ success: true, message: 'Event edited' })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}

exports.edit_user = async (req, res) => {
  try {
    const { name, email, phone, city, balance, password, id } = req.body
    if (!name) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter Name" });
    }
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter email" });
    }
    if (!phone) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter phone" });
    }
    if (!city) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter city" });
    }
    if (!balance) {
      return res
        .status(400)
        .json({ success: false, message: "Please Enter balance" });
    }
    const user = await User.findById(id)
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found in DB!" });
    }
    if (password) {
      if (password.length < 8) {
        return res
          .status(400)
          .json({ success: false, message: "Password must be at least 8 characters" });
      }
      const p = await bcrypt.hash(password, 12);
      user.password = p
    }
    user.name = name
    user.email = email
    user.phone = phone
    user.city = city
    user.balance = balance
    await user.save()
    return res.status(200).json({ success: true, message: 'User data edited' })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}


exports.admin_delete_event = async (req, res) => {
  try {
    const item = req.body.item
    await Event.findByIdAndDelete(item._id)
    return res.status(200).json({ success: true, message: 'Event deleted' })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}

exports.admin_delete_user = async (req, res) => {
  try {
    const item = req.body.item
    await User.findByIdAndDelete(item._id)
    return res.status(200).json({ success: true, message: 'User deleted' })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}



exports.load_expired_events = async (req, res) => {
  try {
    let date = new Date()
    let now = date.getTime()
    const events = await Event.find({ deadline: { $lte: now } })
    return res.status(200).json({ success: true, message: 'Events loaded', events })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}

exports.draw = async (req, res) => {
  try {
    const { item, number_of_winners, custom_winners } = req.body
    console.log(custom_winners)
    if (!number_of_winners && custom_winners.length === 0) {
      return res.status(400).json({ success: false, message: "Enter number of winners" })
    }
    if (number_of_winners < 0) {
      return res.status(400).json({ success: false, message: "Number of winners must be greter than 0" })
    }
    const event = await Event.findById(item._id)
    let winners = []
    if (custom_winners.length > 0) {
      for (let i = 0; i < custom_winners.length; i++) {
        let winner = await Ticket.aggregate([
          { $match: { ticket_number: custom_winners[i] } },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user'
            }
          }
        ])
        winners.push(winner)
      }
    }
    for (let i = 0; i < number_of_winners; i++) {
      const random = Math.floor((Math.random() * event.sold))
      if (winners.some(item => item[0]?.ticket_number === event.sold_list[random])) {
        i -= 1
      } else {
        let winner = await Ticket.aggregate([
          { $match: { ticket_number: event.sold_list[random] } },
          {
            $lookup: {
              from: 'users',
              localField: 'user',
              foreignField: '_id',
              as: 'user'
            }
          }
        ])
        winners.push(winner)
      }
    }
    event.winners = winners
    await event.save()
    return res.status(200).json({ success: 'true', winners, message: 'Draw successful', event })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}
exports.payment_methods = async (req, res) => {
  try {
    const methods = await PaymentMethod.find()
    return res.status(200).json({ success: true, message: 'Payment Methods loaded', methods })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}

exports.add_payment_method = async (req, res) => {
  try {
    const { method_name, recipient_name, recipient_account_number } = req.body
    if (!method_name) {
      return res.status(400).json({ success: false, message: "Enter Payment Method Name" })
    }
    if (!recipient_name) {
      return res.status(400).json({ success: false, message: "Enter Recipient Name" })
    }
    if (!recipient_account_number) {
      return res.status(400).json({ success: false, message: "Enter Recipient Account Number" })
    }
    const pre = await PaymentMethod.findOne({ method_name })
    if (pre) {
      res.status(400).json({ success: false, message: 'Payment Method already exists' })
    }
    const new_method = new PaymentMethod({ method_name, recipient_name, recipient_account_number })
    await new_method.save()
    return res.status(200).json({ success: true, message: 'Payment Method added' })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}


exports.del_payment_method = async (req, res) => {
  try {
    await PaymentMethod.findByIdAndDelete(req.body.item._id)
    return res.status(200).json({ success: true, message: 'Payment Method added' })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}

exports.admin_get_events = async (req, res) => {
  try {
    const events = await Event.find()
    return res.status(200).json({ success: true, message: 'Events list loaded', events })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}

exports.admin_get_users = async (req, res) => {
  try {
    const users = await User.find()
    return res.status(200).json({ success: true, message: 'Users list loaded', users })
  } catch (error) {
    console.log(error)
    return res.status(400).json({ success: false, message: error.message })
  }
}



