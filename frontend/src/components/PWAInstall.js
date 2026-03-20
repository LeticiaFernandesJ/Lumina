import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Hook exportado para usar no botão de login
export function usePWAInstall() {
  const [prompt, setPrompt] = useState(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    if (window.__pwaPrompt) {
      setPrompt(window.__pwaPrompt);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      window.__pwaPrompt = e;
      setPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  return { prompt, isIOS, isInstalled };
}

// Modal de instruções iOS
export function IOSInstallModal({ open, onClose }) {
  return (
    <AnimatePresence>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            padding: '0 16px 32px',
          }}
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{
              width: '100%', maxWidth: 440,
              background: '#161616',
              border: '1px solid rgba(201,168,76,0.35)',
              borderRadius: 20,
              overflow: 'hidden',
              boxShadow: '0 -4px 40px rgba(0,0,0,0.5)',
            }}
          >
            {/* Linha dourada */}
            <div style={{ height: 2, background: 'linear-gradient(90deg, #C9A84C, #E6C56B, #C9A84C)' }} />

            <div style={{ padding: '24px 20px 28px' }}>
              {/* Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
                <div style={{
                  width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                  background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <svg width="28" height="28" viewBox="0 0 36 36">
                    <defs><linearGradient id="iosG" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#C9A84C"/><stop offset="100%" stopColor="#E6C56B"/></linearGradient></defs>
                    <path d="M18 4C18 4 12 12 12 18c0 4 2 7 4 8-1-3 0-6 2-7 2 1 3 4 2 7 2-1 4-4 4-8 0-6-6-14-6-14z" fill="url(#iosG)"/>
                    <ellipse cx="18" cy="28" rx="5" ry="2" fill="url(#iosG)" opacity="0.4"/>
                  </svg>
                </div>
                <div>
                  <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 19, color: '#E8DCC8', margin: 0 }}>Instalar Lumina</h3>
                  <p style={{ fontSize: 13, color: '#7A7060', fontFamily: 'DM Sans, sans-serif', margin: '3px 0 0' }}>Siga os passos abaixo</p>
                </div>
              </div>

              {/* Passos */}
              {[
                {
                  n: 1,
                  text: 'Toque no botão Compartilhar na barra do Safari',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M12 2v13M8 6l4-4 4 4" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M20 16v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ),
                },
                {
                  n: 2,
                  text: 'Role para baixo e toque em "Adicionar à Tela de Início"',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <rect x="3" y="3" width="18" height="18" rx="4" stroke="#C9A84C" strokeWidth="2"/>
                      <path d="M12 8v8M8 12h8" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  ),
                },
                {
                  n: 3,
                  text: 'Toque em "Adicionar" no canto superior direito',
                  icon: (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ),
                },
              ].map(step => (
                <div key={step.n} style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: 'rgba(201,168,76,0.08)', border: '1px solid rgba(201,168,76,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {step.icon}
                  </div>
                  <div style={{ flex: 1, paddingTop: 8 }}>
                    <span style={{ fontSize: 11, color: '#C9A84C', fontWeight: 700, fontFamily: 'DM Sans, sans-serif', letterSpacing: 1 }}>PASSO {step.n}</span>
                    <p style={{ fontSize: 14, color: '#C4B89A', fontFamily: 'DM Sans, sans-serif', margin: '3px 0 0', lineHeight: 1.5 }}>{step.text}</p>
                  </div>
                </div>
              ))}

              <button
                onClick={onClose}
                style={{
                  width: '100%', height: 48, marginTop: 8,
                  background: 'linear-gradient(135deg, #C9A84C, #E6C56B)',
                  border: 'none', borderRadius: 12,
                  color: '#0A0A0A', fontFamily: 'DM Sans, sans-serif',
                  fontWeight: 700, fontSize: 15, cursor: 'pointer',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                Entendido!
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Botão de instalação — usado diretamente nas páginas de auth
export function InstallAppButton() {
  const { prompt, isIOS, isInstalled } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled) return null;
  // No Android só mostra se tiver o prompt disponível
  if (!isIOS && !prompt) return null;

  const handleClick = async () => {
    if (isIOS) {
      setShowIOSModal(true);
      return;
    }
    if (!prompt) return;
    prompt.prompt();
    await prompt.userChoice;
    window.__pwaPrompt = null;
  };

  return (
    <>
      <button
        onClick={handleClick}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          width: '100%', height: 44,
          background: 'transparent',
          border: '1px solid rgba(201,168,76,0.3)',
          borderRadius: 10, marginTop: 12,
          color: '#C9A84C', fontFamily: 'DM Sans, sans-serif',
          fontSize: 14, fontWeight: 500, cursor: 'pointer',
          transition: 'all 0.2s',
          WebkitTapHighlightColor: 'transparent',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(201,168,76,0.08)'}
        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M12 2v13M8 15l4 4 4-4" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 20h16" stroke="#C9A84C" strokeWidth="2" strokeLinecap="round"/>
        </svg>
        Instalar o app
      </button>

      <IOSInstallModal open={showIOSModal} onClose={() => setShowIOSModal(false)} />
    </>
  );
}

// Componente padrão (mantido para compatibilidade — não faz nada agora)
export default function PWAInstall() {
  return null;
}
