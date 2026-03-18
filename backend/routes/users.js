const router = require('express').Router();
const bcrypt = require('bcryptjs');
const db = require('../db/database');
const auth = require('../middleware/auth');

router.get('/me', auth, (req, res) => {
  const user = db.prepare('SELECT id, full_name, email, created_at FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json(user);
});

router.put('/me', auth, async (req, res) => {
  try {
    const { full_name, email, current_password, new_password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.userId);
    if (email && email !== user.email) {
      const exists = db.prepare('SELECT id FROM users WHERE email = ? AND id != ?').get(email, req.userId);
      if (exists) return res.status(409).json({ error: 'E-mail já em uso' });
    }
    if (new_password) {
      if (!current_password) return res.status(400).json({ error: 'Senha atual necessária' });
      const valid = await bcrypt.compare(current_password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Senha atual incorreta' });
      const hash = await bcrypt.hash(new_password, 12);
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, req.userId);
    }
    db.prepare('UPDATE users SET full_name = ?, email = ? WHERE id = ?').run(full_name || user.full_name, email || user.email, req.userId);
    const updated = db.prepare('SELECT id, full_name, email, created_at FROM users WHERE id = ?').get(req.userId);
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/me', auth, (req, res) => {
  db.prepare('DELETE FROM users WHERE id = ?').run(req.userId);
  res.json({ success: true });
});

module.exports = router;
