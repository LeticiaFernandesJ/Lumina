import React, { useState, useEffect, useContext } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { ToastContext } from '../components/Layout';
import api from '../utils/api';

function Heatmap({ logs }) {
  const today = new Date();
  const weeks = [];
  // Build 52 weeks
  const startDate = new Date(today);
  startDate.setDate(startDate.getDate() - 364);

  // Build date → count map
  const countMap = {};
  logs.forEach(l => {
    countMap[l.date] = (countMap[l.date] || 0) + l.count;
  });

  // Build grid: 52 cols x 7 rows
  const grid = [];
  for (let w = 0; w < 53; w++) {
    const week = [];
    for (let d = 0; d < 7; d++) {
      const idx = w * 7 + d;
      const date = new Date(startDate);
      date.setDate(date.getDate() + idx);
      if (date > today) { week.push(null); continue; }
      const key = date.toISOString().split('T')[0];
      const count = countMap[key] || 0;
      week.push({ date: key, count, label: date.toLocaleDateString('pt-BR') });
    }
    grid.push(week);
  }

  const getColor = (count) => {
    if (!count) return '#1A1A1A';
    if (count === 1) return '#4A3F1A';
    if (count === 2) return '#7A6830';
    if (count === 3) return '#C9A84C';
    return '#E6C56B';
  };

  const months = [];
  for (let m = 11; m >= 0; m--) {
    const d = new Date(today);
    d.setMonth(d.getMonth() - m);
    months.push(d.toLocaleDateString('pt-BR', { month: 'short' }));
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 3, overflowX: 'auto', paddingBottom: 8 }}>
        {grid.map((week, wi) => (
          <div key={wi} style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {week.map((day, di) => (
              <div key={di} title={day ? `${day.label}: ${day.count} atividades` : ''} style={{
                width: 12, height: 12, borderRadius: 2, background: day ? getColor(day.count) : 'transparent',
                cursor: day ? 'pointer' : 'default', transition: 'transform 0.1s',
              }}
                onMouseEnter={e => { if (day) e.target.style.transform = 'scale(1.4)'; }}
                onMouseLeave={e => e.target.style.transform = 'none'}
              />
            ))}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, justifyContent: 'flex-end' }}>
        <span style={{ fontSize: 11, color: '#7A7060' }}>Menos</span>
        {['#1A1A1A', '#4A3F1A', '#7A6830', '#C9A84C', '#E6C56B'].map((c, i) => (
          <div key={i} style={{ width: 12, height: 12, borderRadius: 2, background: c }} />
        ))}
        <span style={{ fontSize: 11, color: '#7A7060' }}>Mais</span>
      </div>
    </div>
  );
}

function Badge({ badge }) {
  return (
    <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} style={{
      display: 'flex', alignItems: 'center', gap: 14, padding: '16px 20px', background: badge.earned ? 'rgba(201,168,76,0.08)' : '#111',
      border: `1px solid ${badge.earned ? 'rgba(201,168,76,0.3)' : '#1E1E1E'}`, borderRadius: 12,
      opacity: badge.earned ? 1 : 0.4,
    }}>
      <div style={{ fontSize: 28, filter: badge.earned ? 'none' : 'grayscale(1)' }}>{badge.icon}</div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: badge.earned ? '#C9A84C' : '#7A7060', fontFamily: 'DM Sans, sans-serif' }}>{badge.name}</div>
        <div style={{ fontSize: 11, color: '#7A7060' }}>{badge.earned ? 'Conquistado ✓' : 'Bloqueado'}</div>
      </div>
    </motion.div>
  );
}

const COLORS = ['#C9A84C', '#E6C56B', '#7A6830', '#4A3F1A'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) return (
    <div style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 10, padding: '8px 14px' }}>
      <div style={{ fontSize: 12, color: '#7A7060' }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 600, color: '#C9A84C' }}>{payload[0].value}</div>
    </div>
  );
  return null;
};

export default function Frequencia() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const toast = useContext(ToastContext);

  useEffect(() => {
    api.get('/api/dashboard/frequency').then(r => setData(r.data)).catch(() => toast?.('Erro ao carregar frequência', 'error')).finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: 80 }}><span className="spinner" /></div>;

  // Sessions per week (last 8 weeks)
  const weeklyData = [];
  for (let w = 7; w >= 0; w--) {
    const start = new Date(); start.setDate(start.getDate() - w * 7 - 6);
    const end = new Date(); end.setDate(end.getDate() - w * 7);
    const count = data?.sessions?.filter(s => {
      const d = new Date(s.date); return d >= start && d <= end;
    }).length || 0;
    weeklyData.push({ sem: `S-${w}`, sessoes: count });
  }

  // Activity type distribution
  const typeCounts = {};
  data?.logs?.forEach(l => { typeCounts[l.activity_type] = (typeCounts[l.activity_type] || 0) + l.count; });
  const pieData = Object.entries(typeCounts).map(([k, v]) => ({
    name: { upload_pdf: 'PDFs', flashcard_session: 'Flashcards', essay: 'Redações', generate_flashcards: 'Geração IA', study_plan: 'Planos' }[k] || k,
    value: v,
  }));

  // Score trend
  const scoreData = data?.essays?.slice(-10).map((e, i) => ({ n: i + 1, nota: e.score })) || [];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 32, marginBottom: 4 }}>Fre<span className="gold-gradient">quência</span></h1>
        <p style={{ color: '#7A7060' }}>Acompanhe sua jornada de estudos</p>
      </motion.div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { icon: '🔥', label: 'Streak atual', value: data?.streak ?? 0, unit: 'dias' },
          { icon: '📚', label: 'Total de sessões', value: data?.sessions?.length ?? 0, unit: 'sessões' },
          { icon: '✍️', label: 'Redações', value: data?.essays?.length ?? 0, unit: 'redações' },
          { icon: '⭐', label: 'Badges', value: data?.badges?.filter(b => b.earned).length ?? 0, unit: `de ${data?.badges?.length ?? 0}` },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="card" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>{s.icon}</div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Playfair Display, serif', color: '#C9A84C' }}>{s.value}</div>
            <div style={{ fontSize: 12, color: '#7A7060' }}>{s.unit}</div>
          </motion.div>
        ))}
      </div>

      {/* Heatmap */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, marginBottom: 20 }}>Histórico de atividades — último ano</h2>
        <Heatmap logs={data?.logs || []} />
      </motion.div>

      {/* Charts row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, marginBottom: 32 }}>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h2 style={{ fontSize: 16, marginBottom: 20 }}>Sessões por semana</h2>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={weeklyData} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
              <XAxis dataKey="sem" tick={{ fill: '#7A7060', fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fill: '#7A7060', fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="sessoes" fill="#C9A84C" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {scoreData.length > 1 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card">
            <h2 style={{ fontSize: 16, marginBottom: 20 }}>Evolução das notas</h2>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={scoreData} margin={{ left: -20, right: 0, top: 0, bottom: 0 }}>
                <XAxis dataKey="n" tick={{ fill: '#7A7060', fontSize: 11 }} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} tick={{ fill: '#7A7060', fontSize: 11 }} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="nota" stroke="#C9A84C" strokeWidth={2} dot={{ fill: '#C9A84C', r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {pieData.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
            <h2 style={{ fontSize: 16, marginBottom: 20 }}>Tipos de atividade</h2>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={{ stroke: '#7A7060' }}>
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </div>

      {/* Badges */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} className="card">
        <h2 style={{ fontSize: 18, marginBottom: 20 }}>Conquistas</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
          {data?.badges?.map((b, i) => <Badge key={b.id} badge={b} />)}
        </div>
      </motion.div>
    </div>
  );
}
