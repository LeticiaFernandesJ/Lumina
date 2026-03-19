import React, { useEffect, useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../components/Layout';
import api from '../utils/api';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}

function StatCard({ icon, label, value, sub, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="card"
      style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ fontSize: 22, width: 40, height: 40, background: 'rgba(201,168,76,0.1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {icon}
        </div>
        <span style={{ fontSize: 13, color: '#7A7060', fontFamily: 'DM Sans, sans-serif' }}>{label}</span>
      </div>
      <div style={{ fontSize: 32, fontFamily: 'Playfair Display, serif', fontWeight: 700, color: '#E6C56B' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#7A7060' }}>{sub}</div>}
    </motion.div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 10, padding: '10px 14px' }}>
        <div style={{ fontSize: 12, color: '#7A7060', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 16, fontWeight: 600, color: '#C9A84C' }}>{payload[0].value} atividades</div>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const { user } = useAuth();
  const toast = useContext(ToastContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/dashboard/stats').then(r => setStats(r.data)).catch(() => toast?.('Erro ao carregar dashboard', 'error')).finally(() => setLoading(false));
  }, []);

  // Build 30 days chart data
  const chartData = React.useMemo(() => {
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      const match = stats?.activity?.find(a => a.date === key);
      days.push({ date: label, atividades: match?.count || 0 });
    }
    return days;
  }, [stats]);

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', flexDirection: 'column', gap: 16 }}>
      <span className="spinner" style={{ width: 48, height: 48 }} />
      <span style={{ color: '#7A7060', fontSize: 14 }}>Carregando...</span>
    </div>
  );

  const firstName = user?.full_name?.split(' ')[0] || 'Estudante';

  return (
    <div>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 40 }}>
        <h1 style={{ fontSize: 36, marginBottom: 6 }}>
          {greeting()}, <span className="gold-gradient">{firstName}!</span>
        </h1>
        <p style={{ color: '#7A7060', fontSize: 16 }}>
          {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </motion.div>

      {/* Stats Grid */}
      <div className='stat-grid-responsive' style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20, marginBottom: 40 }}>
        <StatCard icon="📄" label="PDFs enviados" value={stats?.totalPdfs ?? 0} delay={0} />
        <StatCard icon="🃏" label="Flashcards criados" value={stats?.totalCards ?? 0} delay={0.05} />
        <StatCard icon="🔥" label="Dias seguidos" value={stats?.streak ?? 0} sub="streak atual" delay={0.1} />
        <StatCard icon="✍️" label="Média redações" value={stats?.avgScore ? `${stats.avgScore}/10` : '—'} delay={0.15} />
      </div>

      {/* Activity Chart */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card" style={{ marginBottom: 32 }}>
        <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: 20 }}>Atividade — últimos 30 dias</h2>
          <span className="tag">📈 Progresso</span>
        </div>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#C9A84C" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fill: '#7A7060', fontSize: 11 }} tickLine={false} axisLine={false} interval={4} />
            <YAxis tick={{ fill: '#7A7060', fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="atividades" stroke="#C9A84C" strokeWidth={2} fill="url(#goldGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent Sessions */}
      {stats?.sessions?.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <h2 style={{ fontSize: 20, marginBottom: 20 }}>Sessões recentes</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {stats.sessions.slice(0, 5).map(s => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#111', borderRadius: 10, border: '1px solid #1E1E1E' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 14, marginBottom: 2 }}>{s.topic || 'Sem tema'}</div>
                  <div style={{ fontSize: 12, color: '#7A7060' }}>{new Date(s.date).toLocaleDateString('pt-BR')} · {s.cards_reviewed} cards · {s.duration_minutes}min</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#C9A84C' }}>{Math.round(s.score_percent)}%</div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {(!stats?.totalPdfs && !stats?.totalCards) && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} style={{ textAlign: 'center', padding: '60px 20px', color: '#7A7060' }}>
          <div style={{ fontSize: 64, marginBottom: 16 }}>🌟</div>
          <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 24, marginBottom: 8, color: '#C4B89A' }}>Bem-vindo ao Lumina!</h3>
          <p style={{ fontSize: 15, maxWidth: 400, margin: '0 auto' }}>Comece enviando seu primeiro PDF ou criando flashcards para começar sua jornada de estudos.</p>
        </motion.div>
      )}
    </div>
  );
}
