const router = require('express').Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

router.get('/stats', auth, (req, res) => {
  const userId = req.userId;
  const totalPdfs = db.prepare('SELECT COUNT(*) as c FROM study_materials WHERE user_id = ?').get(userId).c;
  const totalCards = db.prepare('SELECT COUNT(*) as c FROM flashcards WHERE user_id = ?').get(userId).c;
  const avgScore = db.prepare('SELECT AVG(score) as avg FROM essays WHERE user_id = ?').get(userId).avg;
  const sessions = db.prepare('SELECT * FROM study_sessions WHERE user_id = ? ORDER BY date DESC LIMIT 30').all(userId);
  
  // Streak calculation
  const logs = db.prepare('SELECT DISTINCT date FROM frequency_log WHERE user_id = ? ORDER BY date DESC').all(userId);
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let checkDate = today;
  for (const log of logs) {
    if (log.date === checkDate) {
      streak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split('T')[0];
    } else break;
  }

  // Last 30 days activity
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const activity = db.prepare(`SELECT date, COUNT(*) as count FROM frequency_log WHERE user_id = ? AND date >= ? GROUP BY date ORDER BY date`).all(userId, thirtyDaysAgo.toISOString().split('T')[0]);

  res.json({ totalPdfs, totalCards, avgScore: avgScore ? Math.round(avgScore * 10) / 10 : 0, streak, sessions, activity });
});

router.get('/frequency', auth, (req, res) => {
  const userId = req.userId;
  const logs = db.prepare('SELECT date, activity_type, COUNT(*) as count FROM frequency_log WHERE user_id = ? GROUP BY date, activity_type ORDER BY date DESC LIMIT 365').all(userId);
  const sessions = db.prepare('SELECT * FROM study_sessions WHERE user_id = ? ORDER BY date DESC').all(userId);
  const essays = db.prepare('SELECT id, topic_name, score, created_at FROM essays WHERE user_id = ?').all(userId);
  
  // Badges
  const totalPdfs = db.prepare('SELECT COUNT(*) as c FROM study_materials WHERE user_id = ?').get(userId).c;
  const totalCards = db.prepare('SELECT COUNT(*) as c FROM flashcards WHERE user_id = ?').get(userId).c;
  const highScore = db.prepare('SELECT MAX(score) as m FROM essays WHERE user_id = ?').get(userId).m;
  
  const logs2 = db.prepare('SELECT DISTINCT date FROM frequency_log WHERE user_id = ? ORDER BY date DESC').all(userId);
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let checkDate = today;
  for (const log of logs2) {
    if (log.date === checkDate) { streak++; const d = new Date(checkDate); d.setDate(d.getDate()-1); checkDate = d.toISOString().split('T')[0]; } else break;
  }
  
  const badges = [];
  if (totalPdfs >= 1) badges.push({ id: 'first_pdf', name: 'Primeiro PDF', icon: '📄', earned: true });
  if (streak >= 7) badges.push({ id: 'streak_7', name: '7 Dias Seguidos', icon: '🔥', earned: true });
  if (totalCards >= 50) badges.push({ id: 'cards_50', name: '50 Flashcards', icon: '🃏', earned: true });
  if (highScore >= 9) badges.push({ id: 'score_9', name: 'Nota 9+', icon: '⭐', earned: true });
  
  const allBadges = [
    { id: 'first_pdf', name: 'Primeiro PDF', icon: '📄', earned: totalPdfs >= 1 },
    { id: 'streak_7', name: '7 Dias Seguidos', icon: '🔥', earned: streak >= 7 },
    { id: 'cards_50', name: '50 Flashcards', icon: '🃏', earned: totalCards >= 50 },
    { id: 'score_9', name: 'Nota 9+', icon: '⭐', earned: !!highScore && highScore >= 9 },
  ];

  res.json({ logs, sessions, essays, streak, badges: allBadges });
});

module.exports = router;
