const pool = require('../db');
const { sendSMS, sendVoteReminder, sendVoteResult } = require('../utils/sms');

const notifyNewProposal = async (communityId, proposalTitle, proposerName) => {
  try {
    const members = await pool.query(`
      SELECT u.phone, u.name
      FROM community_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.community_id = $1
    `, [communityId]);

    const message = `Umoja: New proposal "${proposalTitle}" by ${proposerName}. Open the app to vote.`;

    for (const member of members.rows) {
      await sendSMS(member.phone, message);
    }

    return members.rows.length;
  } catch (err) {
    console.error('Notify new proposal error:', err.message);
    return 0;
  }
};

const notifyVoteResult = async (communityId, proposalTitle, passed) => {
  try {
    const members = await pool.query(`
      SELECT u.phone, u.name
      FROM community_members cm
      JOIN users u ON cm.user_id = u.id
      WHERE cm.community_id = $1
    `, [communityId]);

    const result = passed ? 'PASSED' : 'FAILED';

    for (const member of members.rows) {
      await sendVoteResult(member.phone, proposalTitle, result);
    }

    return members.rows.length;
  } catch (err) {
    console.error('Notify vote result error:', err.message);
    return 0;
  }
};

const sendProposalReminders = async (req, res) => {
  try {
    const expiringSoon = await pool.query(`
      SELECT p.*, c.id as comm_id, c.name as community_name
      FROM proposals p
      JOIN communities c ON p.community_id = c.id
      WHERE p.status = 'active'
      AND p.deadline BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
    `);

    let totalNotified = 0;

    for (const proposal of expiringSoon.rows) {
      const members = await pool.query(`
        SELECT u.phone FROM community_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.community_id = $1
      `, [proposal.community_id]);

      const deadline = new Date(proposal.deadline).toLocaleDateString('en-KE');

      for (const member of members.rows) {
        await sendVoteReminder(member.phone, proposal.title, deadline);
        totalNotified++;
      }
    }

    res.json({
      message: 'Reminders sent',
      proposalsChecked: expiringSoon.rows.length,
      membersNotified: totalNotified
    });
  } catch (err) {
    console.error('Send reminders error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

const getNotificationStats = async (req, res) => {
  try {
    const activeProposals = await pool.query(
      "SELECT COUNT(*) FROM proposals WHERE status = 'active'"
    );

    const expiringSoon = await pool.query(`
      SELECT COUNT(*) FROM proposals
      WHERE status = 'active'
      AND deadline BETWEEN NOW() AND NOW() + INTERVAL '24 hours'
    `);

    const totalCommunities = await pool.query(
      'SELECT COUNT(*) FROM communities'
    );

    const totalMembers = await pool.query(
      'SELECT COUNT(*) FROM users WHERE is_verified = TRUE'
    );

    res.json({
      activeProposals: parseInt(activeProposals.rows[0].count),
      expiringSoon: parseInt(expiringSoon.rows[0].count),
      totalCommunities: parseInt(totalCommunities.rows[0].count),
      totalMembers: parseInt(totalMembers.rows[0].count)
    });
  } catch (err) {
    console.error('Get notification stats error:', err.message);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  notifyNewProposal,
  notifyVoteResult,
  sendProposalReminders,
  getNotificationStats
};
