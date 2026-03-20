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
    await prompt.userChoice;
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
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          style={{
            position: 'fixed',
            bottom: 20,
            left: 0,
            right: 0,
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            padding: '0 16px',
            pointerEvents: 'none',
          }}
        >
          {/* Card interno — centralizado e com largura máxima */}
          <div style={{
            width: '100%',
            maxWidth: 440,
            background: '#1A1A1A',
            border: '1px solid rgba(201,168,76,0.4)',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
            pointerEvents: 'auto',
          }}>
            {/* Linha dourada topo */}
            <div style={{ height: 2, background: 'linear-gradient(90deg, #C9A84C, #E6C56B, #C9A84C)' }} />

            {/* Conteúdo */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '12px 14px',
            }}>
              {/* Ícone chama */}
              <div style={{
                width: 40, height: 40,
                borderRadius: 10,
                background: '#111',
                border: '1px solid #2A2A2A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="22" height="22" viewBox="0 0 36 36">
                  <defs>
                    <linearGradient id="pwaG" x1="0%" y1="100%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#C9A84C"/>
                      <stop offset="100%" stopColor="#E6C56B"/>
                    </linearGradient>
                  </defs>
                  <path d="M18 4C18 4 12 12 12 18c0 4 2 7 4 8-1-3 0-6 2-7 2 1 3 4 2 7 2-1 4-4 4-8 0-6-6-14-6-14z" fill="url(#pwaG)"/>
                  <ellipse cx="18" cy="28" rx="5" ry="2" fill="url(#pwaG)" opacity="0.4"/>
                </svg>
              </div>

              {/* Texto */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#E8DCC8', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.3 }}>
                  Instalar Lumina
                </div>
                <div style={{ fontSize: 11, color: '#7A7060', fontFamily: 'DM Sans, sans-serif', marginTop: 2, lineHeight: 1.3 }}>
                  Adicionar à tela inicial
                </div>
              </div>

              {/* Botões */}
              <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                <button onClick={handleDismiss} style={{
                  background: 'transparent',
                  border: '1px solid #333',
                  color: '#7A7060',
                  borderRadius: 8,
                  padding: '0 12px',
                  height: 34,
                  fontFamily: 'DM Sans, sans-serif',
                  fontSize: 12,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  WebkitTapHighlightColor: 'transparent',
                }}>
                  Agora não
                </button>
                <button onClick={handleInstall} style={{
                  background: 'linear-gradient(135deg, #C9A84C, #E6C56B)',
                  border: 'none',
                  color: '#0A0A0A',
                  borderRadius: 8,
                  padding: '0 16px',
                  height: 34,
                  fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 700,
                  fontSize: 12,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  WebkitTapHighlightColor: 'transparent',
                }}>
                  Instalar
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
