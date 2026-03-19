import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContext } from '../components/Layout';
import api from '../utils/api';

function ScoreMeter({ score }) {
  const color = score >= 8 ? '#4CAF50' : score >= 6 ? '#C9A84C' : '#E57373';
  const circumference = 2 * Math.PI * 60;
  const dash = (score / 10) * circumference;
  return (
    <div style={{ textAlign: 'center', padding: '24px 0' }}>
      <div style={{ position: 'relative', width: 140, height: 140, margin: '0 auto 16px' }}>
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle cx="70" cy="70" r="60" fill="none" stroke="#1E1E1E" strokeWidth="10" />
          <circle cx="70" cy="70" r="60" fill="none" stroke={color} strokeWidth="10"
            strokeDasharray={`${dash} ${circumference}`} strokeLinecap="round"
            transform="rotate(-90 70 70)" style={{ transition: 'stroke-dasharray 1s ease' }} />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <span style={{ fontSize: 32, fontWeight: 700, fontFamily: 'Playfair Display, serif', color }}>{score}</span>
          <span style={{ fontSize: 12, color: '#7A7060' }}>/ 10</span>
        </div>
      </div>
    </div>
  );
}

function Accordion({ title, children, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ border: '1px solid #2A2A2A', borderRadius: 12, marginBottom: 10, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', padding: '14px 18px', background: '#111', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', color: '#E8DCC8', fontSize: 14, fontWeight: 500, border: 'none' }}>
        {title}
        <span style={{ color: '#C9A84C', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '16px 18px', borderTop: '1px solid #1E1E1E' }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Seletor de tema com 3 modos
function TopicSelector({ topic, setTopic, pdfs, plans, loadingPdfs }) {
  const [mode, setMode] = useState('digitar');

  const modes = [
    { id: 'digitar', label: '✏️ Digitar tema' },
    { id: 'pdf', label: `📄 Usar PDF ${pdfs.length > 0 ? `(${pdfs.length})` : ''}` },
    { id: 'plano', label: `📅 Usar Plano ${plans.length > 0 ? `(${plans.length})` : ''}` },
  ];

  const formatDate = (val) => {
    if (!val) return '';
    try { return new Date(val).toLocaleDateString('pt-BR'); } catch { return ''; }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 10 }}>Tema da redação</label>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        {modes.map(m => (
          <button key={m.id} onClick={() => { setMode(m.id); if (m.id !== 'digitar') setTopic(''); }} style={{
            padding: '7px 14px', borderRadius: 20, border: '1px solid', cursor: 'pointer',
            fontFamily: 'DM Sans, sans-serif', fontSize: 12, transition: 'all 0.2s',
            borderColor: mode === m.id ? '#C9A84C' : '#2A2A2A',
            background: mode === m.id ? 'rgba(201,168,76,0.15)' : '#111',
            color: mode === m.id ? '#C9A84C' : '#7A7060',
          }}>{m.label}</button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {mode === 'digitar' && (
          <motion.div key="digitar" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            <input
              value={topic}
              onChange={e => setTopic(e.target.value)}
              placeholder="Ex: Desigualdade educacional no Brasil..."
            />
          </motion.div>
        )}

        {mode === 'pdf' && (
          <motion.div key="pdf" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            {loadingPdfs ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>
                <span className="spinner" style={{ width: 24, height: 24 }} />
              </div>
            ) : pdfs.length === 0 ? (
              <div style={{ padding: '16px', background: '#111', borderRadius: 10, border: '1px solid #2A2A2A', fontSize: 13, color: '#7A7060', lineHeight: 1.6 }}>
                Nenhum PDF encontrado. Vá em <strong style={{ color: '#C9A84C' }}>Meus PDFs</strong> e faça o upload de um arquivo.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                {pdfs.map(p => {
                  const isSelected = topic === p.title;
                  return (
                    <button key={p.id} onClick={() => setTopic(p.title)} style={{
                      textAlign: 'left', padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                      border: `1px solid ${isSelected ? '#C9A84C' : '#2A2A2A'}`,
                      background: isSelected ? 'rgba(201,168,76,0.1)' : '#111',
                      fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s', width: '100%',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 22, flexShrink: 0 }}>📄</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, color: isSelected ? '#C9A84C' : '#E8DCC8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.title || p.filename || 'Sem título'}
                          </div>
                          {p.created_at && (
                            <div style={{ fontSize: 11, color: '#7A7060', marginTop: 2 }}>{formatDate(p.created_at)}</div>
                          )}
                        </div>
                        {isSelected && <span style={{ color: '#C9A84C', fontSize: 18, flexShrink: 0 }}>✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}

        {mode === 'plano' && (
          <motion.div key="plano" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}>
            {plans.length === 0 ? (
              <div style={{ padding: '16px', background: '#111', borderRadius: 10, border: '1px solid #2A2A2A', fontSize: 13, color: '#7A7060', lineHeight: 1.6 }}>
                Nenhum plano criado. Vá em <strong style={{ color: '#C9A84C' }}>Plano de Estudos</strong> para criar um.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto' }}>
                {plans.map(p => {
                  const isSelected = topic === p.topic_name;
                  return (
                    <button key={p.id} onClick={() => setTopic(p.topic_name)} style={{
                      textAlign: 'left', padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                      border: `1px solid ${isSelected ? '#C9A84C' : '#2A2A2A'}`,
                      background: isSelected ? 'rgba(201,168,76,0.1)' : '#111',
                      fontFamily: 'DM Sans, sans-serif', transition: 'all 0.2s', width: '100%',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 22, flexShrink: 0 }}>📅</span>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 14, fontWeight: 500, color: isSelected ? '#C9A84C' : '#E8DCC8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {p.topic_name}
                          </div>
                          {p.created_at && (
                            <div style={{ fontSize: 11, color: '#7A7060', marginTop: 2 }}>{formatDate(p.created_at)}</div>
                          )}
                        </div>
                        {isSelected && <span style={{ color: '#C9A84C', fontSize: 18, flexShrink: 0 }}>✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {topic && mode !== 'digitar' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{
          marginTop: 10, padding: '10px 14px', background: 'rgba(201,168,76,0.08)',
          border: '1px solid rgba(201,168,76,0.25)', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
        }}>
          <span style={{ fontSize: 13, color: '#C9A84C', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>✓ {topic}</span>
          <button onClick={() => setTopic('')} style={{ background: 'transparent', color: '#7A7060', border: 'none', cursor: 'pointer', fontSize: 16, padding: '2px 6px', flexShrink: 0 }}>✕</button>
        </motion.div>
      )}
    </div>
  );
}

export default function Redacao() {
  const location = useLocation();
  const [topic, setTopic] = useState(location.state?.topic || '');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [history, setHistory] = useState([]);
  const [pdfs, setPdfs] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loadingPdfs, setLoadingPdfs] = useState(true);
  const [showHistory, setShowHistory] = useState(false);
  const [selectedEssay, setSelectedEssay] = useState(null);
  const toast = useContext(ToastContext);

  const wordCount = content.trim().split(/\s+/).filter(Boolean).length;

  useEffect(() => {
    api.get('/api/essays').then(r => setHistory(r.data)).catch(() => {});
    api.get('/api/materials').then(r => { setPdfs(r.data); }).catch(() => {}).finally(() => setLoadingPdfs(false));
    api.get('/api/plans').then(r => setPlans(r.data)).catch(() => {});
  }, []);

  const analyze = async () => {
    if (!topic.trim()) return toast('Informe o tema da redação', 'warning');
    if (wordCount < 20) return toast('Escreva pelo menos 20 palavras', 'warning');
    setLoading(true);
    setFeedback(null);
    try {
      const { data } = await api.post('/api/essays/analyze', { topic_name: topic, content });
      setFeedback(data.feedback);
      toast('Redação corrigida com sucesso!', 'success');
      api.get('/api/essays').then(r => setHistory(r.data));
    } catch (e) {
      toast(e.response?.data?.error || 'Erro ao analisar redação', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadEssay = async (id) => {
    const { data } = await api.get(`/api/essays/${id}`);
    setSelectedEssay(data);
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>Re<span className="gold-gradient">dação</span></h1>
          <p style={{ color: '#7A7060' }}>Escreva e receba correção detalhada com IA</p>
        </div>
        <button onClick={() => setShowHistory(!showHistory)} className="btn-secondary" style={{ fontSize: 14 }}>
          {showHistory ? '✏️ Escrever' : `📋 Histórico (${history.length})`}
        </button>
      </motion.div>

      {!showHistory ? (
        <div style={{ display: 'grid', gridTemplateColumns: feedback ? '1fr 1fr' : '1fr', gap: 24 }}>
          {/* Editor */}
          <motion.div layout className="card">
            <h2 style={{ fontSize: 18, marginBottom: 20 }}>Editor</h2>

            {/* Seletor de tema */}
            <TopicSelector topic={topic} setTopic={setTopic} pdfs={pdfs} plans={plans} loadingPdfs={loadingPdfs} />

            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Escreva sua redação aqui..."
              style={{ minHeight: 320, resize: 'vertical', lineHeight: 1.8, fontSize: 15 }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 }}>
              <span style={{ fontSize: 13, color: wordCount > 300 ? '#4CAF50' : '#7A7060' }}>{wordCount} palavras</span>
              <button onClick={analyze} disabled={loading} className="btn-primary" style={{ padding: '11px 24px' }}>
                {loading ? (
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Analisando...
                  </span>
                ) : '✨ Corrigir com IA'}
              </button>
            </div>
          </motion.div>

          {/* Feedback */}
          {feedback && (
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} className="card" style={{ overflowY: 'auto', maxHeight: '80vh' }}>
              <h2 style={{ fontSize: 18, marginBottom: 4 }}>Resultado</h2>
              <p style={{ fontSize: 13, color: '#7A7060', marginBottom: 4 }}>{topic}</p>
              <ScoreMeter score={feedback.score} />
              <p style={{ color: '#C4B89A', fontSize: 14, lineHeight: 1.7, marginBottom: 20, padding: '14px', background: '#111', borderRadius: 10 }}>{feedback.general_feedback}</p>

              <Accordion title="✅ Pontos fortes" defaultOpen>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {feedback.strengths?.map((s, i) => (
                    <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: '#C4B89A' }}>
                      <span style={{ color: '#4CAF50', marginTop: 2 }}>✓</span>{s}
                    </li>
                  ))}
                </ul>
              </Accordion>

              <Accordion title="📈 Melhorias sugeridas" defaultOpen>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {feedback.improvements?.map((imp, i) => (
                    <div key={i} style={{ background: '#111', borderRadius: 10, padding: 14, borderLeft: '3px solid #C9A84C' }}>
                      <div style={{ fontSize: 12, color: '#C9A84C', fontWeight: 600, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 }}>{imp.category}</div>
                      <div style={{ fontSize: 13, color: '#E57373', marginBottom: 6 }}>{imp.issue}</div>
                      <div style={{ fontSize: 13, color: '#C4B89A' }}>{imp.suggestion}</div>
                    </div>
                  ))}
                </div>
              </Accordion>

              {feedback.rewritten_intro && (
                <Accordion title="✍️ Introdução reescrita">
                  <p style={{ fontSize: 14, color: '#C4B89A', lineHeight: 1.7, fontStyle: 'italic' }}>{feedback.rewritten_intro}</p>
                </Accordion>
              )}
            </motion.div>
          )}
        </div>
      ) : (
        <div>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#7A7060' }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>✍️</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#C4B89A' }}>Nenhuma redação ainda</h3>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
              {history.map((e, i) => (
                <motion.div key={e.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="card" style={{ cursor: 'pointer' }} onClick={() => loadEssay(e.id)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span className="tag">✍️ Redação</span>
                    <span style={{ fontSize: 20, fontWeight: 700, fontFamily: 'Playfair Display, serif', color: '#C9A84C' }}>{e.score}/10</span>
                  </div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, marginBottom: 8 }}>{e.topic_name}</h3>
                  <p style={{ fontSize: 12, color: '#7A7060' }}>{new Date(e.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal redação salva */}
      <AnimatePresence>
        {selectedEssay && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 20, padding: 32, maxWidth: 620, width: '100%', maxHeight: '80vh', overflowY: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h2 style={{ fontFamily: 'Playfair Display, serif' }}>{selectedEssay.topic_name}</h2>
                <button onClick={() => setSelectedEssay(null)} style={{ background: 'transparent', color: '#7A7060', fontSize: 20, padding: '4px 8px', cursor: 'pointer', border: 'none' }}>✕</button>
              </div>
              <ScoreMeter score={selectedEssay.score} />
              {selectedEssay.feedback_json?.general_feedback && (
                <p style={{ color: '#C4B89A', fontSize: 14, lineHeight: 1.7, padding: '14px', background: '#111', borderRadius: 10, marginBottom: 16 }}>{selectedEssay.feedback_json.general_feedback}</p>
              )}
              <div style={{ fontSize: 14, color: '#7A7060', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selectedEssay.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
