const router = require('express').Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  const { material_id, topic } = req.query;
  let query = 'SELECT f.*, sm.title as material_title FROM flashcards f LEFT JOIN study_materials sm ON f.material_id = sm.id WHERE f.user_id = ?';
  const params = [req.userId];
  if (material_id) { query += ' AND f.material_id = ?'; params.push(material_id); }
  if (topic) { query += ' AND f.topic_name LIKE ?'; params.push(`%${topic}%`); }
  query += ' ORDER BY f.created_at DESC';
  res.json(db.prepare(query).all(...params));
});

router.post('/session', auth, (req, res) => {
  const { duration_minutes, topic, cards_reviewed, score_percent } = req.body;
  const result = db.prepare('INSERT INTO study_sessions (user_id, duration_minutes, topic, cards_reviewed, score_percent) VALUES (?, ?, ?, ?, ?)').run(req.userId, duration_minutes, topic, cards_reviewed, score_percent);
  const today = new Date().toISOString().split('T')[0];
  db.prepare('INSERT INTO frequency_log (user_id, date, activity_type) VALUES (?, ?, ?)').run(req.userId, today, 'flashcard_session');
  res.json({ id: result.lastInsertRowid });
});

router.get('/topics', auth, (req, res) => {
  const topics = db.prepare('SELECT DISTINCT topic_name FROM flashcards WHERE user_id = ? AND topic_name IS NOT NULL').all(req.userId);
  res.json(topics.map(t => t.topic_name));
});

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM flashcards WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

module.exports = router;
