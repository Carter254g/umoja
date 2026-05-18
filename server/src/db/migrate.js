const pool = require('./index');

const createTables = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name          VARCHAR(100) NOT NULL,
        phone         VARCHAR(20) UNIQUE NOT NULL,
        wallet_address VARCHAR(42),
        otp           VARCHAR(6),
        otp_expires   TIMESTAMP,
        is_verified   BOOLEAN DEFAULT FALSE,
        created_at    TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('users table created');
    // Add missing columns if they don't exist
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(20)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS otp VARCHAR(6)`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS otp_expires TIMESTAMP`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE`);
    await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS wallet_address VARCHAR(42)`);
    await pool.query(`ALTER TABLE users ALTER COLUMN email DROP NOT NULL`);
    await pool.query(`ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL`);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS communities (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contract_id     INTEGER UNIQUE NOT NULL,
        name            VARCHAR(100) NOT NULL,
        description     TEXT,
        community_type  VARCHAR(50),
        creator_id      UUID REFERENCES users(id),
        chain_id        INTEGER DEFAULT 31337,
        contract_address VARCHAR(42),
        created_at      TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('communities table created');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS community_members (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
        user_id      UUID REFERENCES users(id) ON DELETE CASCADE,
        role         VARCHAR(20) DEFAULT 'member',
        joined_at    TIMESTAMP DEFAULT NOW(),
        UNIQUE(community_id, user_id)
      );
    `);
    console.log('community_members table created');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS proposals (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        contract_id     INTEGER NOT NULL,
        community_id    UUID REFERENCES communities(id) ON DELETE CASCADE,
        proposer_id     UUID REFERENCES users(id),
        title           VARCHAR(200) NOT NULL,
        description     TEXT,
        status          VARCHAR(20) DEFAULT 'active',
        vote_type       VARCHAR(20) DEFAULT 'simple',
        deadline        TIMESTAMP,
        yes_votes       INTEGER DEFAULT 0,
        no_votes        INTEGER DEFAULT 0,
        abstain_votes   INTEGER DEFAULT 0,
        funds_involved  BOOLEAN DEFAULT FALSE,
        fund_amount     NUMERIC(18, 8),
        fund_recipient  VARCHAR(42),
        created_at      TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('proposals table created');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS votes (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        proposal_id  UUID REFERENCES proposals(id) ON DELETE CASCADE,
        voter_id     UUID REFERENCES users(id),
        choice       VARCHAR(10) NOT NULL,
        tx_hash      VARCHAR(66),
        voted_at     TIMESTAMP DEFAULT NOW(),
        UNIQUE(proposal_id, voter_id)
      );
    `);
    console.log('votes table created');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contributions (
        id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        community_id UUID REFERENCES communities(id) ON DELETE CASCADE,
        user_id      UUID REFERENCES users(id),
        amount       NUMERIC(18, 8) NOT NULL,
        description  VARCHAR(200),
        tx_hash      VARCHAR(66),
        created_at   TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('contributions table created');

    console.log('All tables created successfully');
    return true;
  } catch (err) {
    console.error('Migration error:', err.message);
    throw err;
  }
};

if (require.main === module) {
  createTables().then(() => process.exit(0)).catch(() => process.exit(1));
}

module.exports = { createTables };
