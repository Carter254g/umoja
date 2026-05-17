const pool = require('../db');

const getTreasury = async (req, res) => {
  try {
    const communities = await pool.query(`
      SELECT c.*, cm.role,
        (SELECT COALESCE(SUM(amount), 0) FROM contributions WHERE community_id = c.id) as balance,
        (SELECT COUNT(*) FROM contributions WHERE community_id = c.id) as transaction_count
      FROM communities c
      JOIN community_members cm ON cm.community_id = c.id
      WHERE cm.user_id = $1
    `, [req.user.id]);

    const contributions = await pool.query(`
      SELECT ct.*, u.name as contributor_name, c.name as community_name
      FROM contributions ct
      LEFT JOIN users u ON ct.user_id = u.id
      LEFT JOIN communities c ON ct.community_id = c.id
      WHERE c.id IN (
        SELECT community_id FROM community_members WHERE user_id = $1
      )
      ORDER BY ct.created_at DESC
      LIMIT 20
    `, [req.user.id]);

    const totalBalance = communities.rows.reduce((sum, c) => sum + parseFloat(c.balance || 0), 0);

    res.json({
      communities: communities.rows,
      transactions: contributions.rows,
      totalBalance,
    });
  } catch (err) {
    console.error('Treasury error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const addContribution = async (req, res) => {
  const { community_id, amount, description, tx_hash } = req.body;
  if (!community_id || !amount) return res.status(400).json({ error: 'Community and amount required' });
  try {
    const result = await pool.query(
      `INSERT INTO contributions (community_id, user_id, amount, description, tx_hash)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [community_id, req.user.id, amount, description, tx_hash]
    );
    res.json({ contribution: result.rows[0] });
  } catch (err) {
    console.error('Add contribution error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = { getTreasury, addContribution };
