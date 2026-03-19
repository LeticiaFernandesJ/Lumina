const router = require('express').Router();
const { supabase } = require('../db/database');
const auth = require('../middleware/auth');

router.get('/:planId', auth, async (req, res) => {
  const sb = supabase();
  const { planId } = req.params;

  const [tasksRes, weeksRes] = await Promise.all([
    sb.from('plan_progress').select('week_idx, task_idx, done').eq('user_id', req.userId).eq('plan_id', planId),
    sb.from('plan_week_status').select('week_idx, has_flashcards, has_essay').eq('user_id', req.userId).eq('plan_id', planId),
  ]);

  const checked = {};
  (tasksRes.data || []).forEach(t => {
    if (!checked[t.week_idx]) checked[t.week_idx] = {};
    checked[t.week_idx][t.task_idx] = t.done;
  });

  const hasFlashcards = {};
  const hasEssay = {};
  (weeksRes.data || []).forEach(w => {
    hasFlashcards[w.week_idx] = w.has_flashcards;
    hasEssay[w.week_idx] = w.has_essay;
  });

  res.json({ checked, hasFlashcards, hasEssay });
});

router.post('/:planId/task', auth, async (req, res) => {
  try {
    const { planId } = req.params;
    const { weekIdx, taskIdx, done } = req.body;
    const sb = supabase();

    await sb.from('plan_progress').upsert({
      user_id: req.userId, plan_id: planId, week_idx: weekIdx, task_idx: taskIdx, done,
    }, { onConflict: 'user_id,plan_id,week_idx,task_idx' });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

router.post('/:planId/week', auth, async (req, res) => {
  try {
    const { planId } = req.params;
    const { weekIdx, has_flashcards, has_essay } = req.body;
    const sb = supabase();

    const { data: current } = await sb.from('plan_week_status').select('*').eq('user_id', req.userId).eq('plan_id', planId).eq('week_idx', weekIdx).single();

    await sb.from('plan_week_status').upsert({
      user_id: req.userId,
      plan_id: planId,
      week_idx: weekIdx,
      has_flashcards: has_flashcards !== undefined ? has_flashcards : (current?.has_flashcards ?? false),
      has_essay: has_essay !== undefined ? has_essay : (current?.has_essay ?? false),
    }, { onConflict: 'user_id,plan_id,week_idx' });

    res.json({ success: true });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
