import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContext } from '../components/Layout';
import api from '../utils/api';

function FlipCard({ card, revealed, onReveal }) {
  return (
    <div style={{ perspective: 1000, width: '100%', maxWidth: 560, margin: '0 auto', height: 280, cursor: revealed ? 'default' : 'pointer' }} onClick={!revealed ? onReveal : undefined}>
      <motion.div
        animate={{ rotateY: revealed ? 180 : 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200, damping: 20 }}
        style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          background: '#161616', border: '1px solid #2A2A2A', borderRadius: 20, padding: '36px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>Pergunta</div>
          <div style={{ fontSize: 18, fontFamily: 'Playfair Display, serif', lineHeight: 1.5, color: '#E8DCC8' }}>{card.question}</div>
          {!revealed && <div style={{ marginTop: 24, fontSize: 13, color: '#7A7060' }}>Clique para revelar a resposta</div>}
        </div>

        {/* Back */}
        <div style={{
          position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
          transform: 'rotateY(180deg)',
          background: 'linear-gradient(135deg, rgba(201,168,76,0.08), rgba(201,168,76,0.03))',
          border: '1px solid rgba(201,168,76,0.3)', borderRadius: 20, padding: '36px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center',
        }}>
          <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 20 }}>Resposta</div>
          <div style={{ fontSize: 16, fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6, color: '#E8DCC8' }}>{card.answer}</div>
        </div>
      </motion.div>
    </div>
  );
}

function ReviewSession({ cards, onFinish }) {
  const [idx, setIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [scores, setScores] = useState([]);
  const [startTime] = useState(Date.now());
  const toast = useContext(ToastContext);

  const current = cards[idx];
  const total = cards.length;

  const evaluate = async (val) => {
    const newScores = [...scores, val];
    if (idx < total - 1) {
      setScores(newScores);
      setIdx(idx + 1);
      setRevealed(false);
    } else {
      // Finish session
      const avgScore = (newScores.reduce((a, b) => a + b, 0) / total) * 100 / 2;
      const duration = Math.round((Date.now() - startTime) / 60000);
      try {
        await api.post('/api/flashcards/session', { duration_minutes: Math.max(1, duration), topic: cards[0]?.topic_name || 'Geral', cards_reviewed: total, score_percent: avgScore });
      } catch {}
      onFinish({ scores: newScores, total, avgScore });
    }
  };

  return (
    <div>
      {/* Progress */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7A7060', marginBottom: 8 }}>
          <span>Card {idx + 1} de {total}</span>
          <span>{Math.round((idx / total) * 100)}% concluído</span>
        </div>
        <div style={{ background: '#1E1E1E', borderRadius: 4, height: 6 }}>
          <motion.div animate={{ width: `${(idx / total) * 100}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, #C9A84C, #E6C56B)', borderRadius: 4 }} />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={idx} initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -40 }} transition={{ duration: 0.25 }}>
          <FlipCard card={current} revealed={revealed} onReveal={() => setRevealed(true)} />
        </motion.div>
      </AnimatePresence>

      {revealed && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: 14, marginTop: 28, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { label: '😕 Não sabia', val: 0, color: '#E57373', bg: 'rgba(229,115,115,0.1)' },
            { label: '🤔 Sabia', val: 1, color: '#FFB74D', bg: 'rgba(255,183,77,0.1)' },
            { label: '✅ Sabia bem', val: 2, color: '#4CAF50', bg: 'rgba(76,175,80,0.1)' },
          ].map(opt => (
            <button key={opt.val} onClick={() => evaluate(opt.val)} style={{
              padding: '13px 28px', borderRadius: 12, border: `1px solid ${opt.color}50`,
              background: opt.bg, color: opt.color, fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, cursor: 'pointer', transition: 'all 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}
            >
              {opt.label}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  );
}

function SessionResult({ result, onRestart, onExit }) {
  const pct = Math.round(result.avgScore);
  const knew = result.scores.filter(s => s > 0).length;
  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>{pct >= 70 ? '🏆' : pct >= 40 ? '👍' : '💪'}</div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, marginBottom: 8 }}>Sessão concluída!</h2>
      <p style={{ color: '#7A7060', marginBottom: 32 }}>Você revisou {result.total} flashcards</p>
      <div style={{ fontSize: 72, fontWeight: 700, fontFamily: 'Playfair Display, serif', color: '#C9A84C', marginBottom: 8 }}>{pct}%</div>
      <p style={{ color: '#C4B89A', marginBottom: 8 }}>{knew} de {result.total} cards corretos</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 32 }}>
        <button onClick={onRestart} className="btn-secondary">Repetir sessão</button>
        <button onClick={onExit} className="btn-primary">Voltar aos cards</button>
      </div>
    </motion.div>
  );
}

export default function Flashcards() {
  const [cards, setCards] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('browse'); // browse | review | result
  const [sessionResult, setSessionResult] = useState(null);
  const toast = useContext(ToastContext);

  useEffect(() => {
    Promise.all([api.get('/api/flashcards'), api.get('/api/flashcards/topics')])
      .then(([cr, tr]) => { setCards(cr.data); setFiltered(cr.data); setTopics(tr.data); })
      .catch(() => toast?.('Erro ao carregar flashcards', 'error'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    setFiltered(selectedTopic ? cards.filter(c => c.topic_name === selectedTopic) : cards);
  }, [selectedTopic, cards]);

  const startReview = () => {
    if (filtered.length === 0) return toast?.('Nenhum flashcard para revisar', 'warning');
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setFiltered(shuffled);
    setMode('review');
  };

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><span className="spinner" /></div>;

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 32, marginBottom: 4 }}>Flash<span className="gold-gradient">cards</span></h1>
          <p style={{ color: '#7A7060' }}>{filtered.length} cards · {topics.length} temas</p>
        </div>
        {mode === 'browse' && filtered.length > 0 && (
          <button onClick={startReview} className="btn-primary" style={{ padding: '12px 28px' }}>▶ Iniciar Revisão</button>
        )}
      </motion.div>

      {mode === 'browse' && (
        <>
          {/* Filters */}
          <div style={{ display: 'flex', gap: 10, marginBottom: 28, flexWrap: 'wrap' }}>
            <button onClick={() => setSelectedTopic('')} style={{
              padding: '8px 18px', borderRadius: 20, border: '1px solid', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, transition: 'all 0.2s',
              borderColor: !selectedTopic ? '#C9A84C' : '#2A2A2A', background: !selectedTopic ? 'rgba(201,168,76,0.15)' : 'transparent', color: !selectedTopic ? '#C9A84C' : '#7A7060',
            }}>Todos</button>
            {topics.map(t => (
              <button key={t} onClick={() => setSelectedTopic(t)} style={{
                padding: '8px 18px', borderRadius: 20, border: '1px solid', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, transition: 'all 0.2s',
                borderColor: selectedTopic === t ? '#C9A84C' : '#2A2A2A', background: selectedTopic === t ? 'rgba(201,168,76,0.15)' : 'transparent', color: selectedTopic === t ? '#C9A84C' : '#7A7060',
              }}>{t}</button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7A7060' }}>
              <div style={{ fontSize: 56, marginBottom: 12 }}>🃏</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#C4B89A', marginBottom: 8 }}>Nenhum flashcard ainda</h3>
              <p>Gere flashcards a partir dos seus PDFs!</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {filtered.slice(0, 40).map((c, i) => (
                <motion.div key={c.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.03, 0.5) }} className="card" style={{ borderRadius: 16 }}>
                  <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 600, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>P</div>
                  <p style={{ fontSize: 14, marginBottom: 16, color: '#E8DCC8', lineHeight: 1.5 }}>{c.question}</p>
                  <div style={{ height: 1, background: '#1E1E1E', margin: '12px 0' }} />
                  <div style={{ fontSize: 11, color: '#7A7060', fontWeight: 600, letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>R</div>
                  <p style={{ fontSize: 13, color: '#C4B89A', lineHeight: 1.5 }}>{c.answer}</p>
                  {c.topic_name && <div style={{ marginTop: 12 }}><span className="tag">{c.topic_name}</span></div>}
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      {mode === 'review' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="card" style={{ maxWidth: 680, margin: '0 auto' }}>
            <ReviewSession
              cards={filtered}
              onFinish={(result) => { setSessionResult(result); setMode('result'); }}
            />
          </div>
        </motion.div>
      )}

      {mode === 'result' && sessionResult && (
        <div className="card" style={{ maxWidth: 540, margin: '0 auto' }}>
          <SessionResult
            result={sessionResult}
            onRestart={() => { setMode('review'); setSessionResult(null); }}
            onExit={() => { setMode('browse'); setSessionResult(null); }}
          />
        </div>
      )}
    </div>
  );
}
