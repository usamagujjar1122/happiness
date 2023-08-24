const axios = require('axios')
const T = require("tesseract.js")
const Stripe = require('stripe')
const stripe = Stripe('sk_test_51MYavWFKy8Ssys2PIjzZHxwIgQgX1qVXLBKmuqeVXAWLMdSklmSUYzPt9wityvXRAHTl0fWSN2UiNx4X158goRmh00iBbJ8gF1')
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

