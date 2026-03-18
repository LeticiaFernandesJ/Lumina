import React, { useState, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ToastContext } from '../components/Layout';
import api from '../utils/api';

function Section({ title, children }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ marginBottom: 20 }}>
      <h2 style={{ fontSize: 18, marginBottom: 24, paddingBottom: 16, borderBottom: '1px solid #1E1E1E' }}>{title}</h2>
      {children}
    </motion.div>
  );
}

export default function Configuracoes() {
  const { user, updateUser, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useContext(ToastContext);
  const [profile, setProfile] = useState({ full_name: user?.full_name || '', email: user?.email || '' });
  const [passwords, setPasswords] = useState({ current_password: '', new_password: '', confirm: '' });
  const [loading, setLoading] = useState('');
  const [showDelete, setShowDelete] = useState(false);

  const saveProfile = async () => {
    setLoading('profile');
    try {
      const { data } = await api.put('/api/users/me', { full_name: profile.full_name, email: profile.email });
      updateUser(data);
      toast('Perfil atualizado!', 'success');
    } catch (e) {
      toast(e.response?.data?.error || 'Erro ao atualizar', 'error');
    } finally {
      setLoading('');
    }
  };

  const savePassword = async () => {
    if (passwords.new_password !== passwords.confirm) return toast('Senhas não coincidem', 'error');
    if (passwords.new_password.length < 6) return toast('Senha mínimo 6 caracteres', 'error');
    setLoading('password');
    try {
      await api.put('/api/users/me', { full_name: user.full_name, email: user.email, current_password: passwords.current_password, new_password: passwords.new_password });
      setPasswords({ current_password: '', new_password: '', confirm: '' });
      toast('Senha alterada com sucesso!', 'success');
    } catch (e) {
      toast(e.response?.data?.error || 'Erro ao alterar senha', 'error');
    } finally {
      setLoading('');
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete('/api/users/me');
      logout();
      navigate('/login');
    } catch {
      toast('Erro ao excluir conta', 'error');
    }
  };

  return (
    <div style={{ maxWidth: 680 }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 32, marginBottom: 4 }}>Confi<span className="gold-gradient">gurações</span></h1>
        <p style={{ color: '#7A7060' }}>Gerencie sua conta e preferências</p>
      </motion.div>

      <Section title="👤 Perfil">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 6 }}>Nome completo</label>
            <input value={profile.full_name} onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 6 }}>E-mail</label>
            <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={saveProfile} disabled={loading === 'profile'} className="btn-primary">
              {loading === 'profile' ? 'Salvando...' : 'Salvar alterações'}
            </button>
          </div>
        </div>
      </Section>

      <Section title="🔒 Segurança">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 6 }}>Senha atual</label>
            <input type="password" value={passwords.current_password} onChange={e => setPasswords({ ...passwords, current_password: e.target.value })} placeholder="••••••••" />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 6 }}>Nova senha</label>
            <input type="password" value={passwords.new_password} onChange={e => setPasswords({ ...passwords, new_password: e.target.value })} placeholder="Mínimo 6 caracteres" />
          </div>
          <div>
            <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 6 }}>Confirmar nova senha</label>
            <input type="password" value={passwords.confirm} onChange={e => setPasswords({ ...passwords, confirm: e.target.value })} placeholder="Repita a senha" />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button onClick={savePassword} disabled={loading === 'password'} className="btn-primary">
              {loading === 'password' ? 'Alterando...' : 'Alterar senha'}
            </button>
          </div>
        </div>
      </Section>

      <Section title="⚠️ Zona de perigo">
        <p style={{ color: '#7A7060', fontSize: 14, marginBottom: 20 }}>Esta ação é irreversível. Todos os seus dados serão permanentemente excluídos.</p>
        <button onClick={() => setShowDelete(true)} style={{
          background: 'rgba(229,115,115,0.1)', color: '#E57373', border: '1px solid rgba(229,115,115,0.3)',
          borderRadius: 10, padding: '11px 24px', fontFamily: 'DM Sans, sans-serif', fontWeight: 500, cursor: 'pointer', fontSize: 14, transition: 'all 0.2s',
        }}
          onMouseEnter={e => e.target.style.background = 'rgba(229,115,115,0.2)'}
          onMouseLeave={e => e.target.style.background = 'rgba(229,115,115,0.1)'}
        >
          🗑️ Excluir minha conta
        </button>
      </Section>

      {/* Account info */}
      <div style={{ padding: '16px 20px', background: '#111', borderRadius: 12, border: '1px solid #1E1E1E', fontSize: 13, color: '#7A7060' }}>
        Conta criada em {user?.created_at ? new Date(user.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' }) : '—'}
      </div>

      <AnimatePresence>
        {showDelete && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 20, padding: 36, maxWidth: 400, width: '90%' }}>
              <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 16 }}>⚠️</div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, marginBottom: 12, textAlign: 'center' }}>Excluir conta?</h3>
              <p style={{ color: '#C4B89A', fontSize: 14, lineHeight: 1.7, marginBottom: 28, textAlign: 'center' }}>
                Todos os seus PDFs, flashcards, redações e planos serão excluídos permanentemente. Esta ação não pode ser desfeita.
              </p>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={() => setShowDelete(false)} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
                <button onClick={deleteAccount} style={{ flex: 1, background: '#E57373', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: 15 }}>
                  Sim, excluir tudo
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
