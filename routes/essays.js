const router = require('express').Router();
const { geminiGenerate, extractJSON } = require('../utils/gemini');
const { supabase } = require('../db/database');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
  const sb = supabase();
  const { data, error } = await sb.from('essays').select('id, topic_name, score, created_at').eq('user_id', req.userId).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.get('/:id', auth, async (req, res) => {
  const sb = supabase();
  const { data, error } = await sb.from('essays').select('*').eq('id', req.params.id).eq('user_id', req.userId).single();
  if (error || !data) return res.status(404).json({ error: 'Não encontrado' });
  if (data.feedback_json && typeof data.feedback_json === 'string') {
    try { data.feedback_json = JSON.parse(data.feedback_json); } catch {}
  }
  res.json(data);
});

router.post('/analyze', auth, async (req, res) => {
  try {
    const { topic_name, content } = req.body;
    if (!content || content.trim().length < 50) return res.status(400).json({ error: 'Redação muito curta' });

    console.log('Analisando redação:', topic_name);
    const prompt = `Você é professor especializado em redações do ENEM. Analise a redação abaixo e responda APENAS com um objeto JSON válido, sem texto antes ou depois, sem markdown.
{"score":8.5,"general_feedback":"feedback","strengths":["ponto 1"],"improvements":[{"category":"Coesão","issue":"problema","suggestion":"sugestão"}],"rewritten_intro":"introdução reescrita"}
Tema: ${topic_name || 'Não informado'}
Redação: ${content.slice(0, 3000)}`;

    const raw = await geminiGenerate(process.env.GEMINI_API_KEY, prompt);
    const feedback = extractJSON(raw);
    if (typeof feedback.score !== 'number') feedback.score = 7.0;
    if (!Array.isArray(feedback.strengths)) feedback.strengths = [];
    if (!Array.isArray(feedback.improvements)) feedback.improvements = [];

    const sb = supabase();
    const { data, error } = await sb.from('essays').insert({ user_id: req.userId, topic_name: topic_name || 'Sem tema', content, feedback_json: feedback, score: feedback.score }).select('id').single();
    if (error) throw error;

    const today = new Date().toISOString().split('T')[0];
    await sb.from('frequency_log').insert({ user_id: req.userId, date: today, activity_type: 'essay' });

    console.log('✅ Redação analisada, nota:', feedback.score);
    res.json({ id: data.id, feedback });
  } catch (e) {
    console.error('❌ Erro analyze essay:', e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
