const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  createCommunity,
  getCommunities,
  getCommunity,
  joinCommunity,
  getMembers,
  getMyCommunities
} = require('../controllers/communities');

router.get('/', auth, getCommunities);
router.post('/', auth, createCommunity);
router.get('/mine', auth, getMyCommunities);
router.get('/:id', auth, getCommunity);
router.post('/:id/join', auth, joinCommunity);
router.get('/:id/members', auth, getMembers);

module.exports = router;
