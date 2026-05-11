const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendProposalReminders, getNotificationStats } = require('../controllers/notifications');

router.post('/reminders', auth, sendProposalReminders);
router.get('/stats', auth, getNotificationStats);

module.exports = router;
