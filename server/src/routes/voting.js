const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { castVote, getVotes, checkEligibility, getQuorumStatus } = require('../controllers/voting');

router.post('/cast', auth, castVote);
router.get('/:proposal_id/votes', auth, getVotes);
router.get('/:proposal_id/eligibility', auth, checkEligibility);
router.get('/:proposal_id/quorum', auth, getQuorumStatus);

module.exports = router;
