require('dotenv').config();

const sendSMS = async (phone, message) => {
  try {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[SMS DEV] To: ${phone} | Message: ${message}`);
      return true;
    }

    const AfricasTalking = require('africastalking');
    const at = AfricasTalking({
      apiKey: process.env.AT_API_KEY,
      username: process.env.AT_USERNAME,
    });

    const sms = at.SMS;
    await sms.send({
      to: [phone],
      message: message,
      from: process.env.AT_SENDER_ID || 'UMOJA',
    });

    return true;
  } catch (err) {
    console.error('SMS error:', err.message);
    return false;
  }
};

const sendOTP = async (phone, otp) => {
  const message = `Your Umoja verification code is: ${otp}. Valid for 10 minutes. Do not share this code.`;
  return sendSMS(phone, message);
};

const sendWelcome = async (phone, name) => {
  const message = `Welcome to Umoja, ${name}! Your community governance platform is ready. Reply HELP for assistance.`;
  return sendSMS(phone, message);
};

const sendVoteReminder = async (phone, proposalTitle, deadline) => {
  const message = `Umoja reminder: Vote on "${proposalTitle}" before ${deadline}. Open the app to cast your vote.`;
  return sendSMS(phone, message);
};

const sendVoteResult = async (phone, proposalTitle, result) => {
  const message = `Umoja update: "${proposalTitle}" has ${result}. Open the app to see the full results.`;
  return sendSMS(phone, message);
};

module.exports = { sendSMS, sendOTP, sendWelcome, sendVoteReminder, sendVoteResult };
