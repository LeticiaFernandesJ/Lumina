import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import ParticleBackground from '../components/ParticleBackground';
import { InstallAppButton } from '../components/PWAInstall';
import { useToast } from '../hooks/useToast';
import ToastContainer from '../components/Toast';

function LuminaLogo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 14, justifyContent: 'center', marginBottom: 8 }}>
      <svg width="44" height="44" viewBox="0 0 36 36">
        <defs>
          <linearGradient id="flameGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#C9A84C" />
            <stop offset="100%" stopColor="#E6C56B" />
          </linearGradient>
        </defs>
        <path d="M18 4 C18 4 12 12 12 18 C12 22 14 25 16 26 C15 23 16 20 18 19 C20 20 21 23 20 26 C22 25 24 22 24 18 C24 12 18 4 18 4Z" fill="url(#flameGrad2)" />
        <ellipse cx="18" cy="28" rx="5" ry="2" fill="url(#flameGrad2)" opacity="0.4" />
      </svg>
      <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 32, fontWeight: 700, background: 'linear-gradient(135deg, #C9A84C, #E6C56B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Lumina
      </span>
    </div>
  );
}

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao entrar', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <ParticleBackground />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440, padding: '0 24px' }}
      >
        <div style={{ background: 'rgba(14,14,14,0.92)', backdropFilter: 'blur(20px)', border: '1px solid #222', borderRadius: 24, padding: 'clamp(24px, 5vw, 48px) clamp(20px, 5vw, 40px)' }}>
          <LuminaLogo />
          <p style={{ textAlign: 'center', color: '#7A7060', fontSize: 14, marginBottom: 36, fontFamily: 'DM Sans, sans-serif' }}>
            Sua plataforma de estudos com IA
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 6, fontFamily: 'DM Sans, sans-serif' }}>E-mail</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" required />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 6, fontFamily: 'DM Sans, sans-serif' }}>Senha</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8, width: '100%', padding: '14px', fontSize: 16 }}>
              {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Entrar'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: '#7A7060', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
            Não tem conta?{' '}
            <Link to="/register" style={{ color: '#C9A84C', fontWeight: 500 }}>Cadastre-se</Link>
          </p>
          <InstallAppButton />
        </div>
      </motion.div>
    </div>
  );
}

export function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();
  const { toasts, toast, removeToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast('Senha mínimo 6 caracteres', 'error');
    setLoading(true);
    try {
      await register(form.full_name, form.email, form.password);
      navigate('/dashboard');
    } catch (err) {
      toast(err.response?.data?.error || 'Erro ao cadastrar', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A0A0A', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <ParticleBackground />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 440, padding: '0 24px' }}
      >
        <div style={{ background: 'rgba(14,14,14,0.92)', backdropFilter: 'blur(20px)', border: '1px solid #222', borderRadius: 24, padding: 'clamp(24px, 5vw, 48px) clamp(20px, 5vw, 40px)' }}>
          <LuminaLogo />
          <p style={{ textAlign: 'center', color: '#7A7060', fontSize: 14, marginBottom: 36, fontFamily: 'DM Sans, sans-serif' }}>
            Crie sua conta e comece a estudar
          </p>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 6, fontFamily: 'DM Sans, sans-serif' }}>Nome completo</label>
              <input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} placeholder="Seu nome" required />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 6, fontFamily: 'DM Sans, sans-serif' }}>E-mail</label>
              <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="seu@email.com" required />
            </div>
            <div>
              <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 6, fontFamily: 'DM Sans, sans-serif' }}>Senha</label>
              <input type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 6 caracteres" required />
            </div>
            <button type="submit" disabled={loading} className="btn-primary" style={{ marginTop: 8, width: '100%', padding: '14px', fontSize: 16 }}>
              {loading ? <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} /> : 'Criar conta'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 24, color: '#7A7060', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>
            Já tem conta?{' '}
            <Link to="/login" style={{ color: '#C9A84C', fontWeight: 500 }}>Entrar</Link>
          </p>
          <InstallAppButton />
        </div>
      </motion.div>
    </div>
  );
}
