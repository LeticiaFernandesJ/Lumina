import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Modal base ────────────────────────────────────────────────
export function Modal({ open, onClose, children, maxWidth = 480 }) {
  const contentRef = useRef(null);

  useEffect(() => {
    if (!open) return;

    // Salva scroll atual e bloqueia body
    const scrollY = window.scrollY;
    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      document.body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  // Fecha ao pressionar ESC
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && open) onClose?.(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 1000,
            background: 'rgba(0,0,0,0.78)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'flex-end', // mobile: ancora na base
            justifyContent: 'center',
            padding: 0,
            // iOS safe area
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
          className="modal-overlay"
        >
          <motion.div
            ref={contentRef}
            onClick={e => e.stopPropagation()}
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 60 }}
            transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            style={{
              background: '#161616',
              border: '1px solid #2A2A2A',
              borderRadius: '20px 20px 0 0', // arredondado só em cima no mobile
              padding: '28px 20px 24px',
              width: '100%',
              maxWidth: '100%',
              maxHeight: '92vh',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.5), 0 0 40px rgba(201,168,76,0.06)',
              position: 'relative',
              // Previne que o teclado virtual esconda o conteúdo
              paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
            }}
            className="modal-content"
          >
            {/* Handle bar — indica que pode fechar deslizando */}
            <div style={{
              width: 40, height: 4, borderRadius: 2,
              background: '#3A3A3A',
              margin: '0 auto 20px',
            }} />

            {/* Linha dourada decorativa */}
            <div style={{
              position: 'absolute', top: 0, left: '15%', right: '15%', height: 1,
              background: 'linear-gradient(90deg, transparent, rgba(201,168,76,0.35), transparent)',
            }} />

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
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
          {icon && (
            <div style={{
              width: 42, height: 42, borderRadius: 12, flexShrink: 0,
              background: 'rgba(201,168,76,0.1)',
              border: '1px solid rgba(201,168,76,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 20,
            }}>
              {icon}
            </div>
          )}
          <div style={{ minWidth: 0 }}>
            <h3 style={{
              fontFamily: 'Playfair Display, serif', fontSize: 19,
              color: '#E8DCC8', marginBottom: subtitle ? 3 : 0,
              lineHeight: 1.3,
            }}>{title}</h3>
            {subtitle && (
              <p style={{
                fontSize: 13, color: '#7A7060',
                fontFamily: 'DM Sans, sans-serif',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>{subtitle}</p>
            )}
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid #2A2A2A',
              color: '#7A7060', borderRadius: 8,
              // Área de toque mínima 44x44 para mobile
              minWidth: 44, minHeight: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, flexShrink: 0, cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onTouchStart={e => { e.currentTarget.style.background = 'rgba(201,168,76,0.1)'; }}
            onTouchEnd={e => { e.currentTarget.style.background = 'transparent'; }}
          >✕</button>
        )}
      </div>
    </div>
  );
}

// ─── Divisor ───────────────────────────────────────────────────
export function ModalDivider() {
  return <div style={{ height: 1, background: '#1E1E1E', margin: '18px 0' }} />;
}

// ─── Rodapé com botões ─────────────────────────────────────────
export function ModalFooter({ children }) {
  return (
    <div style={{
      display: 'flex', gap: 10, marginTop: 22,
      // No mobile, botões em coluna se tiver mais de 2
      flexWrap: 'wrap', justifyContent: 'flex-end',
    }}>
      {children}
    </div>
  );
}

// ─── Botões ────────────────────────────────────────────────────
export function ModalButton({ children, variant = 'primary', onClick, disabled, fullWidth, danger }) {
  const styles = {
    primary: { background: 'linear-gradient(135deg, #C9A84C, #E6C56B)', color: '#0A0A0A', border: 'none' },
    secondary: { background: 'transparent', color: '#C9A84C', border: '1px solid rgba(201,168,76,0.4)' },
    ghost: { background: 'transparent', color: '#7A7060', border: '1px solid #2A2A2A' },
    danger: { background: 'rgba(229,115,115,0.1)', color: '#E57373', border: '1px solid rgba(229,115,115,0.3)' },
  };

  const s = danger ? styles.danger : (styles[variant] || styles.primary);

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        ...s,
        // Altura mínima 48px para área de toque adequada no mobile
        minHeight: 48,
        padding: '12px 22px',
        borderRadius: 12,
        fontFamily: 'DM Sans, sans-serif',
        fontWeight: 600,
        fontSize: 15,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.2s',
        width: fullWidth ? '100%' : 'auto',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'manipulation',
      }}
    >
      {children}
    </button>
  );
}

// ─── Campo info ────────────────────────────────────────────────
export function ModalInfo({ label, children, accent }) {
  return (
    <div style={{
      background: '#111', borderRadius: 10, padding: '12px 14px',
      border: `1px solid ${accent ? 'rgba(201,168,76,0.2)' : '#1E1E1E'}`,
      marginBottom: 12,
    }}>
      {label && (
        <div style={{
          fontSize: 11, color: '#C9A84C', fontWeight: 600,
          letterSpacing: 1.5, textTransform: 'uppercase',
          marginBottom: 6, fontFamily: 'DM Sans, sans-serif',
        }}>{label}</div>
      )}
      <div style={{ fontSize: 14, color: '#C4B89A', lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif' }}>{children}</div>
    </div>
  );
}

// ─── Modal de confirmação ──────────────────────────────────────
export function ConfirmModal({ open, onClose, onConfirm, title, message, confirmLabel = 'Confirmar', cancelLabel = 'Cancelar', danger = false, icon, loading = false }) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader icon={icon || (danger ? '⚠️' : '❓')} title={title} onClose={onClose} />
      <p style={{ fontSize: 14, color: '#C4B89A', lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif', marginBottom: 4 }}>{message}</p>
      <ModalFooter>
        <ModalButton variant="ghost" onClick={onClose} disabled={loading} fullWidth>{cancelLabel}</ModalButton>
        <ModalButton danger={danger} variant={danger ? 'danger' : 'primary'} onClick={onConfirm} disabled={loading} fullWidth>
          {loading
            ? <><span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> Aguarde...</>
            : confirmLabel}
        </ModalButton>
      </ModalFooter>
    </Modal>
  );
}

// ─── Modal de alerta ───────────────────────────────────────────
export function AlertModal({ open, onClose, title, message, icon }) {
  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader icon={icon || 'ℹ️'} title={title} onClose={onClose} />
      <p style={{ fontSize: 14, color: '#C4B89A', lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif' }}>{message}</p>
      <ModalFooter>
        <ModalButton onClick={onClose} fullWidth>Entendi</ModalButton>
      </ModalFooter>
    </Modal>
  );
}

// ─── Modal de sucesso ──────────────────────────────────────────
export function SuccessModal({ open, onClose, title, message, action, actionLabel = 'Ver agora' }) {
  return (
    <Modal open={open} onClose={onClose}>
      <div style={{ textAlign: 'center', padding: '8px 0' }}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
          style={{ fontSize: 52, marginBottom: 16 }}
        >🎉</motion.div>
        <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 22, color: '#E8DCC8', marginBottom: 10 }}>{title}</h3>
        <p style={{ fontSize: 14, color: '#C4B89A', lineHeight: 1.7, fontFamily: 'DM Sans, sans-serif', marginBottom: 24 }}>{message}</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {action && <ModalButton onClick={action} fullWidth>{actionLabel}</ModalButton>}
          <ModalButton variant="ghost" onClick={onClose} fullWidth>Fechar</ModalButton>
        </div>
      </div>
    </Modal>
  );
}

// ─── Hook useModal ─────────────────────────────────────────────
export function useModal(initial = false) {
  const [open, setOpen] = React.useState(initial);
  return {
    open,
    show: () => setOpen(true),
    hide: () => setOpen(false),
    toggle: () => setOpen(v => !v),
  };
}
