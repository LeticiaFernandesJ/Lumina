const router = require('express').Router();
const { geminiGenerate, extractJSON } = require('../utils/gemini');
const db = require('../db/database');
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  const plans = db.prepare('SELECT id, topic_name, created_at FROM study_plans WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(plans);
});

router.get('/:id', auth, (req, res) => {
  const plan = db.prepare('SELECT * FROM study_plans WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
  if (!plan) return res.status(404).json({ error: 'Não encontrado' });
  plan.plan_json = JSON.parse(plan.plan_json);
  res.json(plan);
});

router.post('/generate', auth, async (req, res) => {
  try {
    const { topic_name, duration, level, hours_per_week } = req.body;
    const durationMap = { '1sem': '1 semana', '2sem': '2 semanas', '1mes': '1 mês', '3meses': '3 meses' };
    const durationLabel = durationMap[duration] || duration;
    const weeksMap = { '1sem': 1, '2sem': 2, '1mes': 4, '3meses': 12 };
    const totalWeeks = weeksMap[duration] || 4;

    console.log(`Gerando plano: ${topic_name} / ${durationLabel} / ${level} / ${hours_per_week}h`);

    const prompt = `Crie um plano de estudos em português brasileiro para o tema: "${topic_name}".
Duração: ${durationLabel} (${totalWeeks} semanas). Nível: ${level}. Horas por semana: ${hours_per_week}h.

Retorne SOMENTE um objeto JSON válido, sem texto antes ou depois, sem markdown.
Use exatamente este formato:
{
  "title": "título do plano",
  "weeks": [
    {
      "week": 1,
      "theme": "tema da semana",
      "goals": ["meta 1", "meta 2"],
      "daily_tasks": [
        {"day": "Segunda", "task": "descrição", "duration_min": 60}
      ],
      "flashcards": ["conceito 1", "conceito 2"],
      "essay_prompt": "proposta de redação"
    }
  ]
}`;

    const raw = await geminiGenerate(process.env.GEMINI_API_KEY, prompt);
    console.log('Resposta (primeiros 300):', raw.slice(0, 300));

    const plan = extractJSON(raw);
    if (!plan.weeks || !Array.isArray(plan.weeks)) throw new Error('Campo "weeks" ausente no plano');

    const result = db.prepare('INSERT INTO study_plans (user_id, topic_name, plan_json) VALUES (?, ?, ?)').run(req.userId, topic_name, JSON.stringify(plan));
    const today = new Date().toISOString().split('T')[0];
    db.prepare('INSERT INTO frequency_log (user_id, date, activity_type) VALUES (?, ?, ?)').run(req.userId, today, 'study_plan');

    console.log('✅ Plano gerado, id:', result.lastInsertRowid);
    res.json({ id: result.lastInsertRowid, plan });
  } catch (e) {
    console.error('❌ Erro generate plan:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM study_plans WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

module.exports = router;
