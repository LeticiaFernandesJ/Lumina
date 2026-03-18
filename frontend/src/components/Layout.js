import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import ToastContainer from './Toast';
import { useToast } from '../hooks/useToast';

export const ToastContext = React.createContext(null);

export default function Layout() {
  const { toasts, toast, removeToast } = useToast();

  return (
    <ToastContext.Provider value={toast}>
      <div style={{ display: 'flex', minHeight: '100vh', background: '#0A0A0A' }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 240, minHeight: '100vh', transition: 'margin-left 0.3s' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 32px' }}>
            <Outlet />
          </div>
        </main>
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </div>
    </ToastContext.Provider>
  );
}
