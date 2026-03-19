import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ToastContainer from './Toast';
import { useToast } from '../hooks/useToast';

export const ToastContext = React.createContext(null);

export default function Layout() {
  const { toasts, toast, removeToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <ToastContext.Provider value={toast}>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A' }}>
        {/* Overlay mobile */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 99, display: 'none' }}
            className="mobile-overlay"
          />
        )}

        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main style={{ flex: 1, minHeight: '100vh', transition: 'margin-left 0.3s' }} className="main-content">
          {/* Mobile header */}
          <div className="mobile-header" style={{ display: 'none', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #1E1E1E', position: 'sticky', top: 0, background: '#0A0A0A', zIndex: 50 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <svg width="28" height="28" viewBox="0 0 36 36">
                <defs>
                  <linearGradient id="fgm" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#C9A84C"/><stop offset="100%" stopColor="#E6C56B"/>
                  </linearGradient>
                </defs>
                <path d="M18 4 C18 4 12 12 12 18 C12 22 14 25 16 26 C15 23 16 20 18 19 C20 20 21 23 20 26 C22 25 24 22 24 18 C24 12 18 4 18 4Z" fill="url(#fgm)"/>
              </svg>
              <span style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, fontWeight: 700, background: 'linear-gradient(135deg, #C9A84C, #E6C56B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Lumina</span>
            </div>
            <button onClick={() => setSidebarOpen(true)} style={{ background: 'transparent', border: '1px solid #2A2A2A', borderRadius: 8, padding: '8px 10px', color: '#C9A84C', cursor: 'pointer', fontSize: 18 }}>
              ☰
            </button>
          </div>

          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }} className="page-content">
            <Outlet />
          </div>
        </main>

        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mobile-overlay { display: block !important; }
          .mobile-header { display: flex !important; }
          .main-content { margin-left: 0 !important; }
          .page-content { padding: 20px 16px !important; }
        }
        @media (min-width: 769px) {
          .main-content { margin-left: 240px; }
        }
      `}</style>
    </ToastContext.Provider>
  );
}
