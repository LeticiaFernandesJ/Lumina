import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstall() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return;

    const dismissed = localStorage.getItem('pwa_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 86400000) return;

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    setShow(false);
    setPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa_dismissed', Date.now().toString());
  };

  if (!prompt) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{
            position: 'fixed',
            bottom: 'calc(16px + env(safe-area-inset-bottom))',
            left: 16,
            right: 16,
            zIndex: 9000,
            background: '#1A1A1A',
            border: '1px solid rgba(201,168,76,0.35)',
            borderRadius: 16,
            padding: '14px 16px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          {/* Ícone */}
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: '#0E0E0E',
            border: '1px solid #2A2A2A',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <svg width="24" height="24" viewBox="0 0 36 36">
              <defs>
                <linearGradient id="fg4" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C9A84C"/>
                  <stop offset="100%" stopColor="#E6C56B"/>
                </linearGradient>
              </defs>
              <path d="M18 4 C18 4 12 12 12 18 C12 22 14 25 16 26 C15 23 16 20 18 19 C20 20 21 23 20 26 C22 25 24 22 24 18 C24 12 18 4 18 4Z" fill="url(#fg4)"/>
              <ellipse cx="18" cy="28" rx="5" ry="2" fill="url(#fg4)" opacity="0.4"/>
            </svg>
          </div>

          {/* Texto */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#E8DCC8', fontFamily: 'DM Sans, sans-serif' }}>
              Instalar Lumina
            </div>
            <div style={{ fontSize: 12, color: '#7A7060', fontFamily: 'DM Sans, sans-serif', marginTop: 1 }}>
              Adicionar à tela inicial
            </div>
          </div>

          {/* Botões */}
          <button
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: '1px solid #2A2A2A',
              color: '#7A7060',
              borderRadius: 8,
              padding: '8px 12px',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: 13,
              cursor: 'pointer',
              flexShrink: 0,
              minHeight: 36,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Não
          </button>
          <button
            onClick={handleInstall}
            style={{
              background: 'linear-gradient(135deg, #C9A84C, #E6C56B)',
              border: 'none',
              color: '#0A0A0A',
              borderRadius: 8,
              padding: '8px 14px',
              fontFamily: 'DM Sans, sans-serif',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
              flexShrink: 0,
              minHeight: 36,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            Instalar
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
