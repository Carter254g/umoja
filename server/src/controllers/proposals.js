const pool = require('../db');

const createProposal = async (req, res) => {
  const {
    community_id,
    title,
    description,
    vote_type,
    duration_days,
    funds_involved,
    fund_amount,
    fund_recipient,
    contract_id
  } = req.body;

  if (!community_id || !title || contract_id === undefined || contract_id === null) {
    return res.status(400).json({ error: 'Community ID, title and contract ID are required' });
  }

  try {
    const member = await pool.query(
      'SELECT * FROM community_members WHERE community_id = $1 AND user_id = $2',
      [community_id, req.user.id]
    );

    if (member.rows.length === 0) {
      return res.status(403).json({ error: 'You are not a member of this community' });
    }

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + (duration_days || 7));

    const result = await pool.query(
      `INSERT INTO proposals (
        contract_id, community_id, proposer_id, title, description,
        vote_type, deadline, funds_involved, fund_amount, fund_recipient
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        contract_id,
        community_id,
        req.user.id,
        title,
        description,
        vote_type || 'simple',
        deadline,
        funds_involved || false,
        fund_amount || null,
        fund_recipient || null
      ]
    );

    res.status(201).json({ proposal: result.rows[0] });
  } catch (err) {
    console.error('Create proposal error:', err.message);
    res.status(500).json({ error: 'Server error', detail: err.message });
  }
};

const getProposals = async (req, res) => {
  const { community_id, status } = req.query;

  try {
    let query = `
      SELECT p.*, u.name as proposer_name,
        c.name as community_name
      FROM proposals p
      LEFT JOIN users u ON p.proposer_id = u.id
      LEFT JOIN communities c ON p.community_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (community_id) {
      params.push(community_id);
      query += ` AND p.community_id = $${params.length}`;
    }

    if (status) {
      params.push(status);
      query += ` AND p.status = $${params.length}`;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ proposals: result.rows });
  } catch (err) {
    console.error('Get proposals error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getProposal = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT p.*, u.name as proposer_name,
        c.name as community_name
      FROM proposals p
      LEFT JOIN users u ON p.proposer_id = u.id
      LEFT JOIN communities c ON p.community_id = c.id
      WHERE p.id = $1
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    const votes = await pool.query(
      `SELECT v.*, u.name as voter_name
       FROM votes v
       LEFT JOIN users u ON v.voter_id = u.id
       WHERE v.proposal_id = $1`,
      [id]
    );

    res.json({
      proposal: result.rows[0],
      votes: votes.rows
    });
  } catch (err) {
    console.error('Get proposal error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const updateProposalStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['active', 'passed', 'failed', 'expired', 'cancelled'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  try {
    const result = await pool.query(
      'UPDATE proposals SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Proposal not found' });
    }

    res.json({ proposal: result.rows[0] });
  } catch (err) {
    console.error('Update proposal status error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getCommunityProposals = async (req, res) => {
  const { id } = req.params;
  const { status } = req.query;

  try {
    let query = `
      SELECT p.*, u.name as proposer_name
      FROM proposals p
      LEFT JOIN users u ON p.proposer_id = u.id
      WHERE p.community_id = $1
    `;
    const params = [id];

    if (status) {
      params.push(status);
      query += ` AND p.status = $${params.length}`;
    }

    query += ' ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    res.json({ proposals: result.rows });
  } catch (err) {
    console.error('Get community proposals error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createProposal,
  getProposals,
  getProposal,
  updateProposalStatus,
  getCommunityProposals
};
