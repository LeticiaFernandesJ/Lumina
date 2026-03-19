const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const { geminiGenerate, extractJSON } = require('../utils/gemini');
const { supabase } = require('../db/database');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage, fileFilter: (req, file, cb) => {
  if (file.mimetype === 'application/pdf') cb(null, true);
  else cb(new Error('Apenas PDFs são permitidos'));
}, limits: { fileSize: 20 * 1024 * 1024 } });

router.get('/', auth, async (req, res) => {
  const sb = supabase();
  const { data, error } = await sb.from('study_materials').select('id, title, filename, created_at').eq('user_id', req.userId).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

router.post('/upload', auth, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    const buffer = fs.readFileSync(req.file.path);
    const pdfData = await pdf(buffer);
    const title = req.body.title || req.file.originalname.replace('.pdf', '');
    const sb = supabase();
    const { data, error } = await sb.from('study_materials').insert({ user_id: req.userId, title, filename: req.file.filename, extracted_text: pdfData.text }).select('id, title, filename, created_at').single();
    if (error) throw error;
    const today = new Date().toISOString().split('T')[0];
    await sb.from('frequency_log').insert({ user_id: req.userId, date: today, activity_type: 'upload_pdf' });
    res.json(data);
  } catch (e) {
    console.error('Erro upload:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/generate-flashcards', auth, async (req, res) => {
  try {
    const { count = 10 } = req.body;
    const sb = supabase();
    const { data: material } = await sb.from('study_materials').select('*').eq('id', req.params.id).eq('user_id', req.userId).single();
    if (!material) return res.status(404).json({ error: 'Material não encontrado' });

    const textSnippet = (material.extracted_text || '').slice(0, 8000);
    console.log(`Gerando ${count} flashcards para material ${material.id}...`);

    const prompt = `Gere exatamente ${count} flashcards de estudo em português brasileiro com base no texto abaixo.
Retorne SOMENTE um array JSON, sem nenhum texto antes ou depois, sem markdown.
Formato: [{"question": "pergunta", "answer": "resposta"}]
Texto: ${textSnippet || 'Gere flashcards sobre: ' + material.title}`;

    const raw = await geminiGenerate(process.env.GEMINI_API_KEY, prompt);
    const cards = extractJSON(raw);
    if (!Array.isArray(cards)) throw new Error('Resposta inválida da IA');

    const rows = cards.map(c => ({ user_id: req.userId, material_id: material.id, question: c.question, answer: c.answer, source_type: 'pdf', topic_name: material.title }));
    const { error } = await sb.from('flashcards').insert(rows);
    if (error) throw error;

    const today = new Date().toISOString().split('T')[0];
    await sb.from('frequency_log').insert({ user_id: req.userId, date: today, activity_type: 'generate_flashcards' });

    console.log(`✅ ${cards.length} flashcards inseridos`);
    res.json({ generated: cards.length, cards });
  } catch (e) {
    console.error('❌ Erro generate-flashcards:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', auth, async (req, res) => {
  const sb = supabase();
  await sb.from('study_materials').delete().eq('id', req.params.id).eq('user_id', req.userId);
  res.json({ success: true });
});

module.exports = router;
