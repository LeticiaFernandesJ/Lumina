import React, { useState } from 'react';
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

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        background: '#0E0E0E',
        borderRight: '1px solid #1E1E1E',
        height: '100vh',
        position: 'fixed',
        top: 0,
        left: 0,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 100,
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{ padding: collapsed ? '24px 0' : '28px 24px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #1E1E1E' }}>
        <div style={{ minWidth: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="36" height="36" viewBox="0 0 36 36">
            <defs>
              <linearGradient id="flameGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#C9A84C" />
                <stop offset="100%" stopColor="#E6C56B" />
              </linearGradient>
            </defs>
            <path d="M18 4 C18 4 12 12 12 18 C12 22 14 25 16 26 C15 23 16 20 18 19 C20 20 21 23 20 26 C22 25 24 22 24 18 C24 12 18 4 18 4Z" fill="url(#flameGrad)" />
            <ellipse cx="18" cy="28" rx="5" ry="2" fill="url(#flameGrad)" opacity="0.4" />
          </svg>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.15 }}
              style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, fontWeight: 700, background: 'linear-gradient(135deg, #C9A84C, #E6C56B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Lumina
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 0', overflowY: 'auto' }}>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              padding: collapsed ? '13px 0' : '13px 20px',
              justifyContent: collapsed ? 'center' : 'flex-start',
              margin: '2px 8px',
              borderRadius: 10,
              textDecoration: 'none',
              color: isActive ? '#C9A84C' : '#7A7060',
              background: isActive ? 'rgba(201, 168, 76, 0.1)' : 'transparent',
              borderLeft: isActive ? '2px solid #C9A84C' : '2px solid transparent',
              transition: 'all 0.2s',
              fontWeight: isActive ? 500 : 400,
              fontSize: 15,
            })}
          >
            {({ isActive }) => (
              <>
                <span style={{ fontSize: 18, minWidth: 20, textAlign: 'center' }}>{item.icon}</span>
                <AnimatePresence>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User + Collapse */}
      <div style={{ borderTop: '1px solid #1E1E1E', padding: collapsed ? '16px 0' : '16px' }}>
        {!collapsed && (
          <div style={{ marginBottom: 12, padding: '10px 12px', background: '#161616', borderRadius: 10 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#E8DCC8', marginBottom: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.full_name}</div>
            <div style={{ fontSize: 11, color: '#7A7060', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
          </div>
        )}
        <div style={{ display: 'flex', flexDirection: collapsed ? 'column' : 'row', gap: 8, justifyContent: 'center' }}>
          <button onClick={() => setCollapsed(!collapsed)} style={{ background: 'transparent', color: '#7A7060', padding: '8px', borderRadius: 8, fontSize: 16, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#C9A84C'}
            onMouseLeave={e => e.target.style.color = '#7A7060'}
          >
            {collapsed ? '→' : '←'}
          </button>
          <button onClick={handleLogout} style={{ background: 'transparent', color: '#7A7060', padding: '8px', borderRadius: 8, fontSize: 16, transition: 'color 0.2s' }}
            onMouseEnter={e => e.target.style.color = '#E57373'}
            onMouseLeave={e => e.target.style.color = '#7A7060'}
          >
            ⏻
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
