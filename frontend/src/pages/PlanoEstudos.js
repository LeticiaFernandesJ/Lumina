import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ToastContext } from '../components/Layout';
import api from '../utils/api';

// Progresso de uma semana: tarefas + flashcards + redação
function calcProgress(weekIdx, checked, hasFlashcards, hasEssay, taskCount) {
  const totalTasks = taskCount;
  const doneTasks = Object.values(checked[weekIdx] || {}).filter(Boolean).length;
  const taskPct = totalTasks > 0 ? (doneTasks / totalTasks) * 100 * 0.5 : 50; // 50% das tarefas
  const flashPct = hasFlashcards[weekIdx] ? 25 : 0;
  const essayPct = hasEssay[weekIdx] ? 25 : 0;
  return Math.round(taskPct + flashPct + essayPct);
}

function WeekCard({ week, weekIdx, planId, planTopic, checked, setChecked, hasFlashcards, setHasFlashcards, hasEssay, setHasEssay }) {
  const [open, setOpen] = useState(weekIdx === 0);
  const [generatingFC, setGeneratingFC] = useState(false);
  const [fcDone, setFcDone] = useState(false);
  const [showEssayModal, setShowEssayModal] = useState(false);
  const toast = useContext(ToastContext);
  const navigate = useNavigate();

  const taskCount = week.daily_tasks?.length || 0;
  const progress = calcProgress(weekIdx, checked, hasFlashcards, hasEssay, taskCount);
  const isComplete = progress === 100;

  const toggleTask = (ti) => {
    setChecked(prev => ({
      ...prev,
      [weekIdx]: { ...(prev[weekIdx] || {}), [ti]: !prev[weekIdx]?.[ti] }
    }));
  };

  const generateFlashcards = async () => {
    setGeneratingFC(true);
    try {
      const concepts = week.flashcards?.join(', ') || week.theme;
      const { data } = await api.post('/api/plans/generate-week-flashcards', {
        planId, weekIdx, theme: week.theme, concepts, topic: planTopic,
      });
      setHasFlashcards(prev => ({ ...prev, [weekIdx]: true }));
      setFcDone(true);
      toast(`✨ ${data.generated} flashcards gerados para "${week.theme}"!`, 'success');
    } catch (e) {
      toast(e.response?.data?.error || 'Erro ao gerar flashcards', 'error');
    } finally {
      setGeneratingFC(false);
    }
  };

  const markEssayDone = () => {
    setHasEssay(prev => ({ ...prev, [weekIdx]: true }));
    setShowEssayModal(false);
    toast('Redação marcada como concluída! Semana 100% completa! 🎉', 'success');
  };

  const goToEssay = () => {
    // Navega para redação com o tema da semana pré-preenchido
    navigate('/redacao', { state: { topic: week.essay_prompt || week.theme } });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: weekIdx * 0.06 }}
      style={{
        marginBottom: 16,
        background: '#161616',
        border: `1px solid ${isComplete ? 'rgba(76,175,80,0.4)' : 'rgba(255,255,255,0.06)'}`,
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'border-color 0.3s',
      }}
    >
      {/* Header */}
      <button onClick={() => setOpen(!open)} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: '18px 22px', textAlign: 'left' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15, fontWeight: 700, fontFamily: 'Playfair Display, serif',
              background: isComplete ? 'rgba(76,175,80,0.2)' : 'rgba(201,168,76,0.1)',
              color: isComplete ? '#4CAF50' : '#C9A84C',
            }}>
              {isComplete ? '✓' : week.week}
            </div>
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, color: '#E8DCC8' }}>{week.theme}</div>
              <div style={{ fontSize: 12, color: '#7A7060', marginTop: 2, display: 'flex', gap: 10 }}>
                <span>{taskCount} tarefas</span>
                <span>·</span>
                <span style={{ color: hasFlashcards[weekIdx] ? '#4CAF50' : '#7A7060' }}>
                  {hasFlashcards[weekIdx] ? '✓ Flashcards' : '○ Flashcards'}
                </span>
                <span>·</span>
                <span style={{ color: hasEssay[weekIdx] ? '#4CAF50' : '#7A7060' }}>
                  {hasEssay[weekIdx] ? '✓ Redação' : '○ Redação'}
                </span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: isComplete ? '#4CAF50' : '#C9A84C' }}>{progress}%</div>
            </div>
            <span style={{ color: '#C9A84C', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', display: 'block', fontSize: 14 }}>▾</span>
          </div>
        </div>

        {/* Barra de progresso composta */}
        <div style={{ height: 6, background: '#1E1E1E', borderRadius: 3, overflow: 'hidden', display: 'flex' }}>
          {/* Tarefas: 50% */}
          <motion.div
            animate={{ width: `${calcProgress(weekIdx, checked, { [weekIdx]: false }, { [weekIdx]: false }, taskCount)}%` }}
            style={{ height: '100%', background: 'linear-gradient(90deg, #C9A84C, #E6C56B)', borderRadius: 3 }}
          />
        </div>

        {/* Legenda dos segmentos */}
        <div style={{ display: 'flex', gap: 12, marginTop: 6, justifyContent: 'flex-end' }}>
          {[
            { label: 'Tarefas 50%', done: Object.values(checked[weekIdx] || {}).filter(Boolean).length === taskCount && taskCount > 0 },
            { label: 'Flashcards 25%', done: hasFlashcards[weekIdx] },
            { label: 'Redação 25%', done: hasEssay[weekIdx] },
          ].map((seg, i) => (
            <span key={i} style={{ fontSize: 10, color: seg.done ? '#4CAF50' : '#7A7060', display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: seg.done ? '#4CAF50' : '#3A3A3A', display: 'inline-block' }} />
              {seg.label}
            </span>
          ))}
        </div>
      </button>

      {/* Conteúdo expandido */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ padding: '0 22px 22px' }}>

              {/* Metas */}
              {week.goals?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Objetivos da semana</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {week.goals.map((g, i) => (
                      <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#C4B89A' }}>
                        <span style={{ color: '#C9A84C', marginTop: 2 }}>◆</span>{g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Tarefas diárias */}
              {week.daily_tasks?.length > 0 && (
                <div style={{ marginBottom: 20 }}>
                  <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Tarefas diárias</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {week.daily_tasks.map((task, ti) => (
                      <label key={ti} onClick={() => toggleTask(ti)} style={{
                        display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer',
                        padding: '10px 14px', background: '#111', borderRadius: 10,
                        border: `1px solid ${checked[weekIdx]?.[ti] ? '#C9A84C30' : '#1E1E1E'}`,
                        transition: 'border-color 0.2s',
                      }}>
                        <div style={{
                          minWidth: 20, height: 20, borderRadius: 6, marginTop: 1,
                          border: `2px solid ${checked[weekIdx]?.[ti] ? '#C9A84C' : '#3A3A3A'}`,
                          background: checked[weekIdx]?.[ti] ? 'rgba(201,168,76,0.2)' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          transition: 'all 0.2s', cursor: 'pointer',
                        }}>
                          {checked[weekIdx]?.[ti] && <span style={{ fontSize: 11, color: '#C9A84C' }}>✓</span>}
                        </div>
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 12, color: '#C9A84C', fontWeight: 600, marginRight: 8 }}>{task.day}</span>
                          <span style={{ fontSize: 13, color: checked[weekIdx]?.[ti] ? '#7A7060' : '#C4B89A', textDecoration: checked[weekIdx]?.[ti] ? 'line-through' : 'none', transition: 'all 0.2s' }}>{task.task}</span>
                          <span style={{ fontSize: 12, color: '#7A7060', marginLeft: 8 }}>({task.duration_min}min)</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Divisor de ações */}
              <div style={{ height: 1, background: '#1E1E1E', margin: '18px 0' }} />

              {/* Ações: Flashcards + Redação */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>

                {/* FLASHCARDS */}
                <div style={{
                  padding: '16px', background: '#111', borderRadius: 12,
                  border: `1px solid ${hasFlashcards[weekIdx] ? 'rgba(76,175,80,0.3)' : '#1E1E1E'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>🃏</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#E8DCC8' }}>Flashcards</span>
                    {hasFlashcards[weekIdx] && <span style={{ fontSize: 11, color: '#4CAF50', marginLeft: 'auto' }}>✓ 25%</span>}
                  </div>
                  <p style={{ fontSize: 12, color: '#7A7060', marginBottom: 12, lineHeight: 1.5 }}>
                    Gere flashcards baseados nos conceitos desta semana para fixar o conteúdo.
                  </p>
                  {hasFlashcards[weekIdx] ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => navigate('/flashcards')} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid rgba(76,175,80,0.3)', background: 'rgba(76,175,80,0.08)', color: '#4CAF50', fontFamily: 'DM Sans, sans-serif', fontSize: 12, cursor: 'pointer' }}>
                        Ver flashcards →
                      </button>
                      <button onClick={generateFlashcards} disabled={generatingFC} style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #2A2A2A', background: 'transparent', color: '#7A7060', fontFamily: 'DM Sans, sans-serif', fontSize: 12, cursor: 'pointer' }}>
                        {generatingFC ? '...' : '↺'}
                      </button>
                    </div>
                  ) : (
                    <button onClick={generateFlashcards} disabled={generatingFC} style={{
                      width: '100%', padding: '10px', borderRadius: 8, border: 'none',
                      background: 'linear-gradient(135deg, #C9A84C, #E6C56B)', color: '#0A0A0A',
                      fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 12, cursor: generatingFC ? 'not-allowed' : 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      opacity: generatingFC ? 0.7 : 1,
                    }}>
                      {generatingFC ? (
                        <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Gerando...</>
                      ) : '✨ Gerar Flashcards'}
                    </button>
                  )}
                </div>

                {/* REDAÇÃO */}
                <div style={{
                  padding: '16px', background: '#111', borderRadius: 12,
                  border: `1px solid ${hasEssay[weekIdx] ? 'rgba(76,175,80,0.3)' : '#1E1E1E'}`,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ fontSize: 18 }}>✍️</span>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#E8DCC8' }}>Redação</span>
                    {hasEssay[weekIdx] && <span style={{ fontSize: 11, color: '#4CAF50', marginLeft: 'auto' }}>✓ 25%</span>}
                  </div>
                  {week.essay_prompt && (
                    <p style={{ fontSize: 12, color: '#7A7060', marginBottom: 12, lineHeight: 1.5, fontStyle: 'italic' }}>
                      "{week.essay_prompt}"
                    </p>
                  )}
                  {!week.essay_prompt && (
                    <p style={{ fontSize: 12, color: '#7A7060', marginBottom: 12, lineHeight: 1.5 }}>
                      Avalie seu aprendizado com uma redação sobre o tema da semana.
                    </p>
                  )}
                  {hasEssay[weekIdx] ? (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button onClick={() => navigate('/redacao')} style={{ flex: 1, padding: '9px', borderRadius: 8, border: '1px solid rgba(76,175,80,0.3)', background: 'rgba(76,175,80,0.08)', color: '#4CAF50', fontFamily: 'DM Sans, sans-serif', fontSize: 12, cursor: 'pointer' }}>
                        Ver histórico →
                      </button>
                      <button onClick={() => setShowEssayModal(true)} style={{ padding: '9px 12px', borderRadius: 8, border: '1px solid #2A2A2A', background: 'transparent', color: '#7A7060', fontFamily: 'DM Sans, sans-serif', fontSize: 12, cursor: 'pointer' }}>
                        ↺
                      </button>
                    </div>
                  ) : (
                    <button onClick={() => setShowEssayModal(true)} style={{
                      width: '100%', padding: '10px', borderRadius: 8, border: '1px solid rgba(201,168,76,0.4)',
                      background: 'transparent', color: '#C9A84C',
                      fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                    }}>
                      ✍️ Escrever Redação
                    </button>
                  )}
                </div>
              </div>

              {/* Conquista de conclusão */}
              {isComplete && (
                <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{
                  marginTop: 16, padding: '14px 18px', background: 'rgba(76,175,80,0.08)',
                  border: '1px solid rgba(76,175,80,0.3)', borderRadius: 12, textAlign: 'center',
                }}>
                  <span style={{ fontSize: 20 }}>🏆</span>
                  <span style={{ fontSize: 14, color: '#4CAF50', fontWeight: 600, marginLeft: 10 }}>Semana {week.week} concluída com 100%!</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal redação */}
      <AnimatePresence>
        {showEssayModal && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 24 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 20, padding: 36, maxWidth: 480, width: '100%' }}>
              <div style={{ textAlign: 'center', marginBottom: 24 }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>✍️</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, marginBottom: 8 }}>Redação da Semana {week.week}</h3>
                <p style={{ color: '#C4B89A', fontSize: 14, lineHeight: 1.7 }}>
                  {week.essay_prompt || `Escreva sobre: ${week.theme}`}
                </p>
              </div>

              <div style={{ background: '#111', borderRadius: 12, padding: '14px 16px', marginBottom: 24, border: '1px solid #2A2A2A' }}>
                <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6 }}>Como funciona</div>
                <div style={{ fontSize: 13, color: '#C4B89A', lineHeight: 1.7 }}>
                  1. Clique em <strong style={{ color: '#C9A84C' }}>"Ir para Redação"</strong> para abrir o editor<br />
                  2. Escreva sua redação com o tema desta semana<br />
                  3. Corrija com IA e volte aqui para marcar como concluído
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button onClick={goToEssay} style={{
                  padding: '13px', borderRadius: 10, border: 'none',
                  background: 'linear-gradient(135deg, #C9A84C, #E6C56B)', color: '#0A0A0A',
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 600, fontSize: 15, cursor: 'pointer',
                }}>
                  ✍️ Ir para Redação
                </button>
                <button onClick={markEssayDone} style={{
                  padding: '12px', borderRadius: 10, border: '1px solid rgba(76,175,80,0.4)',
                  background: 'rgba(76,175,80,0.08)', color: '#4CAF50',
                  fontFamily: 'DM Sans, sans-serif', fontWeight: 500, fontSize: 14, cursor: 'pointer',
                }}>
                  ✓ Já escrevi — marcar como concluído
                </button>
                <button onClick={() => setShowEssayModal(false)} style={{
                  padding: '12px', borderRadius: 10, border: '1px solid #2A2A2A',
                  background: 'transparent', color: '#7A7060',
                  fontFamily: 'DM Sans, sans-serif', fontSize: 14, cursor: 'pointer',
                }}>
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PlanoEstudos() {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [activePlanId, setActivePlanId] = useState(null);
  const [form, setForm] = useState({ topic_name: '', duration: '1mes', level: 'intermediário', hours_per_week: 10 });
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [checked, setChecked] = useState({});
  const [hasFlashcards, setHasFlashcards] = useState({});
  const [hasEssay, setHasEssay] = useState({});
  const toast = useContext(ToastContext);

  useEffect(() => {
    api.get('/api/plans').then(r => setPlans(r.data)).finally(() => setLoadingPlans(false));
  }, []);

  const generate = async () => {
    if (!form.topic_name.trim()) return toast('Informe o tema do plano', 'warning');
    setLoading(true);
    try {
      const { data } = await api.post('/api/plans/generate', form);
      toast('Plano de estudos gerado com sucesso!', 'success');
      setActivePlan(data.plan);
      setActivePlanId(data.id);
      setChecked({});
      setHasFlashcards({});
      setHasEssay({});
      api.get('/api/plans').then(r => setPlans(r.data));
    } catch (e) {
      toast(e.response?.data?.error || 'Erro ao gerar plano', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPlan = async (id) => {
    const { data } = await api.get(`/api/plans/${id}`);
    setActivePlan(data.plan_json);
    setActivePlanId(data.id);
    setChecked({});
    setHasFlashcards({});
    setHasEssay({});
  };

  const deletePlan = async (id) => {
    await api.delete(`/api/plans/${id}`);
    setPlans(p => p.filter(x => x.id !== id));
    if (activePlanId === id) { setActivePlan(null); setActivePlanId(null); }
    toast('Plano excluído', 'info');
  };

  const totalWeeks = activePlan?.weeks?.length || 0;
  const completedWeeks = activePlan?.weeks?.filter((_, i) =>
    calcProgress(i, checked, hasFlashcards, hasEssay, activePlan.weeks[i].daily_tasks?.length || 0) === 100
  ).length || 0;

  const durationLabels = { '1sem': '1 semana', '2sem': '2 semanas', '1mes': '1 mês', '3meses': '3 meses' };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 32, marginBottom: 4 }}>Plano de <span className="gold-gradient">Estudos</span></h1>
        <p style={{ color: '#7A7060' }}>Cronograma personalizado com flashcards e redação por módulo</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: activePlan ? '300px 1fr' : '1fr', gap: 28 }}>
        {/* Formulário */}
        <motion.div layout className="card" style={{ alignSelf: 'start' }}>
          <h2 style={{ fontSize: 18, marginBottom: 20 }}>Novo plano</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 6 }}>Tema ou disciplina</label>
              <input value={form.topic_name} onChange={e => setForm({ ...form, topic_name: e.target.value })} placeholder="Ex: ENEM, Cálculo, Inglês..." />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 10 }}>Duração</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {Object.entries(durationLabels).map(([val, label]) => (
                  <button key={val} onClick={() => setForm({ ...form, duration: val })} style={{
                    padding: '10px', borderRadius: 10, border: '1px solid', fontFamily: 'DM Sans, sans-serif', fontSize: 13, cursor: 'pointer', transition: 'all 0.2s',
                    borderColor: form.duration === val ? '#C9A84C' : '#2A2A2A',
                    background: form.duration === val ? 'rgba(201,168,76,0.15)' : '#111',
                    color: form.duration === val ? '#C9A84C' : '#7A7060',
                  }}>{label}</button>
                ))}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 6 }}>Nível</label>
              <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })} style={{ background: '#111', borderColor: '#2A2A2A' }}>
                <option value="iniciante">Iniciante</option>
                <option value="intermediário">Intermediário</option>
                <option value="avançado">Avançado</option>
              </select>
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 6 }}>
                Horas por semana: <strong style={{ color: '#C9A84C' }}>{form.hours_per_week}h</strong>
              </label>
              <input type="range" min="2" max="40" value={form.hours_per_week} onChange={e => setForm({ ...form, hours_per_week: +e.target.value })}
                style={{ width: '100%', accentColor: '#C9A84C', background: 'transparent', padding: 0 }} />
            </div>
            <button onClick={generate} disabled={loading} className="btn-primary" style={{ width: '100%', padding: '13px', marginTop: 4 }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} /> Gerando plano...
                </span>
              ) : '✨ Gerar com IA'}
            </button>
          </div>

          {/* Planos salvos */}
          {plans.length > 0 && (
            <div style={{ marginTop: 28, borderTop: '1px solid #1E1E1E', paddingTop: 20 }}>
              <div style={{ fontSize: 12, color: '#7A7060', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Planos salvos</div>
              {plans.map(p => (
                <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <button onClick={() => loadPlan(p.id)} style={{
                    flex: 1, textAlign: 'left', background: activePlanId === p.id ? 'rgba(201,168,76,0.1)' : 'transparent',
                    border: '1px solid', borderColor: activePlanId === p.id ? '#C9A84C40' : '#1E1E1E',
                    borderRadius: 10, padding: '10px 14px', cursor: 'pointer', transition: 'all 0.2s',
                  }}>
                    <div style={{ fontSize: 13, color: '#C4B89A', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{p.topic_name}</div>
                    <div style={{ fontSize: 11, color: '#7A7060' }}>{new Date(p.created_at).toLocaleDateString('pt-BR')}</div>
                  </button>
                  <button onClick={() => deletePlan(p.id)} style={{ background: 'transparent', border: 'none', color: '#7A7060', cursor: 'pointer', fontSize: 16, padding: '4px 8px', borderRadius: 6, transition: 'color 0.2s' }}
                    onMouseEnter={e => e.target.style.color = '#E57373'}
                    onMouseLeave={e => e.target.style.color = '#7A7060'}
                  >✕</button>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Plano ativo */}
        {activePlan && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            {/* Cabeçalho do plano */}
            <div style={{ marginBottom: 22 }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, marginBottom: 8 }}>
                {activePlan.title || activePlan.topic_name}
              </h2>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <span className="tag">📅 {totalWeeks} semanas</span>
                <span className="tag" style={{ borderColor: completedWeeks === totalWeeks && totalWeeks > 0 ? 'rgba(76,175,80,0.4)' : undefined, color: completedWeeks === totalWeeks && totalWeeks > 0 ? '#4CAF50' : undefined }}>
                  {completedWeeks === totalWeeks && totalWeeks > 0 ? '🏆' : '⭐'} {completedWeeks}/{totalWeeks} semanas completas
                </span>
              </div>
              {/* Barra geral */}
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#7A7060', marginBottom: 6 }}>
                  <span>Progresso geral do plano</span>
                  <span style={{ color: '#C9A84C', fontWeight: 600 }}>{totalWeeks > 0 ? Math.round((completedWeeks / totalWeeks) * 100) : 0}%</span>
                </div>
                <div style={{ height: 8, background: '#1E1E1E', borderRadius: 4 }}>
                  <motion.div
                    animate={{ width: `${totalWeeks > 0 ? (completedWeeks / totalWeeks) * 100 : 0}%` }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, #C9A84C, #E6C56B)', borderRadius: 4, transition: 'width 0.5s' }}
                  />
                </div>
              </div>
            </div>

            {/* Como funciona */}
            <div style={{ background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.15)', borderRadius: 12, padding: '14px 18px', marginBottom: 20 }}>
              <div style={{ fontSize: 12, color: '#C9A84C', fontWeight: 600, marginBottom: 8 }}>📋 Como atingir 100% em cada semana</div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                {[
                  { icon: '✅', text: 'Tarefas diárias', pct: '50%' },
                  { icon: '🃏', text: 'Gerar flashcards', pct: '25%' },
                  { icon: '✍️', text: 'Escrever redação', pct: '25%' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#C4B89A' }}>
                    <span>{item.icon}</span>
                    <span>{item.text}</span>
                    <span style={{ color: '#C9A84C', fontWeight: 600 }}>{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Semanas */}
            {activePlan.weeks?.map((w, i) => (
              <WeekCard
                key={i}
                week={w}
                weekIdx={i}
                planId={activePlanId}
                planTopic={activePlan.title || ''}
                checked={checked}
                setChecked={setChecked}
                hasFlashcards={hasFlashcards}
                setHasFlashcards={setHasFlashcards}
                hasEssay={hasEssay}
                setHasEssay={setHasEssay}
              />
            ))}

            {/* Conclusão do plano */}
            {completedWeeks === totalWeeks && totalWeeks > 0 && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{
                textAlign: 'center', padding: '32px', background: 'rgba(76,175,80,0.08)',
                border: '1px solid rgba(76,175,80,0.3)', borderRadius: 16, marginTop: 8,
              }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎓</div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, color: '#4CAF50', marginBottom: 8 }}>Plano Concluído!</h3>
                <p style={{ color: '#C4B89A', fontSize: 15 }}>Parabéns! Você completou todas as {totalWeeks} semanas do plano com 100% de aproveitamento.</p>
              </motion.div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
