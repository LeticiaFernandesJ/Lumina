import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

export default function PWAInstall() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [ready, setReady] = useState(false);
  const location = useLocation();

  // Páginas de auth — não mostrar banner
  const isAuthPage = ['/', '/login', '/register'].includes(location.pathname);

  useEffect(() => {
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    const dismissed = localStorage.getItem('pwa_dismissed');
    if (dismissed) return;

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    if (ios) {
      setReady(true);
      return;
    }

    // Captura o evento — pode já ter sido capturado no index.html
    if (window.__pwaPrompt) {
      setPrompt(window.__pwaPrompt);
      setReady(true);
      return;
    }

    const handler = (e) => {
      e.preventDefault();
      window.__pwaPrompt = e;
      setPrompt(e);
      setReady(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // Mostra o banner 2.5s após entrar numa página que não é login
  useEffect(() => {
    if (!ready || isAuthPage || isInstalled || show) return;

    const dismissed = localStorage.getItem('pwa_dismissed');
    if (dismissed) return;

    const t = setTimeout(() => setShow(true), 2500);
    return () => clearTimeout(t);
  }, [ready, isAuthPage, isInstalled]);

  // Esconde ao voltar para login
  useEffect(() => {
    if (isAuthPage) setShow(false);
  }, [isAuthPage]);

  const handleInstall = () => {
    if (!prompt) return;
    prompt.prompt();
    prompt.userChoice.then((result) => {
      if (result.outcome === 'accepted') {
        setShow(false);
        setIsInstalled(true);
      }
    });
  };

  const handleDismiss = () => {
    setShow(false);
    localStorage.setItem('pwa_dismissed', 'true');
  };

  if (isInstalled || !ready) return null;

  // ── iOS — instrução manual ──────────────────────────────────
  if (isIOS) {
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
              bottom: 80,
              left: '50%',
              transform: 'translateX(-50%)',
              width: 'calc(100vw - 32px)',
              maxWidth: 440,
              zIndex: 99999,
              background: '#161616',
              border: '1px solid rgba(201,168,76,0.3)',
              borderRadius: 16,
              padding: 16,
              boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
            }}
          >
            {/* Seta para barra Safari */}
            <div style={{
              position: 'absolute', bottom: -8, left: '50%',
              transform: 'translateX(-50%) rotate(45deg)',
              width: 14, height: 14,
              background: '#161616',
              border: '1px solid rgba(201,168,76,0.3)',
              borderTop: 'none', borderLeft: 'none',
            }} />
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="22" height="22" viewBox="0 0 36 36">
                  <defs><linearGradient id="pwaG1" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stopColor="#C9A84C"/><stop offset="100%" stopColor="#E6C56B"/></linearGradient></defs>
                  <path d="M18 4C18 4 12 12 12 18c0 4 2 7 4 8-1-3 0-6 2-7 2 1 3 4 2 7 2-1 4-4 4-8 0-6-6-14-6-14z" fill="url(#pwaG1)"/>
                  <ellipse cx="18" cy="28" rx="5" ry="2" fill="url(#pwaG1)" opacity="0.4"/>
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#E8DCC8', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>Instalar Lumina</p>
                <p style={{ fontSize: 12, color: '#C4B89A', fontFamily: 'DM Sans, sans-serif', marginTop: 6, lineHeight: 1.6 }}>
                  Toque em{' '}
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 7px', borderRadius: 5, fontSize: 11, background: 'rgba(255,255,255,0.08)', color: '#C9A84C' }}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none"><path d="M12 2v13M8 6l4-4 4 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 16v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
                    Compartilhar
                  </span>{' '}
                  e depois <span style={{ color: '#C9A84C', fontWeight: 600 }}>"Adicionar à Tela de Início"</span>
                </p>
              </div>
              <button onClick={handleDismiss} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#7A7060', padding: 4, flexShrink: 0, WebkitTapHighlightColor: 'transparent' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  // ── Android / Chrome ────────────────────────────────────────
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
            left: '50%',
            transform: 'translateX(-50%)',
            width: 'calc(100vw - 32px)',
            maxWidth: 440,
            zIndex: 99999,
            background: '#161616',
            border: '1px solid rgba(201,168,76,0.3)',
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
          }}
        >
          <div style={{ height: 2, background: 'linear-gradient(90deg, #C9A84C, #E6C56B, #C9A84C)' }} />
          <div style={{ padding: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <img src="/icons/icon-192x192.png" alt="Lumina" style={{ width: 48, height: 48, borderRadius: 12, flexShrink: 0 }} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#E8DCC8', fontFamily: 'DM Sans, sans-serif', margin: 0 }}>Instalar Lumina</p>
                <p style={{ fontSize: 12, color: '#7A7060', fontFamily: 'DM Sans, sans-serif', margin: '2px 0 0' }}>Adicionar à tela inicial</p>
              </div>
              <button onClick={handleDismiss} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#7A7060', padding: 6, flexShrink: 0, borderRadius: 8, WebkitTapHighlightColor: 'transparent' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg>
              </button>
            </div>
            <p style={{ fontSize: 13, color: '#C4B89A', fontFamily: 'DM Sans, sans-serif', lineHeight: 1.6, margin: '0 0 16px' }}>
              Instale o app para acessar seus estudos mais rápido, sem precisar abrir o navegador.
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleDismiss} style={{ flex: 1, height: 44, borderRadius: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#7A7060', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                Agora não
              </button>
              <button onClick={handleInstall} style={{ flex: 1, height: 44, borderRadius: 10, background: 'linear-gradient(135deg, #C9A84C, #E6C56B)', border: 'none', color: '#0A0A0A', fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 700, cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}>
                Instalar
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
