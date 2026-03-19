require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb } = require('./db/database');

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

initDb().then(() => {
  console.log('✅ Banco de dados inicializado');

  app.use('/api/auth', require('./routes/auth'));
  app.use('/api/materials', require('./routes/materials'));
  app.use('/api/flashcards', require('./routes/flashcards'));
  app.use('/api/essays', require('./routes/essays'));
  app.use('/api/plans', require('./routes/plans'));
  app.use('/api/dashboard', require('./routes/dashboard'));
  app.use('/api/users', require('./routes/users'));
  app.use('/api/progress', require('./routes/progress'));

  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => console.log(`🔥 Lumina Backend rodando na porta ${PORT}`));
}).catch(err => {
  console.error('Erro ao inicializar banco:', err);
  process.exit(1);
});
