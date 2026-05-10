const pool = require('../db');

const castVote = async (req, res) => {
  const { proposal_id, choice, tx_hash } = req.body;

  if (!proposal_id || !choice) {
    return res.status(400).json({ error: 'Proposal ID and choice are required' });
  }

  const validChoices = ['yes', 'no', 'abstain'];
  if (!validChoices.includes(choice.toLowerCase())) {
    return res.status(400).json({ error: 'Choice must be yes, no or abstain' });
  }

  try {
    const proposal = await pool.query(
      'SELECT * FROM proposals WHERE id = $1',
      [proposal_id]
    );

    if (proposal.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const p = proposal.rows[0];

    if (p.status !== 'active') {
      return res.status(400).json({ error: 'Proposal is not active' });
    }

    if (new Date() > new Date(p.deadline)) {
      return res.status(400).json({ error: 'Voting deadline has passed' });
    }

    const member = await pool.query(
      'SELECT * FROM community_members WHERE community_id = $1 AND user_id = $2',
      [p.community_id, req.user.id]
    );

    if (member.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this community' });
    }

    const existingVote = await pool.query(
      'SELECT * FROM votes WHERE proposal_id = $1 AND voter_id = $2',
      [proposal_id, req.user.id]
    );

    if (existingVote.rows.length > 0) {
      return res.status(400).json({ error: 'You have already voted on this proposal' });
    }

    await pool.query(
      `INSERT INTO votes (proposal_id, voter_id, choice, tx_hash)
       VALUES ($1, $2, $3, $4)`,
      [proposal_id, req.user.id, choice.toLowerCase(), tx_hash || null]
    );

    const voteField = choice.toLowerCase() === 'yes' ? 'yes_votes' :
                      choice.toLowerCase() === 'no' ? 'no_votes' : 'abstain_votes';

    await pool.query(
      `UPDATE proposals SET ${voteField} = ${voteField} + 1 WHERE id = $1`,
      [proposal_id]
    );

    const updated = await pool.query(
      'SELECT yes_votes, no_votes, abstain_votes FROM proposals WHERE id = $1',
      [proposal_id]
    );

    res.status(201).json({
      message: 'Vote cast successfully',
      votes: updated.rows[0]
    });
  } catch (err) {
    console.error('Cast vote error:', err.message);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

const getVotes = async (req, res) => {
  const { proposal_id } = req.params;

  try {
    const result = await pool.query(`
      SELECT v.*, u.name as voter_name
      FROM votes v
      LEFT JOIN users u ON v.voter_id = u.id
      WHERE v.proposal_id = $1
      ORDER BY v.voted_at DESC
    `, [proposal_id]);

    const counts = await pool.query(
      'SELECT yes_votes, no_votes, abstain_votes FROM proposals WHERE id = $1',
      [proposal_id]
    );

    res.json({
      votes: result.rows,
      counts: counts.rows[0]
    });
  } catch (err) {
    console.error('Get votes error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const checkEligibility = async (req, res) => {
  const { proposal_id } = req.params;

  try {
    const proposal = await pool.query(
      'SELECT * FROM proposals WHERE id = $1',
      [proposal_id]
    );

    if (proposal.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const p = proposal.rows[0];

    const member = await pool.query(
      'SELECT * FROM community_members WHERE community_id = $1 AND user_id = $2',
      [p.community_id, req.user.id]
    );

    const hasVoted = await pool.query(
      'SELECT * FROM votes WHERE proposal_id = $1 AND voter_id = $2',
      [proposal_id, req.user.id]
    );

    const isExpired = new Date() > new Date(p.deadline);

    res.json({
      eligible: member.rows.length > 0 && !hasVoted.rows.length && !isExpired && p.status === 'active',
      isMember: member.rows.length > 0,
      hasVoted: hasVoted.rows.length > 0,
      isExpired,
      proposalStatus: p.status,
      userVote: hasVoted.rows.length > 0 ? hasVoted.rows[0].choice : null
    });
  } catch (err) {
    console.error('Check eligibility error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getQuorumStatus = async (req, res) => {
  const { proposal_id } = req.params;

  try {
    const proposal = await pool.query(
      'SELECT * FROM proposals WHERE id = $1',
      [proposal_id]
    );

    if (proposal.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const p = proposal.rows[0];

    const community = await pool.query(
      'SELECT quorum FROM communities WHERE id = $1',
      [p.community_id]
    );

    const memberCount = await pool.query(
      'SELECT COUNT(*) FROM community_members WHERE community_id = $1',
      [p.community_id]
    );

    const totalVotes = p.yes_votes + p.no_votes + p.abstain_votes;
    const totalMembers = parseInt(memberCount.rows[0].count);
    const quorum = community.rows[0].quorum;
    const quorumReached = totalMembers > 0 && (totalVotes * 100) >= (totalMembers * quorum);
    const quorumNeeded = Math.ceil((totalMembers * quorum) / 100);

    res.json({
      totalMembers,
      totalVotes,
      quorumRequired: quorum,
      quorumNeeded,
      quorumReached,
      votesNeeded: Math.max(0, quorumNeeded - totalVotes),
      yesVotes: p.yes_votes,
      noVotes: p.no_votes,
      abstainVotes: p.abstain_votes
    });
  } catch (err) {
    console.error('Get quorum status error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { castVote, getVotes, checkEligibility, getQuorumStatus };
