import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

function formatCLP(n) {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(n);
}

export default function ProductCard({ producto, modo = 'general' }) {
  const { dispatch } = useCart();

  const esMayoreo = modo === 'mayoreo';
  const tienePrecioMayoreo = producto.precio_mayoreo && parseFloat(producto.precio_mayoreo) > 0;

  const precio = esMayoreo && tienePrecioMayoreo
    ? parseFloat(producto.precio_mayoreo)
    : parseFloat(producto.precio_unitario);

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
        cantidad: esMayoreo ? (producto.cantidad_minima_mayoreo || 1) : 1,
      },
    });
  }

  return (
    <div className="card-product group">
      <Link to={`/producto/${producto.slug}`} className="block relative overflow-hidden aspect-square bg-charcoal-50">
        {producto.imagen_principal ? (
          <img
            src={producto.imagen_principal}
            alt={producto.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-charcoal-300">
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        )}
        {producto.destacado ? (
          <span className="absolute top-3 left-3 badge-gold">Destacado</span>
        ) : null}
      </Link>

      <div className="p-4">
        {producto.categoria_nombre && (
          <p className="text-[10px] tracking-widest uppercase text-gold-500 mb-1 font-medium">
            {producto.categoria_nombre}
          </p>
        )}
        <Link to={`/producto/${producto.slug}`}>
          <h3 className="text-charcoal-800 font-medium text-sm mb-2 hover:text-gold-600 transition-colors line-clamp-2">
            {producto.nombre}
          </h3>
        </Link>

        <div className="flex items-end justify-between mt-3">
          <div>
            <p className="text-lg font-semibold text-charcoal-800">{formatCLP(precio)}</p>
            {esMayoreo && tienePrecioMayoreo ? (
              <>
                <p className="text-xs text-charcoal-400 line-through">{formatCLP(producto.precio_unitario)}</p>
                <p className="text-[10px] text-gold-600 font-medium">
                  mín. {producto.cantidad_minima_mayoreo} unid.
                </p>
              </>
            ) : esMayoreo && !tienePrecioMayoreo ? (
              <p className="text-[10px] text-charcoal-400">Precio mayoreo no definido</p>
            ) : null}
          </div>
          <button
            onClick={addToCart}
            className="p-2 border border-gold-400 text-gold-600 hover:bg-gold-500 hover:text-white hover:border-gold-500 transition-all duration-200"
            title="Agregar al carrito"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
