import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/UI/ProductCard';
import { useCart } from '../context/CartContext';

export default function Catalog({ modo = 'general' }) {
  const [params, setParams] = useSearchParams();
  const { dispatch } = useCart();

  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const categoriaActual = params.get('categoria') || '';
  const busqueda = params.get('busqueda') || '';
  const LIMIT = 12;

  // Sincronizar CartContext con el modo del catálogo
  useEffect(() => {
    dispatch({ type: 'SET_TIPO_VENTA', payload: modo === 'mayoreo' ? 'mayoreo' : 'unitario' });
  }, [modo, dispatch]);

  const fetchProductos = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (categoriaActual) q.set('categoria', categoriaActual);
      if (busqueda) q.set('busqueda', busqueda);
      q.set('page', page);
      q.set('limit', LIMIT);
      const res = await api.get(`/productos?${q}`);
      setProductos(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [categoriaActual, busqueda, page]);

  useEffect(() => {
    api.get('/categorias').then((r) => setCategorias(r.data)).catch(console.error);
  }, []);

  useEffect(() => { fetchProductos(); }, [fetchProductos]);

  function setCategoria(cat) {
    const next = new URLSearchParams(params);
    if (cat) next.set('categoria', cat); else next.delete('categoria');
    next.delete('busqueda');
    setPage(1);
    setParams(next);
  }

  function setBusqueda(val) {
    const next = new URLSearchParams(params);
    if (val) next.set('busqueda', val); else next.delete('busqueda');
    setPage(1);
    setParams(next);
  }

  const totalPages = Math.ceil(total / LIMIT);
  const esMayoreo = modo === 'mayoreo';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="section-title">
          {esMayoreo
            ? (categoriaActual ? categorias.find((c) => c.slug === categoriaActual)?.nombre || categoriaActual : 'Catálogo Mayorista')
            : (categoriaActual ? categorias.find((c) => c.slug === categoriaActual)?.nombre || categoriaActual : 'Catálogo')
          }
        </h1>
        <div className="gold-divider" />
        <p className="text-charcoal-500 text-sm mt-2">{total} productos encontrados</p>
      </div>

      {/* Banner mayorista */}
      {esMayoreo && (
        <div className="mb-6 px-5 py-3 bg-gold-50 border border-gold-200 flex items-center gap-3">
          <span className="text-gold-600 text-sm font-medium tracking-wide uppercase">◈ Catálogo Mayorista</span>
          <span className="text-charcoal-500 text-xs">— Precios por volumen. El precio final aplica al alcanzar la cantidad mínima por producto.</span>
        </div>
      )}

      <div className="flex gap-8">
        {/* Sidebar filtros */}
        <aside className="hidden md:block w-52 shrink-0">
          <div className="sticky top-24">
            <h3 className="text-xs tracking-widest uppercase text-charcoal-500 mb-3 font-medium">Categorías</h3>
            <ul className="space-y-1">
              <li>
                <button
                  onClick={() => setCategoria('')}
                  className={`w-full text-left text-sm py-1.5 px-2 transition-colors ${
                    !categoriaActual ? 'text-gold-600 font-medium bg-gold-50' : 'text-charcoal-600 hover:text-gold-600'
                  }`}
                >
                  {esMayoreo ? 'Todos los productos' : 'Todas las joyas'}
                </button>
              </li>
              {categorias.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => setCategoria(c.slug)}
                    className={`w-full text-left text-sm py-1.5 px-2 transition-colors flex justify-between items-center ${
                      categoriaActual === c.slug ? 'text-gold-600 font-medium bg-gold-50' : 'text-charcoal-600 hover:text-gold-600'
                    }`}
                  >
                    <span>{c.nombre}</span>
                    <span className="text-xs text-charcoal-400">{c.total_productos}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Productos */}
        <div className="flex-1">
          {/* Buscador */}
          <div className="mb-6 flex gap-2">
            <input
              type="text"
              placeholder="Buscar joyas..."
              defaultValue={busqueda}
              className="input-field flex-1"
              onKeyDown={(e) => e.key === 'Enter' && setBusqueda(e.target.value)}
            />
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-charcoal-100 mb-3" />
                  <div className="h-3 bg-charcoal-100 mb-2 w-3/4" />
                  <div className="h-3 bg-charcoal-100 w-1/2" />
                </div>
              ))}
            </div>
          ) : productos.length === 0 ? (
            <div className="text-center py-20 text-charcoal-400">
              <p className="text-4xl mb-3">◈</p>
              <p className="text-lg">No se encontraron productos</p>
              <button onClick={() => setCategoria('')} className="mt-4 text-sm text-gold-600 underline">
                Ver todo el catálogo
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {productos.map((p) => <ProductCard key={p.id} producto={p} modo={modo} />)}
              </div>

              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i + 1)}
                      className={`w-8 h-8 text-sm transition-colors ${
                        page === i + 1
                          ? 'bg-gold-500 text-white'
                          : 'border border-charcoal-200 text-charcoal-600 hover:border-gold-400'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
