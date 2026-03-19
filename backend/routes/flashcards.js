const router = require('express').Router();
const { supabase } = require('../db/database');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const sb = supabase();
  const { material_id, topic } = req.query;
  let query = sb.from('flashcards').select('*, study_materials(title)').eq('user_id', req.userId).order('created_at', { ascending: false });
  if (material_id) query = query.eq('material_id', material_id);
  if (topic) query = query.ilike('topic_name', `%${topic}%`);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/topics', auth, async (req, res) => {
  const sb = supabase();
  const { data } = await sb.from('flashcards').select('topic_name').eq('user_id', req.userId).not('topic_name', 'is', null);
  const unique = [...new Set((data || []).map(r => r.topic_name).filter(Boolean))];
  res.json(unique);
});

router.post('/session', auth, async (req, res) => {
  const { duration_minutes, topic, cards_reviewed, score_percent } = req.body;
  const sb = supabase();
  const { data, error } = await sb.from('study_sessions').insert({ user_id: req.userId, duration_minutes, topic, cards_reviewed, score_percent }).select('id').single();
  if (error) return res.status(500).json({ error: error.message });
  const today = new Date().toISOString().split('T')[0];
  await sb.from('frequency_log').insert({ user_id: req.userId, date: today, activity_type: 'flashcard_session' });
  res.json({ id: data.id });
});

router.delete('/:id', auth, async (req, res) => {
  const sb = supabase();
  await sb.from('flashcards').delete().eq('id', req.params.id).eq('user_id', req.userId);
  res.json({ success: true });
});

module.exports = router;
