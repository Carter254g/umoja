const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createProposal,
  getProposals,
  getProposal,
  updateProposalStatus,
  getCommunityProposals
} = require('../controllers/proposals');

router.get('/', auth, getProposals);
router.post('/', auth, createProposal);
router.get('/:id', auth, getProposal);
router.patch('/:id/status', auth, updateProposalStatus);
router.get('/community/:id', auth, getCommunityProposals);

module.exports = router;
