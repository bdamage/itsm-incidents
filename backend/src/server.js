require('dotenv').config();
require('express-async-errors');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const { connect } = require('./db');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const usersRoute = require('./routes/users');
const groupsRoute = require('./routes/groups');
const incidentsRoute = require('./routes/incidents');

const app = express();

app.use(morgan('dev'));
app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || '*' }));

app.get('/api/health', (req, res) => res.json({ ok: true }));

app.use('/api/users', usersRoute);
app.use('/api/groups', groupsRoute);
app.use('/api/incidents', incidentsRoute);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
// call seed when SEED=true is set in env (safe default: off)
const shouldSeed = String(process.env.SEED).toLowerCase() === 'true';

connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log(`🚀 API running on http://localhost:${PORT}`);

    if (shouldSeed) {
      try {
        const seedDatabase = require('./scripts/seed');
        await seedDatabase();
        console.log('✅ Database seeded from server startup');
      } catch (err) {
        console.error('Seed error:', err);
      }
    }

    app.listen(PORT, () => console.log(`Listening on ${PORT}`));
  })
  .catch((err) => {
    console.error('DB connection error', err);
    process.exit(1);
  });