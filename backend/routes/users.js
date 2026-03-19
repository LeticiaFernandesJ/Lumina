const router = require('express').Router();
const bcrypt = require('bcryptjs');
const { supabase } = require('../db/database');
const auth = require('../middleware/auth');

router.get('/me', auth, async (req, res) => {
  const sb = supabase();
  const { data, error } = await sb.from('users').select('id, full_name, email, created_at').eq('id', req.userId).single();
  if (error || !data) return res.status(404).json({ error: 'Usuário não encontrado' });
  res.json(data);
});

router.put('/me', auth, async (req, res) => {
  try {
    const { full_name, email, current_password, new_password } = req.body;
    const sb = supabase();
    const { data: user } = await sb.from('users').select('*').eq('id', req.userId).single();

    if (email && email !== user.email) {
      const { data: exists } = await sb.from('users').select('id').eq('email', email).neq('id', req.userId).single();
      if (exists) return res.status(409).json({ error: 'E-mail já em uso' });
    }

    if (new_password) {
      if (!current_password) return res.status(400).json({ error: 'Senha atual necessária' });
      const valid = await bcrypt.compare(current_password, user.password_hash);
      if (!valid) return res.status(401).json({ error: 'Senha atual incorreta' });
      const hash = await bcrypt.hash(new_password, 12);
      await sb.from('users').update({ password_hash: hash }).eq('id', req.userId);
    }

    const { data: updated } = await sb.from('users').update({ full_name: full_name || user.full_name, email: email || user.email }).eq('id', req.userId).select('id, full_name, email, created_at').single();
    res.json(updated);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.delete('/me', auth, async (req, res) => {
  const sb = supabase();
  await sb.from('users').delete().eq('id', req.userId);
  res.json({ success: true });
});

module.exports = router;
