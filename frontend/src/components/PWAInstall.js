import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstall() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) return;
    const dismissed = localStorage.getItem('pwa_dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 86400000) return;

    if (window.__pwaPrompt) {
      setTimeout(() => setShow(true), 2000);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      window.__pwaPrompt = e;
      setTimeout(() => setShow(true), 2000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    const prompt = window.__pwaPrompt;
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    setShow(false);
    window.__pwaPrompt = null;
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa_dismissed', Date.now().toString());
  };

  return (
    <>
      <style>{`
        .pwa-wrapper {
          position: fixed;
          left: 16px;
          right: 16px;
          bottom: 16px;
          z-index: 99999;
          pointer-events: none;
          display: flex;
          justify-content: center;
          align-items: flex-end;
        }
        .pwa-card {
          pointer-events: auto;
          width: 100%;
          max-width: 440px;
          background: #1A1A1A;
          border: 1px solid rgba(201,168,76,0.4);
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
        }
        .pwa-topline {
          height: 2px;
          background: linear-gradient(90deg, #C9A84C, #E6C56B, #C9A84C);
        }
        .pwa-body {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
        }
        .pwa-icon-box {
          width: 38px;
          min-width: 38px;
          height: 38px;
          border-radius: 10px;
          background: #111;
          border: 1px solid #2A2A2A;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pwa-texts {
          flex: 1;
          min-width: 0;
          overflow: hidden;
        }
        .pwa-title {
          font-size: 13px;
          font-weight: 700;
          color: #E8DCC8;
          font-family: 'DM Sans', sans-serif;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pwa-sub {
          font-size: 11px;
          color: #7A7060;
          font-family: 'DM Sans', sans-serif;
          margin-top: 2px;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pwa-btns {
          display: flex;
          gap: 6px;
          flex-shrink: 0;
        }
        .pwa-btn-no {
          background: transparent;
          border: 1px solid #333;
          color: #7A7060;
          border-radius: 8px;
          padding: 0 10px;
          height: 32px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }
        .pwa-btn-yes {
          background: linear-gradient(135deg, #C9A84C, #E6C56B);
          border: none;
          color: #0A0A0A;
          border-radius: 8px;
          padding: 0 14px;
          height: 32px;
          font-family: 'DM Sans', sans-serif;
          font-weight: 700;
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
          -webkit-tap-highlight-color: transparent;
        }
        @media (max-width: 360px) {
          .pwa-btn-no  { font-size: 11px; padding: 0 8px; }
          .pwa-btn-yes { font-size: 11px; padding: 0 10px; }
          .pwa-title   { font-size: 12px; }
          .pwa-sub     { display: none; }
        }
      `}</style>

      <AnimatePresence>
        {show && (
          <div className="pwa-wrapper">
            <motion.div
              className="pwa-card"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 40 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className="pwa-topline" />
              <div className="pwa-body">
                <div className="pwa-icon-box">
                  <svg width="20" height="20" viewBox="0 0 36 36">
                    <defs>
                      <linearGradient id="pwaGrad" x1="0%" y1="100%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#C9A84C"/>
                        <stop offset="100%" stopColor="#E6C56B"/>
                      </linearGradient>
                    </defs>
                    <path d="M18 4C18 4 12 12 12 18c0 4 2 7 4 8-1-3 0-6 2-7 2 1 3 4 2 7 2-1 4-4 4-8 0-6-6-14-6-14z" fill="url(#pwaGrad)"/>
                    <ellipse cx="18" cy="28" rx="5" ry="2" fill="url(#pwaGrad)" opacity="0.4"/>
                  </svg>
                </div>
                <div className="pwa-texts">
                  <div className="pwa-title">Instalar Lumina</div>
                  <div className="pwa-sub">Adicionar à tela inicial</div>
                </div>
                <div className="pwa-btns">
                  <button className="pwa-btn-no" onClick={handleDismiss}>Agora não</button>
                  <button className="pwa-btn-yes" onClick={handleInstall}>Instalar</button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
