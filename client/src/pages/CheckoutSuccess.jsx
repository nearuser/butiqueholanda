import { useParams, useLocation, Link } from 'react-router-dom';

function formatCLP(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
}

export default function CheckoutSuccess() {
  const { numero } = useParams();
  const { state } = useLocation();
  const pedido = state?.pedido;
  const metodo = state?.metodo;

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      {/* Ícono éxito */}
      <div className="w-20 h-20 bg-gold-50 border-2 border-gold-300 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-gold-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-4xl font-light mb-3 text-charcoal-800" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
        ¡Pedido recibido!
      </h1>
      <div className="w-16 h-0.5 bg-gold-500 mx-auto mb-6" />

      <div className="bg-white border border-charcoal-100 p-6 mb-6 text-left">
        <div className="flex justify-between items-center mb-4">
          <span className="text-sm text-charcoal-500">Número de pedido</span>
          <span className="font-mono font-semibold text-charcoal-800 text-lg">{numero}</span>
        </div>

        {pedido && (
          <>
            <div className="border-t border-charcoal-100 pt-4 space-y-2">
              {pedido.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm text-charcoal-600">
                  <span>{item.nombre_producto} ×{item.cantidad}</span>
                  <span>{formatCLP(item.subtotal)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-charcoal-100 mt-4 pt-4 flex justify-between font-semibold text-charcoal-800">
              <span>Total pagado</span>
              <span>{formatCLP(pedido.total)}</span>
            </div>
          </>
        )}

        {metodo === 'transferencia' && (
          <div className="mt-4 bg-blue-50 border border-blue-100 p-4 text-sm text-blue-800">
            <p className="font-medium mb-1">Datos para transferencia:</p>
            <p>Banco: Banco Estado</p>
            <p>Cuenta: 000-0000000</p>
            <p>Titular: Holanda Joyería SpA</p>
            <p>RUT: 76.000.000-0</p>
            <p className="mt-2 text-xs text-blue-600">Una vez acreditada la transferencia, tu pedido será confirmado.</p>
          </div>
        )}

        {metodo === 'simulado' && (
          <div className="mt-4 bg-amber-50 border border-amber-100 p-3 text-xs text-amber-700">
            Este es un pedido de demostración. No se realizó ningún cargo real.
          </div>
        )}
      </div>

      <p className="text-sm text-charcoal-500 mb-8">
        Recibirás un email de confirmación en <strong>{pedido?.cliente_email || 'tu correo'}</strong>.
        Para consultas, guarda tu número de pedido.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/catalogo" className="btn-gold">
          Seguir comprando
        </Link>
        <Link to="/" className="btn-outline-gold">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
