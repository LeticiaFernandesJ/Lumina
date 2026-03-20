import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstall() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    // Verifica se já está instalado como PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setInstalled(true);
      return;
    }

    // Captura o evento de instalação
    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      // Mostra o banner após 3 segundos
      setTimeout(() => setShow(true), 3000);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!prompt) return;
    prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') {
      setInstalled(true);
      setShow(false);
    }
    setPrompt(null);
  };

  const handleDismiss = () => {
    setShow(false);
    // Não mostra de novo por 24h
    localStorage.setItem('pwa_dismissed', Date.now().toString());
  };

  // Verifica se foi dispensado recentemente
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 86400000) {
      setShow(false);
    }
  }, []);

  if (installed || !prompt) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100% - 32px)',
            maxWidth: 420,
            background: '#161616',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: 16,
            padding: '18px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            zIndex: 9000,
            boxShadow: '0 8px 40px rgba(0,0,0,0.6), 0 0 30px rgba(201,168,76,0.1)',
          }}
        >
          {/* Icon */}
          <div style={{ width: 48, height: 48, borderRadius: 12, background: '#0E0E0E', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #2A2A2A' }}>
            <svg width="28" height="28" viewBox="0 0 36 36">
              <defs>
                <linearGradient id="fg3" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#C9A84C"/>
                  <stop offset="100%" stopColor="#E6C56B"/>
                </linearGradient>
              </defs>
              <path d="M18 4 C18 4 12 12 12 18 C12 22 14 25 16 26 C15 23 16 20 18 19 C20 20 21 23 20 26 C22 25 24 22 24 18 C24 12 18 4 18 4Z" fill="url(#fg3)"/>
              <ellipse cx="18" cy="28" rx="5" ry="2" fill="url(#fg3)" opacity="0.4"/>
            </svg>
          </div>

          {/* Text */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: '#E8DCC8', fontFamily: 'DM Sans, sans-serif', marginBottom: 2 }}>
              Instalar Lumina
            </div>
            <div style={{ fontSize: 12, color: '#7A7060', fontFamily: 'DM Sans, sans-serif' }}>
              Acesse como app no seu celular
            </div>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
            <button onClick={handleDismiss} style={{ background: 'transparent', border: '1px solid #2A2A2A', color: '#7A7060', borderRadius: 8, padding: '7px 12px', fontFamily: 'DM Sans, sans-serif', fontSize: 12, cursor: 'pointer' }}>
              Agora não
            </button>
            <button onClick={handleInstall} style={{ background: 'linear-gradient(135deg, #C9A84C, #E6C56B)', border: 'none', color: '#0A0A0A', borderRadius: 8, padding: '7px 14px', fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
              Instalar
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
