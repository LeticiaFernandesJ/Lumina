const router = require('express').Router();
const { geminiGenerate, extractJSON } = require('../utils/gemini');
const db = require('../db/database');
const auth = require('../middleware/auth');

router.get('/', auth, (req, res) => {
  try {
    const essays = db.prepare('SELECT id, topic_name, score, created_at FROM essays WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
    res.json(essays);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.get('/:id', auth, (req, res) => {
  try {
    const essay = db.prepare('SELECT * FROM essays WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!essay) return res.status(404).json({ error: 'Não encontrado' });
    try { essay.feedback_json = JSON.parse(essay.feedback_json || 'null'); } catch {}
    res.json(essay);
  } catch (e) { res.status(500).json({ error: e.message }); }
});

router.post('/analyze', auth, async (req, res) => {
  try {
    const { topic_name, content } = req.body;
    if (!content || content.trim().length < 50) {
      return res.status(400).json({ error: 'Redação muito curta (mínimo 50 caracteres)' });
    }

    console.log('Analisando redação, tema:', topic_name);

    const prompt = `Você é professor especializado em redações do ENEM. Analise a redação abaixo e responda APENAS com um objeto JSON válido, sem nenhum texto antes ou depois, sem markdown, sem comentários.

O JSON deve ter exatamente esta estrutura:
{"score":8.5,"general_feedback":"texto do feedback geral","strengths":["ponto 1","ponto 2"],"improvements":[{"category":"Coesão","issue":"problema encontrado","suggestion":"como melhorar"}],"rewritten_intro":"introdução reescrita melhorada"}

Tema: ${topic_name || 'Não informado'}
Redação:
${content.slice(0, 3000)}`;

    const raw = await geminiGenerate(process.env.GEMINI_API_KEY, prompt);
    console.log('Resposta (primeiros 300):', raw.slice(0, 300));

    const feedback = extractJSON(raw);
    if (typeof feedback.score !== 'number') feedback.score = 7.0;
    if (!feedback.general_feedback) feedback.general_feedback = 'Análise concluída.';
    if (!Array.isArray(feedback.strengths)) feedback.strengths = [];
    if (!Array.isArray(feedback.improvements)) feedback.improvements = [];

    const result = db.prepare('INSERT INTO essays (user_id, topic_name, content, feedback_json, score) VALUES (?, ?, ?, ?, ?)').run(req.userId, topic_name || 'Sem tema', content, JSON.stringify(feedback), feedback.score);
    const today = new Date().toISOString().split('T')[0];
    db.prepare('INSERT INTO frequency_log (user_id, date, activity_type) VALUES (?, ?, ?)').run(req.userId, today, 'essay');

    console.log('✅ Redação analisada, nota:', feedback.score);
    res.json({ id: result.lastInsertRowid, feedback });
  } catch (e) {
    console.error('❌ Erro analyze essay:', e.message);
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;
