import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Modal base ────────────────────────────────────────────────
export function Modal({ open, onClose, children, maxWidth = 480 }) {
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
        >
          <motion.div
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 16 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            style={{
              background: '#161616',
              border: '1px solid #2A2A2A',
              borderRadius: 20,
              padding: '32px 28px',
              width: '100%',
              maxWidth,
              boxShadow: '0 24px 60px rgba(0,0,0,0.6), 0 0 40px rgba(201,168,76,0.06)',
              position: 'relative',
            }}
          >
            {/* Linha dourada topo */}
            <div style={{ position: 'absolute', top: 0, left: '10%', right: '10%', height: 1, background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)' }} />
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ─── Header do modal ───────────────────────────────────────────
export function ModalHeader({ icon, title, subtitle, onClose }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {icon && (
            <div style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22, flexShrink: 0,
            }}>
              {icon}
            </div>
          )}
          <div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 20, color: '#E8DCC8', marginBottom: subtitle ? 3 : 0 }}>{title}</h3>
            {subtitle && <p style={{ fontSize: 13, color: '#7A7060', fontFamily: 'DM Sans, sans-serif' }}>{subtitle}</p>}
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{
            background: 'transparent', border: '1px solid #2A2A2A', color: '#7A7060',
            borderRadius: 8, width: 32, height: 32, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, flexShrink: 0, transition: 'all 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#C9A84C'; e.currentTarget.style.color = '#C9A84C'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#7A7060'; }}
          >✕</button>
        )}
      </div>
    </div>
  );
}

// ─── Divisor ───────────────────────────────────────────────────
export function ModalDivider() {
  return <div style={{ height: 1, background: '#1E1E1E', margin: '20px 0' }} />;
}

// ─── Rodapé com botões ─────────────────────────────────────────
export function ModalFooter({ children }) {
  return (
    <div style={{ display: 'flex', gap: 10, marginTop: 24, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
      {children}
    </div>
  );
}

// ─── Botões padrão ─────────────────────────────────────────────
export function ModalButton({ children, variant = 'primary', onClick, disabled, fullWidth, danger }) {
  const styles = {
    primary: {
      background: 'linear-gradient(135deg, #C9A84C, #E6C56B)',
      color: '#0A0A0A', border: 'none',
    },
    secondary: {
      background: 'transparent',
      color: '#C9A84C',
      border: '1px solid rgba(201,168,76,0.4)',
    },
    ghost: {
      background: 'transparent',
      color: '#7A7060',
      border: '1px solid #2A2A2A',
    },
    danger: {
      background: 'rgba(229,115,115,0.1)',
      color: '#E57373',
      border: '1px solid rgba(229,115,115,0.3)',
    },
  };

  const s = danger ? styles.danger : styles[variant] || styles.primary;

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...s,
        padding: '11px 22px',
        borderRadius: 10,
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: 600,
        fontSize: 14,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s',
        width: fullWidth ? '100%' : 'auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
    >
      {children}
    </button>
  );
}

// ─── Campo info dentro do modal ────────────────────────────────
export function ModalInfo({ label, children, accent }) {
  return (
    <div style={{
      background: '#111', borderRadius: 10, padding: '12px 16px',
      border: `1px solid ${accent ? 'rgba(201,168,76,0.2)' : '#1E1E1E'}`,
      marginBottom: 12,
    }}>
      {label && <div style={{ fontSize: 11, color: '#C9A84C', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 6, fontFamily: 'DM Sans, sans-serif' }}>{label}</div>}
      <div style={{ fontSize: 13, color: '#C4B89A', lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif' }}>{children}</div>
    </div>
  );
}

// ─── Modal de confirmação pronto pra usar ──────────────────────
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false, icon, loading = false }) {
  return (
    <Modal open={open} onClose={onClose} maxWidth={400}>
      <ModalHeader icon={icon || (danger ? '⚠️' : '❓')} title={title} onClose={onClose} />
      <p style={{ fontSize: 14, color: '#C4B89A', lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif', marginBottom: 8 }}>{message}</p>
      <ModalFooter>
        <ModalButton variant="ghost" onClick={onClose} disabled={loading}>{cancelLabel}</ModalButton>
        <ModalButton danger={danger} variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={loading}>
          {loading ? <><span className="spinner" style={{ width: 14, height: 14, borderWidth: 2 }} /> Aguarde...</> : confirmLabel}
        </ModalButton>
      </ModalFooter>
    </Modal>
  );
}

// ─── Modal de alerta simples ───────────────────────────────────
export function AlertModal({ open, onClose, title, message, icon }) {
  return (
    <Modal open={open} onClose={onClose} maxWidth={400}>
      <ModalHeader icon={icon || 'ℹ️'} title={title} onClose={onClose} />
      <p style={{ fontSize: 14, color: '#C4B89A', lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif' }}>{message}</p>
      <ModalFooter>
        <ModalButton onClick={onClose}>Entendi</ModalButton>
      </ModalFooter>
    </Modal>
  );
}

// ─── Modal de sucesso ──────────────────────────────────────────
export function SuccessModal({ open, onClose, title, message, action, actionLabel = 'Ver agora' }) {
  return (
    <Modal open={open} onClose={onClose} maxWidth={400}>
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 300 }} style={{ fontSize: 52, marginBottom: 16 }}>🎉</motion.div>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#E8DCC8', marginBottom: 10 }}>{title}</h3>
        <p style={{ fontSize: 14, color: '#C4B89A', lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif', marginBottom: 24 }}>{message}</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <ModalButton variant="ghost" onClick={onClose}>Fechar</ModalButton>
          {action && <ModalButton onClick={action}>{actionLabel}</ModalButton>}
        </div>
      </div>
    </Modal>
  );
}

// ─── Hook useModal ─────────────────────────────────────────────
export function useModal(initial = false) {
  const [open, setOpen] = React.useState(initial);
  return { open, show: () => setOpen(true), hide: () => setOpen(false), toggle: () => setOpen(v => !v) };
}
