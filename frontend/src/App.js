import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { LoginPage, RegisterPage } from './pages/AuthPages';
import Dashboard from './pages/Dashboard';
import PDFs from './pages/PDFs';
import Flashcards from './pages/Flashcards';
import Redacao from './pages/Redacao';
import PlanoEstudos from './pages/PlanoEstudos';
import Frequencia from './pages/Frequencia';
import Configuracoes from './pages/Configuracoes';
import './index.css';
import PWAInstall from './components/PWAInstall';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
  const { user } = useAuth();
  return !user ? children : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  return (
    <>
    <PWAInstall />
    <Routes>
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pdfs" element={<PDFs />} />
        <Route path="flashcards" element={<Flashcards />} />
        <Route path="redacao" element={<Redacao />} />
        <Route path="plano" element={<PlanoEstudos />} />
        <Route path="frequencia" element={<Frequencia />} />
        <Route path="configuracoes" element={<Configuracoes />} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
