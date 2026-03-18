import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContext } from '../components/Layout';
import api from '../utils/api';

function WeekCard({ week, weekIdx }) {
  const [open, setOpen] = useState(weekIdx === 0);
  const [checked, setChecked] = useState({});
  const taskCount = week.daily_tasks?.length || 0;
  const doneCount = Object.values(checked).filter(Boolean).length;
  const progress = taskCount > 0 ? (doneCount / taskCount) * 100 : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: weekIdx * 0.08 }} className="card" style={{ marginBottom: 16 }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left', padding: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: open ? 16 : 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: progress === 100 ? 'rgba(76,175,80,0.2)' : 'rgba(201,168,76,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: progress === 100 ? '#4CAF50' : '#C9A84C', fontFamily: 'Playfair Display, serif' }}>
              {week.week}
            </div>
            <div>
              <div style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, color: '#E8DCC8' }}>{week.theme}</div>
              <div style={{ fontSize: 12, color: '#7A7060', marginTop: 2 }}>{doneCount}/{taskCount} tarefas · {week.goals?.length || 0} metas</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#C9A84C' }}>{Math.round(progress)}%</div>
            </div>
            <span style={{ color: '#C9A84C', transition: 'transform 0.2s', transform: open ? 'rotate(180deg)' : 'none', display: 'block' }}>▾</span>
          </div>
        </div>
        {/* Progress bar */}
        <div style={{ height: 4, background: '#1E1E1E', borderRadius: 2, overflow: 'hidden' }}>
          <motion.div animate={{ width: `${progress}%` }} style={{ height: '100%', background: 'linear-gradient(90deg, #C9A84C, #E6C56B)', borderRadius: 2 }} />
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            <div style={{ paddingTop: 20 }}>
              {/* Goals */}
              {week.goals?.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Objetivos</div>
                  <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {week.goals.map((g, i) => (
                      <li key={i} style={{ display: 'flex', gap: 10, fontSize: 14, color: '#C4B89A' }}>
                        <span style={{ color: '#C9A84C', marginTop: 2 }}>◆</span>{g}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Daily tasks */}
              {week.daily_tasks?.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10 }}>Tarefas diárias</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {week.daily_tasks.map((task, i) => (
                      <label key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, cursor: 'pointer', padding: '10px 12px', background: '#111', borderRadius: 10, border: `1px solid ${checked[i] ? '#C9A84C30' : '#1E1E1E'}` }}>
                        <input type="checkbox" checked={!!checked[i]} onChange={e => setChecked({ ...checked, [i]: e.target.checked })}
                          style={{ width: 'auto', marginTop: 2, accentColor: '#C9A84C' }} />
                        <div style={{ flex: 1 }}>
                          <span style={{ fontSize: 12, color: '#C9A84C', fontWeight: 600, marginRight: 8 }}>{task.day}</span>
                          <span style={{ fontSize: 14, color: checked[i] ? '#7A7060' : '#C4B89A', textDecoration: checked[i] ? 'line-through' : 'none' }}>{task.task}</span>
                          <span style={{ fontSize: 12, color: '#7A7060', marginLeft: 8 }}>({task.duration_min}min)</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Essay prompt */}
              {week.essay_prompt && (
                <div style={{ padding: '12px 16px', background: 'rgba(201,168,76,0.05)', border: '1px solid rgba(201,168,76,0.2)', borderRadius: 10 }}>
                  <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6 }}>Proposta de Redação</div>
                  <p style={{ fontSize: 13, color: '#C4B89A', lineHeight: 1.6 }}>{week.essay_prompt}</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PlanoEstudos() {
  const [plans, setPlans] = useState([]);
  const [activePlan, setActivePlan] = useState(null);
  const [form, setForm] = useState({ topic_name: '', duration: '1mes', level: 'intermediário', hours_per_week: 10 });
  const [loading, setLoading] = useState(false);
  const [loadingPlans, setLoadingPlans] = useState(true);
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
      setActivePlan({ ...data, topic_name: form.topic_name });
      api.get('/api/plans').then(r => setPlans(r.data));
    } catch (e) {
      toast(e.response?.data?.error || 'Erro ao gerar plano', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadPlan = async (id) => {
    const { data } = await api.get(`/api/plans/${id}`);
    setActivePlan({ ...data.plan_json, topic_name: data.topic_name, id: data.id });
  };

  const durationLabels = { '1sem': '1 semana', '2sem': '2 semanas', '1mes': '1 mês', '3meses': '3 meses' };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 32, marginBottom: 4 }}>Plano de <span className="gold-gradient">Estudos</span></h1>
        <p style={{ color: '#7A7060' }}>Crie um cronograma personalizado com inteligência artificial</p>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: activePlan ? '340px 1fr' : '1fr', gap: 28 }}>
        {/* Form */}
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
              <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 6 }}>Horas por semana: <strong style={{ color: '#C9A84C' }}>{form.hours_per_week}h</strong></label>
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

          {/* Saved plans */}
          {plans.length > 0 && (
            <div style={{ marginTop: 28, borderTop: '1px solid #1E1E1E', paddingTop: 20 }}>
              <div style={{ fontSize: 12, color: '#7A7060', fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 }}>Planos salvos</div>
              {plans.map(p => (
                <button key={p.id} onClick={() => loadPlan(p.id)} style={{
                  width: '100%', textAlign: 'left', background: activePlan?.id === p.id ? 'rgba(201,168,76,0.1)' : 'transparent',
                  border: '1px solid', borderColor: activePlan?.id === p.id ? '#C9A84C40' : '#1E1E1E',
                  borderRadius: 10, padding: '10px 14px', cursor: 'pointer', marginBottom: 8, transition: 'all 0.2s',
                }}>
                  <div style={{ fontSize: 14, color: '#C4B89A', fontFamily: 'DM Sans, sans-serif', fontWeight: 500 }}>{p.topic_name}</div>
                  <div style={{ fontSize: 12, color: '#7A7060' }}>{new Date(p.created_at).toLocaleDateString('pt-BR')}</div>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        {/* Plan view */}
        {activePlan && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, marginBottom: 4 }}>{activePlan.title || activePlan.topic_name}</h2>
              <span className="tag">📅 {activePlan.weeks?.length || 0} semanas</span>
            </div>
            {activePlan.weeks?.map((w, i) => <WeekCard key={i} week={w} weekIdx={i} />)}
          </motion.div>
        )}
      </div>
    </div>
  );
}
