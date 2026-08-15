import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

function formatCLP(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
}

export default function Cart() {
  const { items, tipoVenta, subtotal, dispatch, precioEfectivo } = useCart();
  const navigate = useNavigate();

  if (!items.length) return (
    <div className="max-w-2xl mx-auto px-4 py-24 text-center">
      <p className="text-5xl mb-6">◈</p>
      <h2 className="text-2xl font-light mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        Tu carrito está vacío
      </h2>
      <p className="text-charcoal-500 mb-8">Explora nuestro catálogo y agrega las joyas que te gusten.</p>
      <Link to="/catalogo" className="btn-gold">Ver catálogo</Link>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="section-title mb-2">Tu carrito</h1>
      <div className="gold-divider mb-8" />

      {/* Modo de venta */}
      <div className="flex items-center gap-3 mb-6 p-4 bg-white border border-charcoal-100">
        <span className="text-sm text-charcoal-600 font-medium">Modo de compra:</span>
        <button
          onClick={() => dispatch({ type: 'SET_TIPO_VENTA', payload: 'unitario' })}
          className={`text-xs px-3 py-1.5 font-medium transition-colors ${
            tipoVenta === 'unitario' ? 'bg-charcoal-800 text-white' : 'border border-charcoal-300 text-charcoal-600'
          }`}
        >
          Por unidad
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_TIPO_VENTA', payload: 'mayoreo' })}
          className={`text-xs px-3 py-1.5 font-medium transition-colors ${
            tipoVenta === 'mayoreo' ? 'bg-gold-500 text-white' : 'border border-gold-400 text-gold-600'
          }`}
        >
          Al por mayor
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Items */}
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => {
            const precio = precioEfectivo(item);
            const esMayoreo = tipoVenta === 'mayoreo' && item.precio_mayoreo && item.cantidad >= item.cantidad_minima_mayoreo;

            return (
              <div key={item.id} className="bg-white p-4 flex gap-4 border border-charcoal-100">
                <div className="w-20 h-20 shrink-0 overflow-hidden bg-charcoal-50">
                  {item.imagen_principal ? (
                    <img src={item.imagen_principal} alt={item.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-charcoal-300 text-2xl">◈</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <Link to={`/producto/${item.slug}`} className="text-sm font-medium text-charcoal-800 hover:text-gold-600 line-clamp-2">
                    {item.nombre}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm font-semibold text-charcoal-800">{formatCLP(precio)}</p>
                    {esMayoreo && (
                      <span className="badge-wholesale text-[10px]">Mayoreo</span>
                    )}
                  </div>
                  {tipoVenta === 'mayoreo' && item.precio_mayoreo && item.cantidad < item.cantidad_minima_mayoreo && (
                    <p className="text-[10px] text-amber-600 mt-0.5">
                      Agrega {item.cantidad_minima_mayoreo - item.cantidad} más para precio mayoreo
                    </p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2">
                  <button
                    onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.id })}
                    className="text-charcoal-400 hover:text-red-500 text-xs transition-colors"
                  >
                    ✕
                  </button>
                  <div className="flex items-center border border-charcoal-200">
                    <button
                      onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, cantidad: item.cantidad - 1 } })}
                      className="w-7 h-7 text-sm text-charcoal-600 hover:bg-charcoal-50"
                    >−</button>
                    <span className="w-8 text-center text-sm">{item.cantidad}</span>
                    <button
                      onClick={() => dispatch({ type: 'UPDATE_QUANTITY', payload: { id: item.id, cantidad: item.cantidad + 1 } })}
                      className="w-7 h-7 text-sm text-charcoal-600 hover:bg-charcoal-50"
                    >+</button>
                  </div>
                  <p className="text-sm font-semibold">{formatCLP(precio * item.cantidad)}</p>
                </div>
              </div>
            );
          })}

          <button
            onClick={() => dispatch({ type: 'CLEAR' })}
            className="text-xs text-charcoal-400 hover:text-red-500 transition-colors"
          >
            Vaciar carrito
          </button>
        </div>

        {/* Resumen */}
        <div className="md:col-span-1">
          <div className="bg-white border border-charcoal-100 p-6 sticky top-24">
            <h3 className="text-lg font-medium text-charcoal-800 mb-4" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Resumen del pedido
            </h3>

            <div className="space-y-2 text-sm mb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-charcoal-600">
                  <span className="truncate pr-2">{item.nombre} ×{item.cantidad}</span>
                  <span className="shrink-0">{formatCLP(precioEfectivo(item) * item.cantidad)}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-charcoal-100 pt-4 mb-6">
              <div className="flex justify-between font-semibold text-charcoal-800">
                <span>Total</span>
                <span>{formatCLP(subtotal)}</span>
              </div>
              {tipoVenta === 'mayoreo' && (
                <p className="text-xs text-gold-600 mt-1">Precio mayoreo aplicado donde corresponde</p>
              )}
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-gold w-full text-center"
            >
              Proceder al pago
            </button>
            <Link to="/catalogo" className="block text-center text-xs text-charcoal-500 hover:text-gold-600 mt-3">
              Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
