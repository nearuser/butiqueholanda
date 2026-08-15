import { useEffect, useState, useCallback } from 'react';
import api from '../../api/axios';
import AdminLayout from '../../components/Layout/AdminLayout';

function formatCLP(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
}

const ESTADOS = ['pendiente', 'confirmado', 'en_proceso', 'enviado', 'entregado', 'cancelado'];

const ESTADO_COLORS = {
  pendiente:   'bg-yellow-100 text-yellow-800',
  confirmado:  'bg-blue-100 text-blue-800',
  en_proceso:  'bg-purple-100 text-purple-800',
  enviado:     'bg-indigo-100 text-indigo-800',
  entregado:   'bg-green-100 text-green-800',
  cancelado:   'bg-red-100 text-red-800',
};

export default function AdminOrders() {
  const [pedidos, setPedidos] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [filtroEstado, setFiltroEstado] = useState('');
  const [detalle, setDetalle] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const LIMIT = 15;

  const fetchPedidos = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ page, limit: LIMIT });
      if (filtroEstado) q.set('estado', filtroEstado);
      const res = await api.get(`/pedidos/admin?${q}`);
      setPedidos(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, filtroEstado]);

  useEffect(() => { fetchPedidos(); }, [fetchPedidos]);

  async function openDetalle(p) {
    try {
      const res = await api.get(`/pedidos/admin/${p.id}`);
      setDetalle(res.data);
    } catch (err) {
      console.error(err);
    }
  }

  async function updateEstado(id, estado) {
    setUpdatingId(id);
    try {
      await api.put(`/pedidos/admin/${id}/estado`, { estado });
      fetchPedidos();
      if (detalle?.id === id) {
        setDetalle({ ...detalle, estado });
      }
    } catch (err) {
      alert(err.response?.data?.error || 'Error al actualizar');
    } finally {
      setUpdatingId(null);
    }
  }

  const totalPages = Math.ceil(total / LIMIT);

  return (
    <AdminLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-light text-charcoal-800" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Pedidos
          </h1>
          <p className="text-charcoal-400 text-sm">{total} pedidos</p>
        </div>
        {/* Filtro estado */}
        <select
          value={filtroEstado}
          onChange={(e) => { setFiltroEstado(e.target.value); setPage(1); }}
          className="input-field w-auto"
        >
          <option value="">Todos los estados</option>
          {ESTADOS.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' ')}</option>)}
        </select>
      </div>

      <div className="bg-white border border-charcoal-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-charcoal-50 border-b border-charcoal-100">
                <th className="text-left px-4 py-3 text-xs text-charcoal-500 font-medium uppercase tracking-wide">N° Pedido</th>
                <th className="text-left px-4 py-3 text-xs text-charcoal-500 font-medium uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 text-xs text-charcoal-500 font-medium uppercase tracking-wide">Tipo</th>
                <th className="text-right px-4 py-3 text-xs text-charcoal-500 font-medium uppercase tracking-wide">Total</th>
                <th className="text-center px-4 py-3 text-xs text-charcoal-500 font-medium uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-xs text-charcoal-500 font-medium uppercase tracking-wide">Fecha</th>
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
              ) : pedidos.map((p) => (
                <tr key={p.id} className="border-b border-charcoal-50 hover:bg-charcoal-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-charcoal-600">{p.numero_pedido}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-charcoal-800">{p.cliente_nombre}</p>
                    <p className="text-xs text-charcoal-400">{p.cliente_email}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-[10px] px-2 py-0.5 font-medium ${
                      p.tipo_venta === 'mayoreo' ? 'bg-charcoal-800 text-white' : 'bg-charcoal-100 text-charcoal-600'
                    }`}>
                      {p.tipo_venta}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{formatCLP(p.total)}</td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={p.estado}
                      onChange={(e) => updateEstado(p.id, e.target.value)}
                      disabled={updatingId === p.id}
                      className={`text-[10px] font-medium px-2 py-1 border-0 rounded-full cursor-pointer ${ESTADO_COLORS[p.estado]}`}
                    >
                      {ESTADOS.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-charcoal-400">
                    {new Date(p.created_at).toLocaleDateString('es-CL')}
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => openDetalle(p)} className="text-xs text-gold-600 hover:underline">
                      Ver detalle
                    </button>
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

      {/* Modal detalle */}
      {detalle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-charcoal-100">
              <h2 className="text-xl font-medium" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                Pedido {detalle.numero_pedido}
              </h2>
              <button onClick={() => setDetalle(null)} className="text-charcoal-400 hover:text-charcoal-700 text-xl">✕</button>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-xs text-charcoal-400 mb-0.5">Cliente</p><p className="font-medium">{detalle.cliente_nombre}</p></div>
                <div><p className="text-xs text-charcoal-400 mb-0.5">Email</p><p>{detalle.cliente_email}</p></div>
                <div><p className="text-xs text-charcoal-400 mb-0.5">Teléfono</p><p>{detalle.cliente_telefono || '—'}</p></div>
                <div><p className="text-xs text-charcoal-400 mb-0.5">Ciudad</p><p>{detalle.cliente_ciudad || '—'}</p></div>
                <div><p className="text-xs text-charcoal-400 mb-0.5">Tipo venta</p>
                  <span className={`text-[10px] px-2 py-0.5 font-medium ${detalle.tipo_venta === 'mayoreo' ? 'bg-charcoal-800 text-white' : 'bg-charcoal-100 text-charcoal-600'}`}>
                    {detalle.tipo_venta}
                  </span>
                </div>
                <div><p className="text-xs text-charcoal-400 mb-0.5">Método pago</p><p>{detalle.metodo_pago}</p></div>
              </div>

              {detalle.notas && (
                <div className="bg-charcoal-50 p-3 text-sm text-charcoal-600">
                  <p className="text-xs text-charcoal-400 mb-1">Notas</p>
                  {detalle.notas}
                </div>
              )}

              <div>
                <p className="text-xs text-charcoal-400 mb-2 uppercase tracking-wide">Productos</p>
                <div className="space-y-2">
                  {detalle.items?.map((item, i) => (
                    <div key={i} className="flex items-center gap-3 text-sm">
                      {item.imagen_principal && (
                        <img src={item.imagen_principal} alt={item.nombre_producto} className="w-10 h-10 object-cover shrink-0" />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-charcoal-800">{item.nombre_producto}</p>
                        <p className="text-xs text-charcoal-400">
                          {item.cantidad} × {formatCLP(item.precio_unitario)} ({item.tipo_precio})
                        </p>
                      </div>
                      <p className="font-semibold">{formatCLP(item.subtotal)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-charcoal-100 pt-4 flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span>{formatCLP(detalle.total)}</span>
              </div>

              <div>
                <p className="text-xs text-charcoal-400 mb-2 uppercase tracking-wide">Actualizar estado</p>
                <div className="flex flex-wrap gap-2">
                  {ESTADOS.map((s) => (
                    <button
                      key={s}
                      onClick={() => updateEstado(detalle.id, s)}
                      className={`text-xs px-3 py-1.5 font-medium transition-colors ${
                        detalle.estado === s
                          ? ESTADO_COLORS[s] + ' opacity-100'
                          : 'border border-charcoal-200 text-charcoal-600 hover:border-gold-300'
                      }`}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
