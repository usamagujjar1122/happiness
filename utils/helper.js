const axios = require('axios')
const T = require("tesseract.js")
const Stripe = require('stripe')
exports.sendNotification = async (to, message, jsonData) => {
  await axios
    .post(
      "https://fcm.googleapis.com/fcm/send",
      {
        to,
        priority: "high",
        notification: {
          title: message.title,
          body: message.body,
        },
        android: {
          priority: "high",
        },
        data: jsonData,
        apns: {
          headers: {
            "apns-priority": 5,
            "apns-topic": "com.demo",
            "apns-push-type": "background",
          },
        },
      },
      {
        headers: {
          Authorization: "key=" + "AAAAF8mCBzw:APA91bGA2JJNRpSz0QbXmvlbBHtMAJz3gT7kU-gf-7a8Yb958tcOGWoMElywRi8Womj0rWJBpRyQakizQ9Sg6YC6OB5ncv1HWpaARxbfhaf1QxWpVsvYTYPtEm3nxvjDsfLfKogcjrsL",
        },
      }
    )
    .then((resp) => console.log("Notification sent: ", resp.data));
};
exports.generateOTP = () => {
  const four_digit = Math.floor(1000 + Math.random() * 9000)
  return four_digit
}

exports.createStripeCustomer = async (email) => {
  const customer = await stripe.customers.create({
    email: email,
  });
  return customer.id;
}


exports.name_from_image = async (img) => {

  const out = await T.recognize(img, 'eng')
  let owner_name = out.data.text.trim()
  return owner_name

}

exports.generateMessage = async (query) => {
  console.log("generating msg")
  const apiKey = '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'; // Replace with your actual API key
  const apiUrl = 'https://api.openai.com/v1/chat/completions';

  try {
    const response = await axios.post(apiUrl, {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'system', content: 'You are a helpful assistant.' }, { role: 'user', content: query }],
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    const { choices } = response.data;
    const reply = choices[0].message.content;
    console.log(reply)
    return reply;
  } catch (error) {
    console.error('Error generating message:', error);
    throw error;
  }
}

