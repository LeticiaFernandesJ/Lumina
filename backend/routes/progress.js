const router = require('express').Router();
const db = require('../db/database');
const auth = require('../middleware/auth');

// Busca todo o progresso de um plano
router.get('/:planId', auth, (req, res) => {
  try {
    const { planId } = req.params;
    const tasks = db.prepare('SELECT week_idx, task_idx, done FROM plan_progress WHERE user_id = ? AND plan_id = ?').all(req.userId, planId);
    const weeks = db.prepare('SELECT week_idx, has_flashcards, has_essay FROM plan_week_status WHERE user_id = ? AND plan_id = ?').all(req.userId, planId);

    // Monta objeto checked: { weekIdx: { taskIdx: true/false } }
    const checked = {};
    tasks.forEach(t => {
      if (!checked[t.week_idx]) checked[t.week_idx] = {};
      checked[t.week_idx][t.task_idx] = t.done === 1;
    });

    const hasFlashcards = {};
    const hasEssay = {};
    weeks.forEach(w => {
      hasFlashcards[w.week_idx] = w.has_flashcards === 1;
      hasEssay[w.week_idx] = w.has_essay === 1;
    });

    res.json({ checked, hasFlashcards, hasEssay });
  } catch (e) {
    console.error('Erro get progress:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Salva estado de uma tarefa
router.post('/:planId/task', auth, (req, res) => {
  try {
    const { planId } = req.params;
    const { weekIdx, taskIdx, done } = req.body;

    db.prepare(`
      INSERT INTO plan_progress (user_id, plan_id, week_idx, task_idx, done)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, plan_id, week_idx, task_idx)
      DO UPDATE SET done = excluded.done, updated_at = CURRENT_TIMESTAMP
    `).run(req.userId, planId, weekIdx, taskIdx, done ? 1 : 0);

    res.json({ success: true });
  } catch (e) {
    console.error('Erro save task:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// Salva status de flashcards/redação de uma semana
router.post('/:planId/week', auth, (req, res) => {
  try {
    const { planId } = req.params;
    const { weekIdx, has_flashcards, has_essay } = req.body;

    // Busca estado atual
    const current = db.prepare('SELECT * FROM plan_week_status WHERE user_id = ? AND plan_id = ? AND week_idx = ?').get(req.userId, planId, weekIdx);

    const newFlashcards = has_flashcards !== undefined ? (has_flashcards ? 1 : 0) : (current?.has_flashcards ?? 0);
    const newEssay = has_essay !== undefined ? (has_essay ? 1 : 0) : (current?.has_essay ?? 0);

    db.prepare(`
      INSERT INTO plan_week_status (user_id, plan_id, week_idx, has_flashcards, has_essay)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id, plan_id, week_idx)
      DO UPDATE SET has_flashcards = excluded.has_flashcards, has_essay = excluded.has_essay, updated_at = CURRENT_TIMESTAMP
    `).run(req.userId, planId, weekIdx, newFlashcards, newEssay);

    res.json({ success: true });
  } catch (e) {
    console.error('Erro save week:', e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
