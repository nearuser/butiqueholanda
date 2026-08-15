import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import AdminLayout from '../../components/Layout/AdminLayout';

function formatCLP(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
}

const ESTADO_COLORS = {
  pendiente: 'bg-yellow-100 text-yellow-800',
  confirmado: 'bg-blue-100 text-blue-800',
  en_proceso: 'bg-purple-100 text-purple-800',
  enviado: 'bg-indigo-100 text-indigo-800',
  entregado: 'bg-green-100 text-green-800',
  cancelado: 'bg-red-100 text-red-800',
};

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get('/admin/stats').then((r) => setStats(r.data)).catch(console.error);
  }, []);

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-light text-charcoal-800" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Dashboard
        </h1>
        <p className="text-charcoal-400 text-sm mt-1">Resumen de tu tienda</p>
      </div>

      {!stats ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white p-5 animate-pulse">
              <div className="h-4 bg-charcoal-100 mb-2 w-2/3" />
              <div className="h-8 bg-charcoal-100 w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Productos activos', value: stats.total_productos, icon: '◈', color: 'text-gold-500' },
              { label: 'Total pedidos', value: stats.total_pedidos, icon: '◫', color: 'text-blue-500' },
              { label: 'Pedidos pendientes', value: stats.pedidos_pendientes, icon: '⏳', color: 'text-amber-500' },
              { label: 'Ingresos totales', value: formatCLP(stats.ingresos_total), icon: '$', color: 'text-green-500' },
            ].map((s) => (
              <div key={s.label} className="bg-white p-5 border border-charcoal-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs text-charcoal-500 uppercase tracking-wide">{s.label}</p>
                  <span className={`text-xl ${s.color}`}>{s.icon}</span>
                </div>
                <p className="text-2xl font-semibold text-charcoal-800">{s.value}</p>
              </div>
            ))}
          </div>

          {/* Accesos rápidos */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <Link to="/admin/productos" className="bg-white border border-charcoal-100 p-5 hover:border-gold-300 transition-colors group">
              <p className="text-2xl mb-2 text-gold-400 group-hover:scale-110 transition-transform inline-block">◈</p>
              <p className="text-sm font-medium text-charcoal-800">Gestionar productos</p>
              <p className="text-xs text-charcoal-400 mt-1">{stats.total_productos} activos</p>
            </Link>
            <Link to="/admin/categorias" className="bg-white border border-charcoal-100 p-5 hover:border-gold-300 transition-colors group">
              <p className="text-2xl mb-2 text-gold-400 group-hover:scale-110 transition-transform inline-block">◉</p>
              <p className="text-sm font-medium text-charcoal-800">Gestionar categorías</p>
            </Link>
            <Link to="/admin/pedidos" className="bg-white border border-charcoal-100 p-5 hover:border-gold-300 transition-colors group">
              <p className="text-2xl mb-2 text-gold-400 group-hover:scale-110 transition-transform inline-block">◫</p>
              <p className="text-sm font-medium text-charcoal-800">Ver pedidos</p>
              <p className="text-xs text-amber-500 mt-1">{stats.pedidos_pendientes} pendientes</p>
            </Link>
          </div>

          {/* Pedidos recientes */}
          {stats.pedidos_recientes?.length > 0 && (
            <div className="bg-white border border-charcoal-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-charcoal-800" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                  Pedidos recientes
                </h2>
                <Link to="/admin/pedidos" className="text-xs text-gold-600 hover:underline">Ver todos</Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-charcoal-100">
                      <th className="text-left py-2 text-xs text-charcoal-400 font-medium">N° Pedido</th>
                      <th className="text-left py-2 text-xs text-charcoal-400 font-medium">Cliente</th>
                      <th className="text-left py-2 text-xs text-charcoal-400 font-medium">Total</th>
                      <th className="text-left py-2 text-xs text-charcoal-400 font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.pedidos_recientes.map((p) => (
                      <tr key={p.id} className="border-b border-charcoal-50 hover:bg-charcoal-50">
                        <td className="py-3 font-mono text-xs text-charcoal-600">{p.numero_pedido}</td>
                        <td className="py-3 text-charcoal-700">{p.cliente_nombre}</td>
                        <td className="py-3 font-medium">{formatCLP(p.total)}</td>
                        <td className="py-3">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${ESTADO_COLORS[p.estado]}`}>
                            {p.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </AdminLayout>
  );
}
