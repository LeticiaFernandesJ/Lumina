const router = require('express').Router();
const { geminiGenerate, extractJSON } = require('../utils/gemini');
const { supabase } = require('../db/database');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const sb = supabase();
  const { data, error } = await sb.from('study_plans').select('id, topic_name, created_at').eq('user_id', req.userId).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/:id', auth, async (req, res) => {
  const sb = supabase();
  const { data, error } = await sb.from('study_plans').select('*').eq('id', req.params.id).eq('user_id', req.userId).single();
  if (error || !data) return res.status(404).json({ error: 'Não encontrado' });
  if (typeof data.plan_json === 'string') data.plan_json = JSON.parse(data.plan_json);
  res.json(data);
});

router.post('/generate', auth, async (req, res) => {
  try {
    const { topic_name, duration, level, hours_per_week } = req.body;
    const durationMap = { '1sem': '1 semana', '2sem': '2 semanas', '1mes': '1 mês', '3meses': '3 meses' };
    const weeksMap = { '1sem': 1, '2sem': 2, '1mes': 4, '3meses': 12 };
    const durationLabel = durationMap[duration] || duration;
    const totalWeeks = weeksMap[duration] || 4;

    const prompt = `Crie um plano de estudos em português brasileiro para: "${topic_name}".
Duração: ${durationLabel} (${totalWeeks} semanas). Nível: ${level}. Horas/semana: ${hours_per_week}h.
Retorne SOMENTE JSON válido, sem markdown:
{"title":"título","weeks":[{"week":1,"theme":"tema","goals":["meta"],"daily_tasks":[{"day":"Segunda","task":"tarefa","duration_min":60}],"flashcards":["conceito"],"essay_prompt":"proposta"}]}`;

    const raw = await geminiGenerate(process.env.GEMINI_API_KEY, prompt);
    const plan = extractJSON(raw);
    if (!plan.weeks || !Array.isArray(plan.weeks)) throw new Error('Campo weeks ausente');

    const sb = supabase();
    const { data, error } = await sb.from('study_plans').insert({ user_id: req.userId, topic_name, plan_json: plan }).select('id').single();
    if (error) throw error;

    const today = new Date().toISOString().split('T')[0];
    await sb.from('frequency_log').insert({ user_id: req.userId, date: today, activity_type: 'study_plan' });

    res.json({ id: data.id, plan });
  } catch (e) {
    console.error('❌ Erro generate plan:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.post('/generate-week-flashcards', auth, async (req, res) => {
  try {
    const { weekIdx, theme, concepts, topic } = req.body;
    const prompt = `Gere 10 flashcards em português sobre: "${theme}" (plano: ${topic}). Conceitos: ${concepts}.
Retorne SOMENTE array JSON: [{"question":"pergunta","answer":"resposta"}]`;

    const raw = await geminiGenerate(process.env.GEMINI_API_KEY, prompt);
    const cards = extractJSON(raw);
    if (!Array.isArray(cards)) throw new Error('Resposta inválida');

    const sb = supabase();
    const rows = cards.map(c => ({ user_id: req.userId, material_id: null, question: c.question, answer: c.answer, source_type: 'plan', topic_name: theme }));
    await sb.from('flashcards').insert(rows);

    const today = new Date().toISOString().split('T')[0];
    await sb.from('frequency_log').insert({ user_id: req.userId, date: today, activity_type: 'generate_flashcards' });

    res.json({ generated: cards.length, cards });
  } catch (e) {
    console.error('❌ Erro week flashcards:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const sb = supabase();
  await sb.from('study_plans').delete().eq('id', req.params.id).eq('user_id', req.userId);
  res.json({ success: true });
});

module.exports = router;
