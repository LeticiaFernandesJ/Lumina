const router = require('express').Router();
const { supabase } = require('../db/database');
const auth = require('../middleware/auth');

router.get('/stats', auth, async (req, res) => {
  const sb = supabase();
  const userId = req.userId;

  const [mats, cards, essays, sessions, logs] = await Promise.all([
    sb.from('study_materials').select('id', { count: 'exact' }).eq('user_id', userId),
    sb.from('flashcards').select('id', { count: 'exact' }).eq('user_id', userId),
    sb.from('essays').select('score').eq('user_id', userId),
    sb.from('study_sessions').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(30),
    sb.from('frequency_log').select('date').eq('user_id', userId).order('date', { ascending: false }),
  ]);

  const avgScore = essays.data?.length ? essays.data.reduce((a, b) => a + (b.score || 0), 0) / essays.data.length : 0;

  // Streak
  let streak = 0;
  const dates = [...new Set((logs.data || []).map(l => l.date))];
  const today = new Date().toISOString().split('T')[0];
  let check = today;
  for (const d of dates) {
    if (d === check) {
      streak++;
      const dt = new Date(check); dt.setDate(dt.getDate() - 1);
      check = dt.toISOString().split('T')[0];
    } else break;
  }

  // Activity last 30 days
  const thirtyAgo = new Date(); thirtyAgo.setDate(thirtyAgo.getDate() - 30);
  const { data: actData } = await sb.from('frequency_log').select('date').eq('user_id', userId).gte('date', thirtyAgo.toISOString().split('T')[0]);
  const actMap = {};
  (actData || []).forEach(r => { actMap[r.date] = (actMap[r.date] || 0) + 1; });
  const activity = Object.entries(actMap).map(([date, count]) => ({ date, count })).sort((a, b) => a.date.localeCompare(b.date));

  res.json({
    totalPdfs: mats.count || 0,
    totalCards: cards.count || 0,
    avgScore: Math.round(avgScore * 10) / 10,
    streak,
    sessions: sessions.data || [],
    activity,
  });
});

router.get('/frequency', auth, async (req, res) => {
  const sb = supabase();
  const userId = req.userId;

  const [logs, sessions, essays, mats, cards] = await Promise.all([
    sb.from('frequency_log').select('date, activity_type').eq('user_id', userId).order('date', { ascending: false }).limit(365),
    sb.from('study_sessions').select('*').eq('user_id', userId).order('date', { ascending: false }),
    sb.from('essays').select('id, topic_name, score, created_at').eq('user_id', userId),
    sb.from('study_materials').select('id', { count: 'exact' }).eq('user_id', userId),
    sb.from('flashcards').select('id', { count: 'exact' }).eq('user_id', userId),
  ]);

  // Streak
  const dates = [...new Set((logs.data || []).map(l => l.date))].sort().reverse();
  let streak = 0;
  const today = new Date().toISOString().split('T')[0];
  let check = today;
  for (const d of dates) {
    if (d === check) { streak++; const dt = new Date(check); dt.setDate(dt.getDate() - 1); check = dt.toISOString().split('T')[0]; }
    else break;
  }

  const highScore = essays.data?.reduce((max, e) => Math.max(max, e.score || 0), 0) || 0;

  // Group logs by date+type for heatmap
  const logMap = {};
  (logs.data || []).forEach(l => {
    const key = l.date;
    logMap[key] = (logMap[key] || 0) + 1;
  });
  const logsFormatted = Object.entries(logMap).map(([date, count]) => ({ date, count }));

  const badges = [
    { id: 'first_pdf', name: 'Primeiro PDF', icon: '📄', earned: (mats.count || 0) >= 1 },
    { id: 'streak_7', name: '7 Dias Seguidos', icon: '🔥', earned: streak >= 7 },
    { id: 'cards_50', name: '50 Flashcards', icon: '🃏', earned: (cards.count || 0) >= 50 },
    { id: 'score_9', name: 'Nota 9+', icon: '⭐', earned: highScore >= 9 },
  ];

  res.json({ logs: logsFormatted, sessions: sessions.data || [], essays: essays.data || [], streak, badges });
});

module.exports = router;
