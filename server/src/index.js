const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();
const { createTables } = require('./db/migrate');

const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Umoja API is running',
    timestamp: new Date(),
    version: '1.0.0'
  });
});

app.use('/api/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

createTables().then(() => {
  app.listen(PORT, () => {
    console.log(`Umoja API running on port ${PORT}`);
  });
}).catch((err) => {
  console.error('Failed to start server:', err.message);
  process.exit(1);
});

module.exports = app;
