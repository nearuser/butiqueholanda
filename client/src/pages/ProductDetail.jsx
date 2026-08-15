import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useCart } from '../context/CartContext';

function formatCLP(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { tipoVenta, dispatch } = useCart();
  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [added, setAdded] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/productos/${slug}`)
      .then((r) => setProducto(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div className="max-w-6xl mx-auto px-4 py-16 animate-pulse">
      <div className="grid md:grid-cols-2 gap-12">
        <div className="aspect-square bg-charcoal-100" />
        <div className="space-y-4">
          <div className="h-6 bg-charcoal-100 w-1/3" />
          <div className="h-10 bg-charcoal-100 w-2/3" />
          <div className="h-4 bg-charcoal-100 w-full" />
          <div className="h-4 bg-charcoal-100 w-5/6" />
        </div>
      </div>
    </div>
  );

  if (!producto) return (
    <div className="text-center py-32 text-charcoal-400">
      <p className="text-2xl mb-2">Producto no encontrado</p>
      <Link to="/catalogo" className="text-gold-600 underline">Volver al catálogo</Link>
    </div>
  );

  const usaMayoreo =
    tipoVenta === 'mayoreo' &&
    producto.precio_mayoreo &&
    cantidad >= producto.cantidad_minima_mayoreo;

  const precio = usaMayoreo ? parseFloat(producto.precio_mayoreo) : parseFloat(producto.precio_unitario);
  const total = precio * cantidad;

  function addToCart() {
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        id: producto.id,
        nombre: producto.nombre,
        slug: producto.slug,
        precio_unitario: producto.precio_unitario,
        precio_mayoreo: producto.precio_mayoreo,
        cantidad_minima_mayoreo: producto.cantidad_minima_mayoreo,
        imagen_principal: producto.imagen_principal,
        cantidad,
      },
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-charcoal-400 mb-8">
        <Link to="/" className="hover:text-gold-500">Inicio</Link>
        <span>/</span>
        <Link to="/catalogo" className="hover:text-gold-500">Catálogo</Link>
        {producto.categoria_nombre && (
          <>
            <span>/</span>
            <Link to={`/catalogo?categoria=${producto.categoria_slug}`} className="hover:text-gold-500">
              {producto.categoria_nombre}
            </Link>
          </>
        )}
        <span>/</span>
        <span className="text-charcoal-700">{producto.nombre}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-12">
        {/* Imagen */}
        <div className="aspect-square overflow-hidden bg-charcoal-50">
          {producto.imagen_principal ? (
            <img
              src={producto.imagen_principal}
              alt={producto.nombre}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-charcoal-200">
              <svg className="w-24 h-24" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {producto.categoria_nombre && (
            <p className="text-xs tracking-widest uppercase text-gold-500 mb-2 font-medium">
              {producto.categoria_nombre}
            </p>
          )}
          <h1 className="text-3xl md:text-4xl font-light text-charcoal-800 mb-3" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            {producto.nombre}
          </h1>
          <div className="gold-divider mb-5" />

          {/* Precio y modo de compra */}
          <div className="bg-charcoal-50 p-5 mb-6 space-y-3">
            <div className="flex gap-2 mb-3">
              <button
                onClick={() => dispatch({ type: 'SET_TIPO_VENTA', payload: 'unitario' })}
                className={`text-xs px-3 py-1.5 font-medium transition-colors ${
                  tipoVenta === 'unitario' ? 'bg-charcoal-800 text-white' : 'border border-charcoal-300 text-charcoal-600'
                }`}
              >
                Por unidad
              </button>
              {producto.precio_mayoreo && (
                <button
                  onClick={() => dispatch({ type: 'SET_TIPO_VENTA', payload: 'mayoreo' })}
                  className={`text-xs px-3 py-1.5 font-medium transition-colors ${
                    tipoVenta === 'mayoreo' ? 'bg-gold-500 text-white' : 'border border-gold-400 text-gold-600'
                  }`}
                >
                  Al por mayor
                </button>
              )}
            </div>

            <div>
              <p className="text-2xl font-semibold text-charcoal-800">{formatCLP(precio)}</p>
              {usaMayoreo && (
                <p className="text-sm text-charcoal-400 line-through">{formatCLP(producto.precio_unitario)}</p>
              )}
            </div>

            {tipoVenta === 'mayoreo' && producto.precio_mayoreo && (
              <div className="text-xs text-charcoal-500 border-t border-charcoal-200 pt-3">
                <p className="font-medium text-gold-600 mb-1">Precio mayoreo: {formatCLP(producto.precio_mayoreo)}</p>
                <p>Aplica desde {producto.cantidad_minima_mayoreo} unidades.</p>
                {cantidad < producto.cantidad_minima_mayoreo && (
                  <p className="text-amber-600 mt-1">
                    Agrega {producto.cantidad_minima_mayoreo - cantidad} unidad(es) más para activar precio mayoreo.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Cantidad */}
          <div className="flex items-center gap-4 mb-5">
            <label className="text-sm text-charcoal-600 font-medium">Cantidad:</label>
            <div className="flex items-center border border-charcoal-200">
              <button
                onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                className="w-9 h-9 flex items-center justify-center text-charcoal-600 hover:bg-charcoal-50"
              >−</button>
              <span className="w-12 text-center text-sm font-medium">{cantidad}</span>
              <button
                onClick={() => setCantidad((c) => c + 1)}
                className="w-9 h-9 flex items-center justify-center text-charcoal-600 hover:bg-charcoal-50"
              >+</button>
            </div>
            <span className="text-sm text-charcoal-500">Total: <strong>{formatCLP(total)}</strong></span>
          </div>

          {/* Botones */}
          <div className="flex gap-3 mb-8">
            <button onClick={addToCart} className="btn-gold flex-1">
              {added ? '✓ Agregado al carrito' : 'Agregar al carrito'}
            </button>
            <Link to="/carrito" className="btn-dark px-4 text-sm">Ver carrito</Link>
          </div>

          {/* Detalles */}
          {producto.descripcion && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-charcoal-700 mb-2 tracking-wide uppercase">Descripción</h3>
              <p className="text-sm text-charcoal-600 leading-relaxed">{producto.descripcion}</p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 text-xs text-charcoal-500">
            {producto.material && (
              <div><span className="font-medium text-charcoal-700">Material:</span> {producto.material}</div>
            )}
            {producto.peso_gramos && (
              <div><span className="font-medium text-charcoal-700">Peso:</span> {producto.peso_gramos}g</div>
            )}
            <div><span className="font-medium text-charcoal-700">Stock:</span> {producto.stock} unidades</div>
            {producto.precio_mayoreo && (
              <div>
                <span className="font-medium text-charcoal-700">Min. mayoreo:</span>{' '}
                {producto.cantidad_minima_mayoreo} unid.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
