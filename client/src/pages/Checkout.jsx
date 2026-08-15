import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import api from '../api/axios';

function formatCLP(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
}

const METODOS_PAGO = [
  {
    id: 'mercadopago',
    label: 'MercadoPago',
    desc: 'Tarjeta de crédito / débito / transferencia (LATAM)',
    badge: 'Próximamente',
    disabled: true,
  },
  {
    id: 'webpay',
    label: 'WebPay Plus',
    desc: 'Tarjetas chilenas Transbank',
    badge: 'Próximamente',
    disabled: true,
  },
  {
    id: 'transferencia',
    label: 'Transferencia bancaria',
    desc: 'Te enviaremos los datos por email',
    badge: null,
    disabled: false,
  },
  {
    id: 'simulado',
    label: 'Pago de prueba',
    desc: 'Simula el flujo completo sin cargo real',
    badge: 'Demo',
    disabled: false,
  },
];

export default function Checkout() {
  const { items, tipoVenta, subtotal, dispatch, precioEfectivo } = useCart();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '', direccion: '', ciudad: '', notas: '',
  });
  const [metodoPago, setMetodoPago] = useState('simulado');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!items.length) {
    return (
      <div className="text-center py-24">
        <p className="text-charcoal-500 mb-4">No tienes productos en el carrito.</p>
        <Link to="/catalogo" className="btn-gold">Ver catálogo</Link>
      </div>
    );
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.nombre || !form.email) {
      setError('Nombre y email son obligatorios.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      // Simular delay de procesamiento
      if (metodoPago === 'simulado') await new Promise((r) => setTimeout(r, 1500));

      const res = await api.post('/pedidos', {
        cliente: {
          nombre: form.nombre,
          email: form.email,
          telefono: form.telefono,
          direccion: form.direccion,
          ciudad: form.ciudad,
        },
        items: items.map((item) => ({
          producto_id: item.id,
          cantidad: item.cantidad,
        })),
        tipo_venta: tipoVenta,
        metodo_pago: metodoPago,
        notas: form.notas,
      });

      dispatch({ type: 'CLEAR' });
      navigate(`/pedido-exitoso/${res.data.numero_pedido}`, {
        state: { pedido: res.data, metodo: metodoPago },
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar el pedido. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="section-title mb-2">Finalizar compra</h1>
      <div className="gold-divider mb-8" />

      <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="md:col-span-2 space-y-6">
          {/* Datos cliente */}
          <div className="bg-white border border-charcoal-100 p-6">
            <h2 className="text-lg font-medium text-charcoal-800 mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Datos de contacto
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-charcoal-500 uppercase tracking-wide mb-1 block">Nombre completo *</label>
                <input name="nombre" value={form.nombre} onChange={handleChange} className="input-field" placeholder="Tu nombre" required />
              </div>
              <div>
                <label className="text-xs text-charcoal-500 uppercase tracking-wide mb-1 block">Email *</label>
                <input name="email" type="email" value={form.email} onChange={handleChange} className="input-field" placeholder="tu@email.com" required />
              </div>
              <div>
                <label className="text-xs text-charcoal-500 uppercase tracking-wide mb-1 block">Teléfono</label>
                <input name="telefono" value={form.telefono} onChange={handleChange} className="input-field" placeholder="+56 9..." />
              </div>
              <div>
                <label className="text-xs text-charcoal-500 uppercase tracking-wide mb-1 block">Ciudad</label>
                <input name="ciudad" value={form.ciudad} onChange={handleChange} className="input-field" placeholder="Santiago" />
              </div>
              <div>
                <label className="text-xs text-charcoal-500 uppercase tracking-wide mb-1 block">Dirección</label>
                <input name="direccion" value={form.direccion} onChange={handleChange} className="input-field" placeholder="Calle y número" />
              </div>
              <div className="col-span-2">
                <label className="text-xs text-charcoal-500 uppercase tracking-wide mb-1 block">Notas del pedido</label>
                <textarea name="notas" value={form.notas} onChange={handleChange} className="input-field resize-none" rows={3} placeholder="Instrucciones especiales, tallas, etc." />
              </div>
            </div>
          </div>

          {/* Método de pago */}
          <div className="bg-white border border-charcoal-100 p-6">
            <h2 className="text-lg font-medium text-charcoal-800 mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Método de pago
            </h2>
            <div className="space-y-3">
              {METODOS_PAGO.map((m) => (
                <label
                  key={m.id}
                  className={`flex items-start gap-3 p-4 border cursor-pointer transition-colors ${
                    m.disabled
                      ? 'opacity-50 cursor-not-allowed border-charcoal-100'
                      : metodoPago === m.id
                      ? 'border-gold-500 bg-gold-50'
                      : 'border-charcoal-200 hover:border-gold-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="metodo"
                    value={m.id}
                    disabled={m.disabled}
                    checked={metodoPago === m.id}
                    onChange={() => setMetodoPago(m.id)}
                    className="mt-0.5 accent-yellow-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-charcoal-800">{m.label}</span>
                      {m.badge && (
                        <span className={`text-[10px] px-1.5 py-0.5 font-medium ${
                          m.badge === 'Demo' ? 'bg-blue-100 text-blue-700' : 'bg-charcoal-100 text-charcoal-500'
                        }`}>
                          {m.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-charcoal-500 mt-0.5">{m.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
              {error}
            </div>
          )}
        </div>

        {/* Resumen */}
        <div className="md:col-span-1">
          <div className="bg-white border border-charcoal-100 p-6 sticky top-24">
            <h3 className="text-lg font-medium text-charcoal-800 mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Resumen
            </h3>

            <div className="space-y-2 text-sm mb-4 max-h-48 overflow-y-auto pr-1">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-charcoal-600">
                  <span className="truncate pr-2">{item.nombre} ×{item.cantidad}</span>
                  <span className="shrink-0">{formatCLP(precioEfectivo(item) * item.cantidad)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-charcoal-100 pt-4 mb-6 space-y-1">
              <div className="flex justify-between text-sm text-charcoal-600">
                <span>Subtotal</span><span>{formatCLP(subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm text-charcoal-600">
                <span>Envío</span><span className="text-green-600">A coordinar</span>
              </div>
              <div className="flex justify-between font-semibold text-charcoal-800 text-base pt-2 border-t border-charcoal-100">
                <span>Total</span><span>{formatCLP(subtotal)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-gold w-full flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Procesando...
                </>
              ) : (
                metodoPago === 'simulado' ? 'Confirmar pedido (demo)' : 'Confirmar pedido'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
