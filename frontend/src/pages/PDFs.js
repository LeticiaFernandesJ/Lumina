import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContext } from '../components/Layout';
import api from '../utils/api';

function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 16, padding: 32, maxWidth: 380, width: '90%' }}>
        <h3 style={{ marginBottom: 16, fontFamily: 'Playfair Display, serif' }}>Confirmar ação</h3>
        <p style={{ color: '#C4B89A', marginBottom: 24, fontSize: 15 }}>{message}</p>
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onCancel} className="btn-secondary" style={{ flex: 1 }}>Cancelar</button>
          <button onClick={onConfirm} style={{ flex: 1, background: '#E57373', color: '#fff', border: 'none', borderRadius: 10, padding: '12px', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, cursor: 'pointer' }}>Excluir</button>
        </div>
      </motion.div>
    </div>
  );
}

function FlashcardModal({ material, onClose, onGenerated }) {
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const toast = useContext(ToastContext);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/api/materials/${material.id}/generate-flashcards`, { count });
      toast(`✨ ${data.generated} flashcards gerados com sucesso!`, 'success');
      onGenerated();
      onClose();
    } catch (e) {
      toast(e.response?.data?.error || 'Erro ao gerar flashcards', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 20, padding: 36, maxWidth: 420, width: '90%' }}>
        <h3 style={{ marginBottom: 6, fontFamily: 'Playfair Display, serif', fontSize: 22 }}>✨ Gerar Flashcards com IA</h3>
        <p style={{ color: '#7A7060', fontSize: 14, marginBottom: 28 }}>Material: <strong style={{ color: '#C4B89A' }}>{material.title}</strong></p>

        <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 12 }}>Quantidade de flashcards</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 28 }}>
          {[10, 20, 30, 50].map(n => (
            <button key={n} onClick={() => setCount(n)} style={{
              padding: '12px', borderRadius: 10, border: '1px solid', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: 15, transition: 'all 0.2s',
              borderColor: count === n ? '#C9A84C' : '#2A2A2A',
              background: count === n ? 'rgba(201,168,76,0.15)' : '#111',
              color: count === n ? '#C9A84C' : '#7A7060',
            }}>
              {n}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '16px 0', marginBottom: 16 }}>
            <span className="spinner" />
            <p style={{ color: '#7A7060', fontSize: 13, marginTop: 10 }}>A IA está estudando o material...</p>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }} disabled={loading}>Cancelar</button>
          <button onClick={generate} className="btn-primary" style={{ flex: 1 }} disabled={loading}>
            {loading ? 'Gerando...' : `Gerar ${count} cards`}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function PDFs() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const toast = useContext(ToastContext);

  const fetchMaterials = () => {
    api.get('/api/materials').then(r => setMaterials(r.data)).finally(() => setLoading(false));
  };

  useEffect(() => { fetchMaterials(); }, []);

  const onDrop = useCallback(async (acceptedFiles) => {
    const file = acceptedFiles[0];
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('pdf', file);
    formData.append('title', uploadTitle || file.name.replace('.pdf', ''));
    try {
      await api.post('/api/materials/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast('PDF enviado com sucesso!', 'success');
      setUploadTitle('');
      fetchMaterials();
    } catch (e) {
      toast(e.response?.data?.error || 'Erro ao enviar PDF', 'error');
    } finally {
      setUploading(false);
    }
  }, [uploadTitle, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 });

  const handleDelete = async () => {
    try {
      await api.delete(`/api/materials/${deleteTarget.id}`);
      toast('Material excluído', 'info');
      fetchMaterials();
    } catch {
      toast('Erro ao excluir', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: 32, marginBottom: 6 }}>Meus <span className="gold-gradient">PDFs</span></h1>
        <p style={{ color: '#7A7060' }}>Envie materiais e gere flashcards inteligentes com IA</p>
      </motion.div>

      {/* Upload */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card" style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, marginBottom: 16 }}>Enviar novo PDF</h2>
        <input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="Título do material (opcional)" style={{ marginBottom: 16 }} />
        <div {...getRootProps()} style={{
          border: `2px dashed ${isDragActive ? '#C9A84C' : '#2A2A2A'}`,
          borderRadius: 14, padding: '40px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s',
          background: isDragActive ? 'rgba(201,168,76,0.05)' : 'transparent',
        }}>
          <input {...getInputProps()} />
          {uploading ? (
            <div>
              <span className="spinner" style={{ marginBottom: 12 }} />
              <p style={{ color: '#C9A84C', fontWeight: 500 }}>Processando PDF...</p>
            </div>
          ) : (
            <div>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📄</div>
              <p style={{ color: isDragActive ? '#C9A84C' : '#C4B89A', fontWeight: 500, fontSize: 16, marginBottom: 6 }}>
                {isDragActive ? 'Solte o arquivo aqui!' : 'Arraste o PDF ou clique para selecionar'}
              </p>
              <p style={{ color: '#7A7060', fontSize: 13 }}>Máximo 20MB · Apenas PDFs</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div>
      ) : materials.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7A7060' }}>
          <div style={{ fontSize: 56, marginBottom: 12 }}>📚</div>
          <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#C4B89A', marginBottom: 8 }}>Nenhum material ainda</h3>
          <p>Envie seu primeiro PDF para começar!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
          {materials.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card"
              style={{ position: 'relative', cursor: 'default' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div style={{ fontSize: 28 }}>📄</div>
                <button onClick={() => setDeleteTarget(m)} style={{ background: 'transparent', color: '#7A7060', fontSize: 18, padding: 4, borderRadius: 6, transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#E57373'}
                  onMouseLeave={e => e.target.style.color = '#7A7060'}
                >✕</button>
              </div>
              <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 17, marginBottom: 6, lineHeight: 1.3 }}>{m.title}</h3>
              <p style={{ fontSize: 12, color: '#7A7060', marginBottom: 20 }}>
                {new Date(m.created_at).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
              <button onClick={() => setSelectedMaterial(m)} className="btn-primary" style={{ width: '100%', fontSize: 14, padding: '10px' }}>
                ✨ Gerar Flashcards com IA
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {selectedMaterial && <FlashcardModal material={selectedMaterial} onClose={() => setSelectedMaterial(null)} onGenerated={fetchMaterials} />}
        {deleteTarget && <ConfirmModal message={`Deseja excluir "${deleteTarget.title}"? Esta ação também removerá os flashcards gerados.`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
      </AnimatePresence>
    </div>
  );
}
