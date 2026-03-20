import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Constants ────────────────────────────────────────────────────────────────

const DISMISS_COOLDOWN_MS = 86_400_000; // 24 hours
const SHOW_DELAY_MS = 3_000;
const STORAGE_KEY = 'pwa_dismissed';

const COLORS = {
  gold: '#C9A84C',
  goldLight: '#E6C56B',
  bg: '#1A1A1A',
  bgDark: '#111',
  border: 'rgba(201,168,76,0.4)',
  borderSubtle: '#2A2A2A',
  borderMuted: '#333',
  textPrimary: '#E8DCC8',
  textMuted: '#7A7060',
  black: '#0A0A0A',
};

const SPRING = { type: 'spring', stiffness: 300, damping: 28 };

// ─── Sub-components ───────────────────────────────────────────────────────────

function AppIcon() {
  return (
    <div style={{
      width: 40,
      height: 40,
      borderRadius: 10,
      background: COLORS.bgDark,
      border: `1px solid ${COLORS.borderSubtle}`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <svg width="22" height="22" viewBox="0 0 36 36">
        <defs>
          <linearGradient id="pwaFg" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor={COLORS.gold} />
            <stop offset="100%" stopColor={COLORS.goldLight} />
          </linearGradient>
        </defs>
        <path
          d="M18 4C18 4 12 12 12 18c0 4 2 7 4 8-1-3 0-6 2-7 2 1 3 4 2 7 2-1 4-4 4-8 0-6-6-14-6-14z"
          fill="url(#pwaFg)"
        />
        <ellipse cx="18" cy="28" rx="5" ry="2" fill="url(#pwaFg)" opacity="0.4" />
      </svg>
    </div>
  );
}

function AppInfo() {
  return (
    <div style={{ flex: 1, minWidth: 0 }}>
      <div style={{
        fontSize: 13,
        fontWeight: 700,
        color: COLORS.textPrimary,
        fontFamily: 'DM Sans, sans-serif',
        lineHeight: 1.3,
      }}>
        Instalar Lumina
      </div>
      <div style={{
        fontSize: 11,
        color: COLORS.textMuted,
        fontFamily: 'DM Sans, sans-serif',
        marginTop: 2,
        lineHeight: 1.3,
      }}>
        Adicionar à tela inicial
      </div>
    </div>
  );
}

function ActionButtons({ onInstall, onDismiss }) {
  const baseButton = {
    borderRadius: 8,
    padding: '0 12px',
    height: 36,
    fontFamily: 'DM Sans, sans-serif',
    fontSize: 12,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    WebkitTapHighlightColor: 'transparent',
  };

  return (
    <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
      <button
        onClick={onDismiss}
        style={{
          ...baseButton,
          background: 'transparent',
          border: `1px solid ${COLORS.borderMuted}`,
          color: COLORS.textMuted,
        }}
      >
        Agora não
      </button>
      <button
        onClick={onInstall}
        style={{
          ...baseButton,
          padding: '0 16px',
          background: `linear-gradient(135deg, ${COLORS.gold}, ${COLORS.goldLight})`,
          border: 'none',
          color: COLORS.black,
          fontWeight: 700,
        }}
      >
        Instalar
      </button>
    </div>
  );
}

function InstallCard({ onInstall, onDismiss }) {
  return (
    <div style={{
      width: '100%',
      maxWidth: 440,
      background: COLORS.bg,
      border: `1px solid ${COLORS.border}`,
      borderRadius: 14,
      boxShadow: '0 8px 32px rgba(0,0,0,0.6)',
      overflow: 'hidden',
      pointerEvents: 'auto',
    }}>
      {/* Gold top bar */}
      <div style={{
        height: 2,
        background: `linear-gradient(90deg, ${COLORS.gold}, ${COLORS.goldLight}, ${COLORS.gold})`,
      }} />

      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
      }}>
        <AppIcon />
        <AppInfo />
        <ActionButtons onInstall={onInstall} onDismiss={onDismiss} />
      </div>
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isAlreadyInstalled() {
  return window.matchMedia('(display-mode: standalone)').matches;
}

function isDismissedRecently() {
  const dismissed = localStorage.getItem(STORAGE_KEY);
  return dismissed && Date.now() - parseInt(dismissed) < DISMISS_COOLDOWN_MS;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function PWAInstall() {
  const [prompt, setPrompt] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isAlreadyInstalled() || isDismissedRecently()) return;

    const handler = (e) => {
      e.preventDefault();
      setPrompt(e);
      setTimeout(() => setShow(true), SHOW_DELAY_MS);
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
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  if (!prompt) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={SPRING}
          style={{
            position: 'fixed',
            bottom: 20,
            left: 0,
            right: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            padding: '0 16px',
            zIndex: 9999,
            pointerEvents: 'none',
          }}
        >
          <InstallCard onInstall={handleInstall} onDismiss={handleDismiss} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}