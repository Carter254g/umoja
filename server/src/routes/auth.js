const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { requestOTP, verifyOTP, getProfile, updateWallet } = require('../controllers/auth');

router.post('/request-otp', requestOTP);
router.post('/verify-otp', verifyOTP);
router.get('/profile', auth, getProfile);
router.patch('/wallet', auth, updateWallet);

module.exports = router;
