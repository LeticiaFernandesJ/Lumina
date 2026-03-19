import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContext } from '../components/Layout';
import api from '../utils/api';

// Gera opções de múltipla escolha embaralhadas
function generateOptions(correctAnswer, allCards) {
  const others = allCards
    .filter(c => c.answer !== correctAnswer)
    .map(c => c.answer)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);

  const options = [...others, correctAnswer].sort(() => Math.random() - 0.5);
  return options;
}

function FlipCard({ card, allCards, onEvaluate }) {
  const [flipped, setFlipped] = useState(false);
  const [selected, setSelected] = useState(null); // resposta escolhida
  const [options] = useState(() => generateOptions(card.answer, allCards));
  const [result, setResult] = useState(null); // 'correct' | 'wrong'

  const handleSelect = (opt) => {
    if (selected) return; // já respondeu
    setSelected(opt);
    const isCorrect = opt === card.answer;
    setResult(isCorrect ? 'correct' : 'wrong');
    // Vira o card automaticamente após 600ms
    setTimeout(() => setFlipped(true), 600);
    // Após virar, avalia automaticamente após 1.5s
    setTimeout(() => onEvaluate(isCorrect ? 2 : 0, isCorrect), 2200);
  };

  const optionStyle = (opt) => {
    const isSelected = selected === opt;
    const isCorrect = opt === card.answer;
    let borderColor = '#2A2A2A';
    let bg = '#111';
    let color = '#C4B89A';

    if (selected) {
      if (isCorrect) { borderColor = '#4CAF50'; bg = 'rgba(76,175,80,0.12)'; color = '#4CAF50'; }
      else if (isSelected && !isCorrect) { borderColor = '#E57373'; bg = 'rgba(229,115,115,0.12)'; color = '#E57373'; }
    } else if (isSelected) {
      borderColor = '#C9A84C'; bg = 'rgba(201,168,76,0.1)'; color = '#C9A84C';
    }

    return {
      width: '100%', textAlign: 'left', padding: '11px 16px', borderRadius: 10,
      border: `1px solid ${borderColor}`, background: bg, color,
      fontFamily: 'DM Sans, sans-serif', fontSize: 13, cursor: selected ? 'default' : 'pointer',
      transition: 'all 0.25s', display: 'flex', alignItems: 'center', gap: 10,
    };
  };

  const letters = ['A', 'B', 'C', 'D'];

  return (
    <div style={{ width: '100%', maxWidth: 580, margin: '0 auto' }}>
      {/* Card com flip */}
      <div style={{ perspective: 1000, height: 180, marginBottom: 20 }}>
        <motion.div
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.55, type: 'spring', stiffness: 180, damping: 22 }}
          style={{ width: '100%', height: '100%', position: 'relative', transformStyle: 'preserve-3d' }}
        >
          {/* Frente — pergunta */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            background: '#161616', border: '1px solid #2A2A2A', borderRadius: 16,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            padding: '24px 32px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 10, color: '#C9A84C', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 14 }}>Pergunta</div>
            <div style={{ fontSize: 17, fontFamily: 'Playfair Display, serif', lineHeight: 1.5, color: '#E8DCC8' }}>{card.question}</div>
          </div>

          {/* Verso — resposta + resultado */}
          <div style={{
            position: 'absolute', inset: 0, backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: result === 'correct'
              ? 'linear-gradient(135deg, rgba(76,175,80,0.1), rgba(76,175,80,0.04))'
              : 'linear-gradient(135deg, rgba(229,115,115,0.1), rgba(229,115,115,0.04))',
            border: `1px solid ${result === 'correct' ? 'rgba(76,175,80,0.35)' : 'rgba(229,115,115,0.35)'}`,
            borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'center', padding: '24px 32px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>
              {result === 'correct' ? '🎉' : '💡'}
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: result === 'correct' ? '#4CAF50' : '#E57373', marginBottom: 8, letterSpacing: 1 }}>
              {result === 'correct' ? 'CORRETO!' : 'RESPOSTA CORRETA:'}
            </div>
            <div style={{ fontSize: 14, color: '#E8DCC8', lineHeight: 1.6 }}>{card.answer}</div>
          </div>
        </motion.div>
      </div>

      {/* Opções */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
        {options.map((opt, i) => (
          <motion.button
            key={i}
            onClick={() => handleSelect(opt)}
            style={optionStyle(opt)}
            whileHover={!selected ? { scale: 1.01 } : {}}
            whileTap={!selected ? { scale: 0.99 } : {}}
          >
            <span style={{
              minWidth: 26, height: 26, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 11, fontWeight: 700,
              background: selected && opt === card.answer ? '#4CAF5020' : selected && opt === selected && opt !== card.answer ? '#E5737320' : 'rgba(201,168,76,0.1)',
              color: selected && opt === card.answer ? '#4CAF50' : selected && opt === selected && opt !== card.answer ? '#E57373' : '#C9A84C',
            }}>
              {letters[i]}
            </span>
            <span style={{ flex: 1, lineHeight: 1.4 }}>{opt}</span>
            {selected && opt === card.answer && <span style={{ color: '#4CAF50', fontSize: 16 }}>✓</span>}
            {selected && opt === selected && opt !== card.answer && <span style={{ color: '#E57373', fontSize: 16 }}>✗</span>}
          </motion.button>
        ))}
      </div>

      {/* Feedback imediato */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 14, padding: '10px 16px', borderRadius: 10, textAlign: 'center',
              background: result === 'correct' ? 'rgba(76,175,80,0.1)' : 'rgba(229,115,115,0.1)',
              border: `1px solid ${result === 'correct' ? 'rgba(76,175,80,0.3)' : 'rgba(229,115,115,0.3)'}`,
            }}
          >
            <span style={{ fontSize: 13, fontWeight: 600, color: result === 'correct' ? '#4CAF50' : '#E57373' }}>
              {result === 'correct' ? '✓ Acertou! Próximo card em instantes...' : '✗ Não foi dessa vez. Veja a resposta correta...'}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewSession({ cards, onFinish }) {
  const [idx, setIdx] = useState(0);
  const [scores, setScores] = useState([]);
  const [corrects, setCorrects] = useState([]);
  const [startTime] = useState(Date.now());
  const [transitioning, setTransitioning] = useState(false);

  const total = cards.length;

  const handleEvaluate = (val, isCorrect) => {
    if (transitioning) return;
    setTransitioning(true);
    const newScores = [...scores, val];
    const newCorrects = [...corrects, isCorrect];

    setTimeout(async () => {
      if (idx < total - 1) {
        setScores(newScores);
        setCorrects(newCorrects);
        setIdx(idx + 1);
        setTransitioning(false);
      } else {
        const hits = newCorrects.filter(Boolean).length;
        const avgScore = (hits / total) * 100;
        const duration = Math.max(1, Math.round((Date.now() - startTime) / 60000));
        try {
          await api.post('/api/flashcards/session', {
            duration_minutes: duration,
            topic: cards[0]?.topic_name || 'Geral',
            cards_reviewed: total,
            score_percent: avgScore,
          });
        } catch {}
        onFinish({ scores: newScores, corrects: newCorrects, total, avgScore });
      }
    }, 400);
  };

  return (
    <div>
      {/* Progress */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: '#7A7060', marginBottom: 8 }}>
          <span>Card {idx + 1} de {total}</span>
          <span style={{ color: '#4CAF50' }}>✓ {corrects.filter(Boolean).length} corretos</span>
        </div>
        <div style={{ background: '#1E1E1E', borderRadius: 4, height: 6 }}>
          <motion.div
            animate={{ width: `${((idx) / total) * 100}%` }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #C9A84C, #E6C56B)', borderRadius: 4 }}
          />
        </div>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -50 }}
          transition={{ duration: 0.2 }}
        >
          <FlipCard card={cards[idx]} allCards={cards} onEvaluate={handleEvaluate} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function SessionResult({ result, onRestart, onExit }) {
  const pct = Math.round(result.avgScore);
  const hits = result.corrects.filter(Boolean).length;
  const misses = result.total - hits;

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '20px 0' }}>
      <div style={{ fontSize: 64, marginBottom: 16 }}>{pct >= 70 ? '🏆' : pct >= 40 ? '👍' : '💪'}</div>
      <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 28, marginBottom: 8 }}>Sessão concluída!</h2>
      <p style={{ color: '#7A7060', marginBottom: 28 }}>Você revisou {result.total} flashcards</p>

      <div style={{ fontSize: 72, fontWeight: 700, fontFamily: 'Playfair Display, serif', color: '#C9A84C', marginBottom: 4 }}>{pct}%</div>

      {/* Corretos / errados */}
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', margin: '16px 0 28px' }}>
        <div style={{ padding: '12px 24px', background: 'rgba(76,175,80,0.1)', border: '1px solid rgba(76,175,80,0.3)', borderRadius: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#4CAF50', fontFamily: 'Playfair Display, serif' }}>{hits}</div>
          <div style={{ fontSize: 12, color: '#7A7060', marginTop: 2 }}>Corretos</div>
        </div>
        <div style={{ padding: '12px 24px', background: 'rgba(229,115,115,0.1)', border: '1px solid rgba(229,115,115,0.3)', borderRadius: 12 }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#E57373', fontFamily: 'Playfair Display, serif' }}>{misses}</div>
          <div style={{ fontSize: 12, color: '#7A7060', marginTop: 2 }}>Errados</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
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
  const [sessionCards, setSessionCards] = useState([]);
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
    if (filtered.length < 2) return toast?.('É necessário pelo menos 2 flashcards para iniciar a revisão', 'warning');
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    setSessionCards(shuffled);
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
        {mode === 'browse' && filtered.length >= 2 && (
          <button onClick={startReview} className="btn-primary" style={{ padding: '12px 28px' }}>▶ Iniciar Revisão</button>
        )}
        {mode !== 'browse' && (
          <button onClick={() => { setMode('browse'); setSessionResult(null); }} className="btn-secondary" style={{ fontSize: 14 }}>← Voltar</button>
        )}
      </motion.div>

      {mode === 'browse' && (
        <>
          {/* Filtros */}
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
                  <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 600, letterSpacing: 2, marginBottom: 10, textTransform: 'uppercase' }}>Pergunta</div>
                  <p style={{ fontSize: 14, marginBottom: 16, color: '#E8DCC8', lineHeight: 1.5 }}>{c.question}</p>
                  <div style={{ height: 1, background: '#1E1E1E', margin: '12px 0' }} />
                  <div style={{ fontSize: 11, color: '#7A7060', fontWeight: 600, letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>Resposta</div>
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
              cards={sessionCards}
              onFinish={(result) => { setSessionResult(result); setMode('result'); }}
            />
          </div>
        </motion.div>
      )}

      {mode === 'result' && sessionResult && (
        <div className="card" style={{ maxWidth: 540, margin: '0 auto' }}>
          <SessionResult
            result={sessionResult}
            onRestart={() => {
              const reshuffled = [...sessionCards].sort(() => Math.random() - 0.5);
              setSessionCards(reshuffled);
              setMode('review');
              setSessionResult(null);
            }}
            onExit={() => { setMode('browse'); setSessionResult(null); }}
          />
        </div>
      )}
    </div>
  );
}
