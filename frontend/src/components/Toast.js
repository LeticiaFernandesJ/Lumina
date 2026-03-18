import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ToastContainer({ toasts, removeToast }) {
  const icons = { success: '✓', error: '✕', info: 'ℹ', warning: '⚠' };
  const colors = { success: '#4CAF50', error: '#E57373', info: '#C9A84C', warning: '#FFB74D' };

  return (
    <div style={{ position: 'fixed', top: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 12 }}>
      <AnimatePresence>
        {toasts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 80 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            onClick={() => removeToast(t.id)}
            style={{
              background: '#161616',
              border: `1px solid ${colors[t.type]}40`,
              borderLeft: `3px solid ${colors[t.type]}`,
              borderRadius: 12,
              padding: '14px 18px',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              maxWidth: 360,
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
          >
            <span style={{ color: colors[t.type], fontSize: 16, fontWeight: 700 }}>{icons[t.type]}</span>
            <span style={{ color: '#E8DCC8', fontSize: 14, fontFamily: 'DM Sans, sans-serif' }}>{t.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
