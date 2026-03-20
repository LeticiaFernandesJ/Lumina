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
        .pwa-wrapper {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 9999;
          width: calc(100% - 32px);
          max-width: 440px;
          pointer-events: none;
          box-sizing: border-box;
        }
        .pwa-motion {
          width: 100%;
          pointer-events: auto;
        }
        .pwa-card {
          width: 100%;
          background: #1A1A1A;
          border: 1px solid rgba(201,168,76,0.4);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
          box-sizing: border-box;
        }
        .pwa-top-line {
          height: 2px;
          background: linear-gradient(90deg, #C9A84C, #E6C56B, #C9A84C);
        }
        .pwa-content {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 14px;
        }
        .pwa-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: #111;
          border: 1px solid #2A2A2A;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .pwa-text {
          flex: 1;
          min-width: 0;
        }
        .pwa-title {
          font-size: 13px;
          font-weight: 700;
          color: #E8DCC8;
          font-family: 'DM Sans', sans-serif;
          line-height: 1.3;
        }
        .pwa-subtitle {
          font-size: 11px;
          color: #7A7060;
          font-family: 'DM Sans', sans-serif;
          margin-top: 2px;
          line-height: 1.3;
        }
        .pwa-buttons {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }
        .pwa-btn-dismiss {
          background: transparent;
          border: 1px solid #333;
          color: #7A7060;
          border-radius: 8px;
          padding: 0 12px;
          height: 34px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }
        .pwa-btn-install {
          background: linear-gradient(135deg, #C9A84C, #E6C56B);
          border: none;
          color: #0A0A0A;
          border-radius: 8px;
          padding: 0 16px;
          height: 34px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }

        /* Mobile pequeno: esconde texto dos botões, mostra só ícones */
        @media (max-width: 360px) {
          .pwa-btn-dismiss { padding: 0 8px; font-size: 11px; }
          .pwa-btn-install { padding: 0 10px; font-size: 11px; }
          .pwa-title { font-size: 12px; }
          .pwa-subtitle { font-size: 10px; }
        }
      `}</style>

      <AnimatePresence>
        {show && (
          <div className="pwa-wrapper">
            <motion.div
              className="pwa-motion"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 30 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className="pwa-card">
                <div className="pwa-top-line" />
                <div className="pwa-content">
                  <div className="pwa-icon">
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

                  <div className="pwa-text">
                    <div className="pwa-title">Instalar Lumina</div>
                    <div className="pwa-subtitle">Adicionar à tela inicial</div>
                  </div>

                  <div className="pwa-buttons">
                    <button className="pwa-btn-dismiss" onClick={handleDismiss}>
                      Agora não
                    </button>
                    <button className="pwa-btn-install" onClick={handleInstall}>
                      Instalar
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
