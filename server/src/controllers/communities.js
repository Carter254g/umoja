const pool = require('../db');

const createCommunity = async (req, res) => {
  const { name, description, community_type, quorum, contract_id } = req.body;

  if (!name || !contract_id) {
    return res.status(400).json({ error: 'Name and contract ID are required' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO communities (name, description, community_type, creator_id, quorum, contract_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, community_type || 'chama', req.user.id, quorum || 60, contract_id]
    );

    await pool.query(
      `INSERT INTO community_members (community_id, user_id, role)
       VALUES ($1, $2, 'admin')`,
      [result.rows[0].id, req.user.id]
    );

    res.status(201).json({ community: result.rows[0] });
  } catch (err) {
    console.error('Create community error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getCommunities = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, u.name as creator_name,
        COUNT(cm.user_id) as member_count
      FROM communities c
      LEFT JOIN users u ON c.creator_id = u.id
      LEFT JOIN community_members cm ON c.id = cm.community_id
      GROUP BY c.id, u.name
      ORDER BY c.created_at DESC
    `);
    res.json({ communities: result.rows });
  } catch (err) {
    console.error('Get communities error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getCommunity = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(`
      SELECT c.*, u.name as creator_name,
        COUNT(cm.user_id) as member_count
      FROM communities c
      LEFT JOIN users u ON c.creator_id = u.id
      LEFT JOIN community_members cm ON c.id = cm.community_id
      WHERE c.id = $1
      GROUP BY c.id, u.name
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Community not found' });
    }

    res.json({ community: result.rows[0] });
  } catch (err) {
    console.error('Get community error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const joinCommunity = async (req, res) => {
  const { id } = req.params;

  try {
    const community = await pool.query(
      'SELECT * FROM communities WHERE id = $1', [id]
    );

    if (community.rows.length === 0) {
      return res.status(404).json({ error: 'Community not found' });
    }

    const existing = await pool.query(
      'SELECT * FROM community_members WHERE community_id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({ error: 'Already a member' });
    }

    await pool.query(
      `INSERT INTO community_members (community_id, user_id, role)
       VALUES ($1, $2, 'member')`,
      [id, req.user.id]
    );

    res.json({ message: 'Join request submitted successfully' });
  } catch (err) {
    console.error('Join community error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMembers = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await pool.query(`
      SELECT u.id, u.name, u.phone, u.wallet_address,
        cm.role, cm.joined_at
      FROM community_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.community_id = $1
      ORDER BY cm.joined_at ASC
    `, [id]);

    res.json({ members: result.rows });
  } catch (err) {
    console.error('Get members error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getMyCommunities = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, cm.role,
        COUNT(cm2.user_id) as member_count
      FROM communities c
      JOIN community_members cm ON c.id = cm.community_id AND cm.user_id = $1
      LEFT JOIN community_members cm2 ON c.id = cm2.community_id
      GROUP BY c.id, cm.role
      ORDER BY c.created_at DESC
    `, [req.user.id]);

    res.json({ communities: result.rows });
  } catch (err) {
    console.error('Get my communities error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  createCommunity,
  getCommunities,
  getCommunity,
  joinCommunity,
  getMembers,
  getMyCommunities
};
