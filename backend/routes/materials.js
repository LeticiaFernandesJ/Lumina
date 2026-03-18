const router = require('express').Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pdf = require('pdf-parse');
const { geminiGenerate, extractJSON } = require('../utils/gemini');
const db = require('../db/database');
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

router.get('/', auth, (req, res) => {
  const materials = db.prepare('SELECT id, title, filename, created_at FROM study_materials WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(materials);
});

router.post('/upload', auth, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    const buffer = fs.readFileSync(req.file.path);
    const data = await pdf(buffer);
    const title = req.body.title || req.file.originalname.replace('.pdf', '');
    const result = db.prepare('INSERT INTO study_materials (user_id, title, filename, extracted_text) VALUES (?, ?, ?, ?)').run(req.userId, title, req.file.filename, data.text);
    const today = new Date().toISOString().split('T')[0];
    db.prepare('INSERT INTO frequency_log (user_id, date, activity_type) VALUES (?, ?, ?)').run(req.userId, today, 'upload_pdf');
    res.json({ id: result.lastInsertRowid, title, filename: req.file.filename, created_at: new Date().toISOString() });
  } catch (e) {
    console.error('Erro upload:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.post('/:id/generate-flashcards', auth, async (req, res) => {
  try {
    const { count = 10 } = req.body;
    const material = db.prepare('SELECT * FROM study_materials WHERE id = ? AND user_id = ?').get(req.params.id, req.userId);
    if (!material) return res.status(404).json({ error: 'Material não encontrado' });

    const textSnippet = (material.extracted_text || '').slice(0, 8000);
    console.log(`Gerando ${count} flashcards para material ${material.id}...`);

    const prompt = `Gere exatamente ${count} flashcards de estudo em português brasileiro com base no texto abaixo.
Retorne SOMENTE um array JSON, sem nenhum texto antes ou depois, sem markdown, sem explicações.
Formato obrigatório: [{"question": "pergunta aqui", "answer": "resposta aqui"}]

Texto:
${textSnippet || 'Gere flashcards gerais sobre o tema: ' + material.title}`;

    const raw = await geminiGenerate(process.env.GEMINI_API_KEY, prompt);
    console.log('Resposta (primeiros 300):', raw.slice(0, 300));

    const cards = extractJSON(raw);
    if (!Array.isArray(cards)) throw new Error('Resposta da IA não é um array');

    for (const c of cards) {
      db.prepare('INSERT INTO flashcards (user_id, material_id, question, answer, source_type, topic_name) VALUES (?, ?, ?, ?, ?, ?)')
        .run(req.userId, material.id, c.question, c.answer, 'pdf', material.title);
    }

    const today = new Date().toISOString().split('T')[0];
    db.prepare('INSERT INTO frequency_log (user_id, date, activity_type) VALUES (?, ?, ?)').run(req.userId, today, 'generate_flashcards');

    console.log(`✅ ${cards.length} flashcards inseridos`);
    res.json({ generated: cards.length, cards });
  } catch (e) {
    console.error('❌ Erro generate-flashcards:', e.message);
    res.status(500).json({ error: e.message });
  }
});

router.delete('/:id', auth, (req, res) => {
  db.prepare('DELETE FROM study_materials WHERE id = ? AND user_id = ?').run(req.params.id, req.userId);
  res.json({ success: true });
});

module.exports = router;
