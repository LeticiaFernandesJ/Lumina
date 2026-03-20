import React, { useState, useEffect, useContext, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastContext } from '../components/Layout';
import api from '../utils/api';
import { Modal, ModalHeader, ModalButton, ModalFooter, ModalInfo, ConfirmModal, useModal } from '../components/Modal';

}

function FlashcardModal({ material, onClose, onGenerated }) {
  const [count, setCount] = useState(10);
  const [loading, setLoading] = useState(false);
  const toast = useContext(ToastContext);

  const generate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/api/materials/${material.id}/generate-flashcards`, { count });
      toast(`✨ ${data.generated} flashcards gerados!`, 'success');
      onGenerated();
      onClose();
    } catch (e) {
      toast(e.response?.data?.error || 'Erro ao gerar flashcards', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 20 }}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 20, padding: 28, maxWidth: 420, width: '100%' }}>
        <h3 style={{ marginBottom: 6, fontFamily: 'Playfair Display, serif', fontSize: 20 }}>✨ Gerar Flashcards com IA</h3>
        <p style={{ color: '#7A7060', fontSize: 13, marginBottom: 24 }}>Material: <strong style={{ color: '#C4B89A' }}>{material.title}</strong></p>
        <label style={{ fontSize: 13, color: '#C4B89A', display: 'block', marginBottom: 12 }}>Quantidade</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 24 }}>
          {[10, 20, 30, 50].map(n => (
            <button key={n} onClick={() => setCount(n)} style={{
              padding: '11px', borderRadius: 10, border: '1px solid', fontFamily: 'DM Sans, sans-serif', fontWeight: 600, cursor: 'pointer', fontSize: 15, transition: 'all 0.2s',
              borderColor: count === n ? '#C9A84C' : '#2A2A2A', background: count === n ? 'rgba(201,168,76,0.15)' : '#111', color: count === n ? '#C9A84C' : '#7A7060',
            }}>{n}</button>
          ))}
        </div>
        {loading && <div style={{ textAlign: 'center', padding: '12px 0', marginBottom: 14 }}><span className="spinner" /><p style={{ color: '#7A7060', fontSize: 13, marginTop: 8 }}>Gerando...</p></div>}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={onClose} className="btn-secondary" style={{ flex: 1 }} disabled={loading}>Cancelar</button>
          <button onClick={generate} className="btn-primary" style={{ flex: 1 }} disabled={loading}>{loading ? 'Gerando...' : `Gerar ${count}`}</button>
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

  const fetchMaterials = () => api.get('/api/materials').then(r => setMaterials(r.data)).finally(() => setLoading(false));
  useEffect(() => { fetchMaterials(); }, []);

  const onDrop = useCallback(async (files) => {
    const file = files[0]; if (!file) return;
    setUploading(true);
    const form = new FormData();
    form.append('pdf', file);
    form.append('title', uploadTitle || file.name.replace('.pdf', ''));
    try {
      await api.post('/api/materials/upload', form, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast('PDF enviado!', 'success'); setUploadTitle(''); fetchMaterials();
    } catch (e) { toast(e.response?.data?.error || 'Erro ao enviar', 'error'); }
    finally { setUploading(false); }
  }, [uploadTitle]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'] }, maxFiles: 1 });

  const handleDelete = async () => {
    try { await api.delete(`/api/materials/${deleteTarget.id}`); toast('Excluído', 'info'); fetchMaterials(); }
    catch { toast('Erro ao excluir', 'error'); }
    finally { setDeleteTarget(null); }
  };

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 32, marginBottom: 4 }}>Meus <span className="gold-gradient">PDFs</span></h1>
        <p style={{ color: '#7A7060' }}>Envie materiais e gere flashcards com IA</p>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 17, marginBottom: 14 }}>Enviar PDF</h2>
        <input value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} placeholder="Título (opcional)" style={{ marginBottom: 12 }} />
        <div {...getRootProps()} style={{ border: `2px dashed ${isDragActive ? '#C9A84C' : '#2A2A2A'}`, borderRadius: 12, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', background: isDragActive ? 'rgba(201,168,76,0.05)' : 'transparent' }}>
          <input {...getInputProps()} />
          {uploading ? (
            <div><span className="spinner" style={{ marginBottom: 8 }} /><p style={{ color: '#C9A84C' }}>Processando...</p></div>
          ) : (
            <div>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
              <p style={{ color: isDragActive ? '#C9A84C' : '#C4B89A', fontWeight: 500, marginBottom: 4 }}>{isDragActive ? 'Solte aqui!' : 'Arraste ou clique'}</p>
              <p style={{ color: '#7A7060', fontSize: 12 }}>Máximo 20MB · PDF</p>
            </div>
          )}
        </div>
      </motion.div>

      {loading ? <div style={{ textAlign: 'center', padding: 40 }}><span className="spinner" /></div> :
        materials.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px 20px', color: '#7A7060' }}>
            <div style={{ fontSize: 48, marginBottom: 10 }}>📚</div>
            <h3 style={{ fontFamily: 'Playfair Display, serif', color: '#C4B89A', marginBottom: 6 }}>Nenhum PDF ainda</h3>
            <p>Envie seu primeiro PDF!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 16 }}>
            {materials.map((m, i) => (
              <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <span style={{ fontSize: 26 }}>📄</span>
                  <button onClick={() => setDeleteTarget(m)} style={{ background: 'transparent', color: '#7A7060', fontSize: 16, padding: 4, border: 'none', cursor: 'pointer', borderRadius: 6 }}
                    onMouseEnter={e => e.target.style.color = '#E57373'} onMouseLeave={e => e.target.style.color = '#7A7060'}>✕</button>
                </div>
                <h3 style={{ fontFamily: 'Playfair Display, serif', fontSize: 16, marginBottom: 4, lineHeight: 1.3 }}>{m.title}</h3>
                <p style={{ fontSize: 12, color: '#7A7060', marginBottom: 16 }}>{new Date(m.created_at).toLocaleDateString('pt-BR')}</p>
                <button onClick={() => setSelectedMaterial(m)} className="btn-primary" style={{ width: '100%', fontSize: 13, padding: '10px' }}>✨ Gerar Flashcards</button>
              </motion.div>
            ))}
          </div>
        )
      }

      <AnimatePresence>
        <FlashcardModal material={selectedMaterial} onClose={() => setSelectedMaterial(null)} onGenerated={fetchMaterials} />
        {deleteTarget && <ConfirmModal message={`Excluir "${deleteTarget.title}"?`} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />}
      </AnimatePresence>
    </div>
  );
}
