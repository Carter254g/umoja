const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getTreasury, addContribution } = require('../controllers/treasury');

router.get('/', auth, getTreasury);
router.post('/contribute', auth, addContribution);

module.exports = router;
