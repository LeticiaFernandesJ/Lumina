const router = require('express').Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db/database');

router.post('/register', async (req, res) => {
  try {
    const { full_name, email, password } = req.body;
    if (!full_name || !email || !password) return res.status(400).json({ error: 'Campos obrigatórios' });
    if (password.length < 6) return res.status(400).json({ error: 'Senha mínimo 6 caracteres' });

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existing) return res.status(409).json({ error: 'E-mail já cadastrado' });

    const hash = await bcrypt.hash(password, 12);
    db.prepare('INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)').run(full_name, email, hash);

    // Busca o usuário recém-criado pelo email para garantir o id correto
    const newUser = db.prepare('SELECT id, full_name, email FROM users WHERE email = ?').get(email);
    if (!newUser) return res.status(500).json({ error: 'Erro ao criar usuário' });

    const token = jwt.sign({ userId: newUser.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log(`✅ Novo usuário registrado: id=${newUser.id} email=${email}`);
    res.json({ token, user: { id: newUser.id, full_name: newUser.full_name, email: newUser.email } });
  } catch (e) {
    console.error('Erro register:', e.message);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'E-mail e senha obrigatórios' });

    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Credenciais inválidas' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    console.log(`✅ Login: id=${user.id} email=${email}`);
    res.json({ token, user: { id: user.id, full_name: user.full_name, email: user.email } });
  } catch (e) {
    console.error('Erro login:', e.message);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

module.exports = router;
