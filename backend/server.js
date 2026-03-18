require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDB } = require('./db');
const taskRoutes = require('./routes/tasks');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
}));
app.use(express.json());

app.use('/tasks', taskRoutes);

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use((req, res) => res.status(404).json({ error: `${req.method} ${req.path} not found.` }));
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Unexpected error.' });
});

async function start() {
  await initDB();
  app.listen(PORT, () => console.log(`✓ API running on http://localhost:${PORT}`));
}

if (require.main === module) {
  start().catch((err) => { console.error(err); process.exit(1); });
}

module.exports = app;
