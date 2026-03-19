import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { to: '/dashboard', icon: '⊞', label: 'Dashboard' },
  { to: '/pdfs', icon: '📄', label: 'Meus PDFs' },
  { to: '/flashcards', icon: '🃏', label: 'Flashcards' },
  { to: '/redacao', icon: '✍️', label: 'Redação' },
  { to: '/plano', icon: '📅', label: 'Plano de Estudos' },
  { to: '/frequencia', icon: '📊', label: 'Frequência' },
  { to: '/configuracoes', icon: '⚙️', label: 'Configurações' },
];

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  const handleNav = () => onClose?.();

  return (
    <>
      {/* Desktop sidebar */}
      <aside style={{
        background: '#0E0E0E', borderRight: '1px solid #1E1E1E',
        height: '100vh', position: 'fixed', top: 0, left: 0,
        display: 'flex', flexDirection: 'column', zIndex: 100,
        width: 240, overflow: 'hidden',
      }} className="desktop-sidebar">
        <SidebarContent user={user} onLogout={handleLogout} onNav={handleNav} />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              background: '#0E0E0E', borderRight: '1px solid #1E1E1E',
              height: '100vh', position: 'fixed', top: 0, left: 0,
              display: 'flex', flexDirection: 'column', zIndex: 200,
              width: 260,
            }}
            className="mobile-sidebar"
          >
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px' }}>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#7A7060', fontSize: 22, cursor: 'pointer' }}>✕</button>
            </div>
            <SidebarContent user={user} onLogout={handleLogout} onNav={handleNav} />
          </motion.aside>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 768px) {
          .desktop-sidebar { display: none !important; }
        }
        @media (min-width: 769px) {
          .mobile-sidebar { display: none !important; }
        }
      `}</style>
    </>
  );
}

function SidebarContent({ user, onLogout, onNav }) {
  return (
    <>
      <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #1E1E1E' }}>
        <svg width="32" height="32" viewBox="0 0 36 36">
          <defs>
            <linearGradient id="fgs" x1="0%" y1="100%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#C9A84C"/><stop offset="100%" stopColor="#E6C56B"/>
            </linearGradient>
          </defs>
          <path d="M18 4 C18 4 12 12 12 18 C12 22 14 25 16 26 C15 23 16 20 18 19 C20 20 21 23 20 26 C22 25 24 22 24 18 C24 12 18 4 18 4Z" fill="url(#fgs)"/>
          <ellipse cx="18" cy="28" rx="5" ry="2" fill="url(#fgs)" opacity="0.4"/>
        </svg>
        <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, background: 'linear-gradient(135deg, #C9A84C, #E6C56B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Lumina
        </span>
      </div>

      <nav style={{ flex: 1, padding: '12px 0', overflowY: 'auto' }}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNav}
            style={({ isActive }) => ({
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '13px 20px', margin: '2px 8px', borderRadius: 10,
              textDecoration: 'none',
              color: isActive ? '#C9A84C' : '#7A7060',
              background: isActive ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
              borderLeft: isActive ? '2px solid #C9A84C' : '2px solid transparent',
              transition: 'all 0.2s', fontWeight: isActive ? 500 : 400, fontSize: 15,
            })}
          >
            <span style={{ fontSize: 18, minWidth: 20, textAlign: 'center' }}>{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div style={{ borderTop: '1px solid #1E1E1E', padding: '14px 16px' }}>
        <div style={{ background: '#161616', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#E8DCC8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.full_name}</div>
          <div style={{ fontSize: 11, color: '#7A7060', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
        </div>
        <button onClick={onLogout} style={{
          width: '100%', background: 'transparent', color: '#7A7060', border: '1px solid #2A2A2A',
          borderRadius: 8, padding: '9px', fontFamily: 'DM Sans, sans-serif', fontSize: 13,
          cursor: 'pointer', transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        }}
          onMouseEnter={e => { e.currentTarget.style.color = '#E57373'; e.currentTarget.style.borderColor = 'rgba(229,115,115,0.4)'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#7A7060'; e.currentTarget.style.borderColor = '#2A2A2A'; }}
        >
          ⏻ Sair
        </button>
      </div>
    </>
  );
}
