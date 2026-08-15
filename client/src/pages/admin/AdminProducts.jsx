import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/Layout/AdminLayout';

function formatCLP(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
}

const EMPTY = {
  nombre: '', descripcion: '', descripcion_corta: '', material: '',
  precio_unitario: '', precio_mayoreo: '', cantidad_minima_mayoreo: 10,
  stock: 0, categoria_id: '', destacado: false, activo: true,
};

export default function AdminProducts() {
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', data }
  const [form, setForm] = useState(EMPTY);
  const [imagen, setImagen] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const LIMIT = 15;

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/productos?page=${page}&limit=${LIMIT}`);
      setProductos(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchProductos();
    api.get('/categorias').then((r) => setCategorias(r.data)).catch(console.error);
  }, [fetchProductos]);

  function openCreate() {
    setForm(EMPTY);
    setImagen(null);
    setError('');
    setModal({ mode: 'create' });
  }

  function openEdit(p) {
    setForm({
      nombre: p.nombre, descripcion: p.descripcion || '', descripcion_corta: p.descripcion_corta || '',
      material: p.material || '', precio_unitario: p.precio_unitario, precio_mayoreo: p.precio_mayoreo || '',
      cantidad_minima_mayoreo: p.cantidad_minima_mayoreo, stock: p.stock,
      categoria_id: p.categoria_id || '', destacado: p.destacado, activo: p.activo,
      id: p.id, imagen_actual: p.imagen_principal,
    });
    setImagen(null);
    setError('');
    setModal({ mode: 'edit', id: p.id });
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k !== 'id' && k !== 'imagen_actual') fd.append(k, v);
      });
      if (imagen) fd.append('imagen', imagen);

      if (modal.mode === 'create') {
        await api.post('/productos/admin', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.put(`/productos/admin/${modal.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setModal(null);
      fetchProductos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('¿Desactivar este producto?')) return;
    try {
      await api.delete(`/productos/admin/${id}`);
      fetchProductos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light text-charcoal-800" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Productos
          </h1>
          <p className="text-charcoal-400 text-sm">{total} productos en total</p>
        </div>
        <button onClick={openCreate} className="btn-gold">+ Nuevo producto</button>
      </div>

      <div className="bg-white border border-charcoal-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-charcoal-50 border-b border-charcoal-100">
                <th className="text-left px-4 py-3 text-xs text-charcoal-500 font-medium uppercase tracking-wide">Producto</th>
                <th className="text-left px-4 py-3 text-xs text-charcoal-500 font-medium uppercase tracking-wide">Categoría</th>
                <th className="text-right px-4 py-3 text-xs text-charcoal-500 font-medium uppercase tracking-wide">Precio unit.</th>
                <th className="text-right px-4 py-3 text-xs text-charcoal-500 font-medium uppercase tracking-wide">Precio mayor.</th>
                <th className="text-right px-4 py-3 text-xs text-charcoal-500 font-medium uppercase tracking-wide">Stock</th>
                <th className="text-center px-4 py-3 text-xs text-charcoal-500 font-medium uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="border-b border-charcoal-50">
                    {[...Array(7)].map((__, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-charcoal-100 animate-pulse rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : productos.map((p) => (
                <tr key={p.id} className="border-b border-charcoal-50 hover:bg-charcoal-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {p.imagen_principal ? (
                        <img src={p.imagen_principal} alt={p.nombre} className="w-10 h-10 object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 bg-charcoal-100 flex items-center justify-center text-charcoal-300 shrink-0">◈</div>
                      )}
                      <div>
                        <p className="font-medium text-charcoal-800 line-clamp-1">{p.nombre}</p>
                        {p.material && <p className="text-xs text-charcoal-400">{p.material}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-charcoal-500">{p.categoria_nombre || '—'}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCLP(p.precio_unitario)}</td>
                  <td className="px-4 py-3 text-right text-gold-600">
                    {p.precio_mayoreo ? formatCLP(p.precio_mayoreo) : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">{p.stock}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-[10px] px-2 py-0.5 font-medium ${p.activo ? 'bg-green-100 text-green-700' : 'bg-charcoal-100 text-charcoal-500'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => openEdit(p)} className="text-xs text-gold-600 hover:underline">Editar</button>
                      <button onClick={() => handleDelete(p.id)} className="text-xs text-red-500 hover:underline">Desactivar</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-charcoal-100">
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setPage(i + 1)}
                className={`w-8 h-8 text-sm ${page === i + 1 ? 'bg-gold-500 text-white' : 'border border-charcoal-200 text-charcoal-600'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 overflow-y-auto p-4">
          <div className="bg-white w-full max-w-2xl my-8 shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b border-charcoal-100">
              <h2 className="text-xl font-medium text-charcoal-800" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {modal.mode === 'create' ? 'Nuevo producto' : 'Editar producto'}
              </h2>
              <button onClick={() => setModal(null)} className="text-charcoal-400 hover:text-charcoal-700 text-xl">✕</button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3">{error}</div>}

              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs text-charcoal-500 uppercase tracking-wide mb-1">Nombre *</label>
                  <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="input-field" required />
                </div>

                <div>
                  <label className="block text-xs text-charcoal-500 uppercase tracking-wide mb-1">Categoría</label>
                  <select value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })} className="input-field">
                    <option value="">Sin categoría</option>
                    {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-charcoal-500 uppercase tracking-wide mb-1">Material</label>
                  <input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className="input-field" />
                </div>

                {/* ── Precios ── */}
                <div className="col-span-2 pt-2 border-t border-charcoal-100">
                  <p className="text-xs font-semibold text-charcoal-600 uppercase tracking-widest mb-3">Precios</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-charcoal-50 p-3">
                      <label className="block text-xs text-charcoal-500 uppercase tracking-wide mb-1">
                        Catálogo General (CLP) *
                      </label>
                      <input
                        type="number"
                        value={form.precio_unitario}
                        onChange={(e) => setForm({ ...form, precio_unitario: e.target.value })}
                        className="input-field"
                        required
                        min="0"
                      />
                      <p className="text-[10px] text-charcoal-400 mt-1">Precio por unidad para el público general</p>
                    </div>

                    <div className="bg-gold-50 p-3 border border-gold-100">
                      <label className="block text-xs text-gold-700 uppercase tracking-wide mb-1">
                        Catálogo Mayorista (CLP)
                      </label>
                      <input
                        type="number"
                        value={form.precio_mayoreo}
                        onChange={(e) => setForm({ ...form, precio_mayoreo: e.target.value })}
                        className="input-field"
                        min="0"
                      />
                      <p className="text-[10px] text-charcoal-400 mt-1">Precio por volumen — debe ser menor al general</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-charcoal-500 uppercase tracking-wide mb-1">Mín. unidades mayoreo</label>
                  <input type="number" value={form.cantidad_minima_mayoreo} onChange={(e) => setForm({ ...form, cantidad_minima_mayoreo: e.target.value })} className="input-field" min="1" />
                  <p className="text-[10px] text-charcoal-400 mt-1">Cantidad mínima para activar precio mayorista</p>
                </div>

                <div>
                  <label className="block text-xs text-charcoal-500 uppercase tracking-wide mb-1">Stock</label>
                  <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className="input-field" min="0" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-charcoal-500 uppercase tracking-wide mb-1">Descripción corta</label>
                  <input value={form.descripcion_corta} onChange={(e) => setForm({ ...form, descripcion_corta: e.target.value })} className="input-field" />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-charcoal-500 uppercase tracking-wide mb-1">Descripción completa</label>
                  <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="input-field resize-none" rows={3} />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs text-charcoal-500 uppercase tracking-wide mb-1">Imagen</label>
                  {form.imagen_actual && (
                    <img src={form.imagen_actual} alt="Actual" className="w-16 h-16 object-cover mb-2" />
                  )}
                  <input type="file" accept="image/*" onChange={(e) => setImagen(e.target.files[0])} className="text-sm" />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={form.destacado} onChange={(e) => setForm({ ...form, destacado: e.target.checked })} className="accent-yellow-600" />
                    Destacado
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input type="checkbox" checked={form.activo} onChange={(e) => setForm({ ...form, activo: e.target.checked })} className="accent-yellow-600" />
                    Activo
                  </label>
                </div>
              </div>

              <div className="flex gap-3 pt-4 border-t border-charcoal-100">
                <button type="submit" disabled={saving} className="btn-gold flex-1">
                  {saving ? 'Guardando...' : 'Guardar producto'}
                </button>
                <button type="button" onClick={() => setModal(null)} className="btn-outline-gold">
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
