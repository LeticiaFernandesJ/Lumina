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
    <>
      <style>{`
        .pwa-banner {
          position: fixed;
          bottom: 16px;
          left: 50%;
          transform: translateX(-50%);
          width: calc(100vw - 32px);
          max-width: 480px;
          z-index: 9000;
          background: #1A1A1A;
          border: 1px solid rgba(201,168,76,0.35);
          border-radius: 16px;
          padding: 14px 16px;
          box-shadow: 0 8px 32px rgba(0,0,0,0.5);
          display: flex;
          align-items: center;
          gap: 12px;
          box-sizing: border-box;
        }
        @supports (padding-bottom: env(safe-area-inset-bottom)) {
          .pwa-banner {
            bottom: calc(16px + env(safe-area-inset-bottom));
          }
        }
        .pwa-btn-no {
          background: transparent;
          border: 1px solid #2A2A2A;
          color: #7A7060;
          border-radius: 8px;
          padding: 8px 14px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          cursor: pointer;
          flex-shrink: 0;
          min-height: 40px;
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }
        .pwa-btn-yes {
          background: linear-gradient(135deg, #C9A84C, #E6C56B);
          border: none;
          color: #0A0A0A;
          border-radius: 8px;
          padding: 8px 16px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          flex-shrink: 0;
          min-height: 40px;
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>

      <AnimatePresence>
        {show && (
          <motion.div
            className="pwa-banner"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ type: 'spring', stiffness: 300, damping: 28 }}
          >
            {/* Ícone */}
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: '#0E0E0E', border: '1px solid #2A2A2A',
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
            <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#E8DCC8', fontFamily: 'DM Sans, sans-serif', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Instalar Lumina
              </div>
              <div style={{ fontSize: 12, color: '#7A7060', fontFamily: 'DM Sans, sans-serif', marginTop: 2, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                Adicionar à tela inicial
              </div>
            </div>

            {/* Botões */}
            <button className="pwa-btn-no" onClick={handleDismiss}>Não</button>
            <button className="pwa-btn-yes" onClick={handleInstall}>Instalar</button>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
