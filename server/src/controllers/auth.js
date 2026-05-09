const pool = require('../db');
const jwt = require('jsonwebtoken');
const { sendOTP, sendWelcome } = require('../utils/sms');
require('dotenv').config();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const formatPhone = (phone) => {
  phone = phone.replace(/\s+/g, '').replace(/-/g, '');
  if (phone.startsWith('0')) {
    return '+254' + phone.slice(1);
  }
  if (phone.startsWith('254')) {
    return '+' + phone;
  }
  if (!phone.startsWith('+')) {
    return '+' + phone;
  }
  return phone;
};

const requestOTP = async (req, res) => {
  const { phone, name } = req.body;

  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  const formattedPhone = formatPhone(phone);
  const otp = generateOTP();
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);

  try {
    const existingUser = await pool.query(
      'SELECT id, name FROM users WHERE phone = $1',
      [formattedPhone]
    );

    if (existingUser.rows.length > 0) {
      await pool.query(
        'UPDATE users SET otp = $1, otp_expires = $2 WHERE phone = $3',
        [otp, otpExpires, formattedPhone]
      );
      await sendOTP(formattedPhone, otp);
      return res.json({
        message: 'OTP sent successfully',
        phone: formattedPhone,
        isNewUser: false,
      });
    }

    if (!name) {
      return res.status(400).json({ error: 'Name is required for new users' });
    }

    await pool.query(
      `INSERT INTO users (name, phone, otp, otp_expires)
       VALUES ($1, $2, $3, $4)`,
      [name, formattedPhone, otp, otpExpires]
    );

    await sendOTP(formattedPhone, otp);

    res.status(201).json({
      message: 'OTP sent successfully',
      phone: formattedPhone,
      isNewUser: true,
    });
  } catch (err) {
    console.error('Request OTP error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const verifyOTP = async (req, res) => {
  const { phone, otp } = req.body;

  if (!phone || !otp) {
    return res.status(400).json({ error: 'Phone and OTP are required' });
  }

  const formattedPhone = formatPhone(phone);

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE phone = $1',
      [formattedPhone]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = result.rows[0];

    if (user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }

    if (new Date() > new Date(user.otp_expires)) {
      return res.status(400).json({ error: 'OTP has expired' });
    }

    await pool.query(
      'UPDATE users SET is_verified = TRUE, otp = NULL, otp_expires = NULL WHERE id = $1',
      [user.id]
    );

    if (!user.is_verified) {
      await sendWelcome(formattedPhone, user.name);
    }

    const token = jwt.sign(
      { id: user.id, phone: user.phone, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        wallet_address: user.wallet_address,
      },
    });
  } catch (err) {
    console.error('Verify OTP error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT id, name, phone, wallet_address, is_verified, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error('Get profile error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateWallet = async (req, res) => {
  const { wallet_address } = req.body;

  if (!wallet_address) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  try {
    await pool.query(
      'UPDATE users SET wallet_address = $1 WHERE id = $2',
      [wallet_address, req.user.id]
    );

    res.json({ message: 'Wallet address updated successfully' });
  } catch (err) {
    console.error('Update wallet error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { requestOTP, verifyOTP, getProfile, updateWallet };
