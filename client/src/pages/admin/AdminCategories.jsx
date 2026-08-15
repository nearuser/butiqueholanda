import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/Layout/AdminLayout';

const EMPTY = { nombre: '', descripcion: '', orden: 0, activo: true };

export default function AdminCategories() {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [imagen, setImagen] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await api.get('/categorias');
      setCategorias(r.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  function openCreate() {
    setForm(EMPTY); setImagen(null); setError('');
    setModal({ mode: 'create' });
  }

  function openEdit(c) {
    setForm({ nombre: c.nombre, descripcion: c.descripcion || '', orden: c.orden, activo: c.activo, imagen_actual: c.imagen });
    setImagen(null); setError('');
    setModal({ mode: 'edit', id: c.id });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'imagen_actual') fd.append(k, v);
      });
      if (imagen) fd.append('imagen', imagen);

      if (modal.mode === 'create') {
        await api.post('/categorias/admin', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.put(`/categorias/admin/${modal.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setModal(null);
      fetch();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Eliminar esta categoría?')) return;
    try {
      await api.delete(`/categorias/admin/${id}`);
      fetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light text-charcoal-800" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Categorías
          </h1>
          <p className="text-charcoal-400 text-sm">{categorias.length} categorías</p>
        </div>
        <button onClick={openCreate} className="btn-gold">+ Nueva categoría</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-charcoal-100 p-4 animate-pulse">
              <div className="h-5 bg-charcoal-100 mb-2 w-1/2" />
              <div className="h-3 bg-charcoal-100 w-3/4" />
            </div>
          ))
        ) : categorias.map((c) => (
          <div key={c.id} className="bg-white border border-charcoal-100 p-4 flex items-start gap-4">
            <div className="w-12 h-12 shrink-0 bg-charcoal-50 overflow-hidden">
              {c.imagen ? (
                <img src={c.imagen} alt={c.nombre} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-charcoal-300 text-xl">◉</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="font-medium text-charcoal-800">{c.nombre}</h3>
                <span className={`text-[10px] px-1.5 py-0.5 ${c.activo ? 'bg-green-100 text-green-700' : 'bg-charcoal-100 text-charcoal-500'}`}>
                  {c.activo ? 'Activa' : 'Inactiva'}
                </span>
              </div>
              <p className="text-xs text-charcoal-500 truncate">{c.descripcion || '—'}</p>
              <p className="text-xs text-gold-500 mt-1">{c.total_productos} productos</p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              <button onClick={() => openEdit(c)} className="text-xs text-gold-600 hover:underline">Editar</button>
              <button onClick={() => handleDelete(c.id)} className="text-xs text-red-500 hover:underline">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-charcoal-100">
              <h2 className="text-xl font-medium" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {modal.mode === 'create' ? 'Nueva categoría' : 'Editar categoría'}
              </h2>
              <button onClick={() => setModal(null)} className="text-charcoal-400 hover:text-charcoal-700 text-xl">✕</button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3">{error}</div>}

              <div>
                <label className="block text-xs text-charcoal-500 uppercase tracking-wide mb-1">Nombre *</label>
                <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-field" required />
              </div>
              <div>
                <label className="block text-xs text-charcoal-500 uppercase tracking-wide mb-1">Descripción</label>
                <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="input-field resize-none" rows={2} />
              </div>
              <div>
                <label className="block text-xs text-charcoal-500 uppercase tracking-wide mb-1">Orden</label>
                <input type="number" value={form.orden} onChange={(e) => setForm({ ...form, orden: e.target.value })} className="input-field" />
              </div>
              <div>
                <label className="block text-xs text-charcoal-500 uppercase tracking-wide mb-1">Imagen</label>
                {form.imagen_actual && <img src={form.imagen_actual} alt="Actual" className="w-12 h-12 object-cover mb-2" />}
                <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} className="text-sm" />
              </div>
              <label className="flex items-center gap-2 cursor-pointer text-sm">
                <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} className="accent-yellow-600" />
                Categoría activa
              </label>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="btn-gold flex-1">
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
                <button type="button" onClick={() => setModal(null)} className="btn-outline-gold">Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
