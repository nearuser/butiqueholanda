import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/UI/ProductCard';

export default function Home() {
  const [destacados, setDestacados] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/productos?destacado=true&limit=8'),
      api.get('/categorias'),
    ]).then(([p, c]) => {
      setDestacados(p.data.data);
      setCategorias(c.data);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative bg-charcoal-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-900 via-charcoal-800 to-transparent z-10" />
        <img
          src="https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=1600&q=80"
          alt="Joyería Holanda"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-50"
        />
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-48">
          <p className="text-gold-400 text-xs tracking-[0.5em] uppercase mb-4">Colección 2024</p>
          <h1 className="text-5xl md:text-7xl font-light mb-6 leading-tight" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            El arte en<br />cada joya
          </h1>
          <p className="text-charcoal-300 max-w-md mb-8 text-lg font-light">
            Joyas artesanales de alta calidad. Venta por unidad y al por mayor para distribuidores.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link to="/catalogo" className="btn-gold inline-block">
              Ver catálogo
            </Link>
            <Link to="/catalogo?tipo=mayoreo" className="btn-outline-gold border-white text-white hover:bg-white hover:text-charcoal-800 inline-block">
              Compra al por mayor
            </Link>
          </div>
        </div>
      </section>

      {/* Propuesta de valor */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[
              { icon: '◈', title: 'Oro & Plata', desc: 'Materiales certificados' },
              { icon: '◉', title: 'Artesanal', desc: 'Confección a mano' },
              { icon: '◧', title: 'Mayoreo', desc: 'Precios especiales x volumen' },
              { icon: '◫', title: 'Envío Chile', desc: 'Despacho a todo el país' },
            ].map((v) => (
              <div key={v.title} className="py-4">
                <p className="text-3xl text-gold-500 mb-2">{v.icon}</p>
                <p className="text-sm font-semibold text-charcoal-800 mb-1">{v.title}</p>
                <p className="text-xs text-charcoal-500">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="section-title">Explorar por categoría</h2>
          <div className="gold-divider mx-auto" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {(categorias.length ? categorias : CATS_PLACEHOLDER).map((cat) => (
            <Link
              key={cat.id || cat.slug}
              to={`/catalogo?categoria=${cat.slug}`}
              className="group flex flex-col items-center gap-3 p-5 border border-charcoal-100 hover:border-gold-300 hover:bg-gold-50 transition-all duration-200"
            >
              <span className="text-4xl text-gold-400 group-hover:scale-110 transition-transform duration-200">
                {ICONS[cat.slug] || '◈'}
              </span>
              <span className="text-xs tracking-widest uppercase text-charcoal-700 group-hover:text-gold-600 font-medium">
                {cat.nombre}
              </span>
              {cat.total_productos !== undefined && (
                <span className="text-[10px] text-charcoal-400">{cat.total_productos} piezas</span>
              )}
            </Link>
          ))}
        </div>
      </section>

      {/* Productos destacados */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="section-title">Colección destacada</h2>
              <div className="gold-divider" />
            </div>
            <Link to="/catalogo" className="text-sm text-gold-600 hover:text-gold-700 tracking-wide underline underline-offset-4">
              Ver todo
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-square bg-charcoal-100 mb-3" />
                  <div className="h-3 bg-charcoal-100 mb-2 w-3/4" />
                  <div className="h-3 bg-charcoal-100 w-1/2" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {destacados.map((p) => <ProductCard key={p.id} producto={p} />)}
            </div>
          )}
        </div>
      </section>

      {/* Banner mayoreo */}
      <section className="bg-charcoal-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gold-400 text-xs tracking-[0.5em] uppercase mb-3">Para distribuidores</p>
          <h2 className="section-title text-white mb-4">Compra al por mayor</h2>
          <div className="gold-divider mx-auto mb-6" />
          <p className="text-charcoal-300 max-w-xl mx-auto mb-8">
            Accede a precios especiales comprando desde las cantidades mínimas indicadas en cada producto.
            Ideal para joyerías, boutiques y revendedores.
          </p>
          <Link to="/catalogo?tipo=mayoreo" className="btn-gold inline-block">
            Ver precios mayoreo
          </Link>
        </div>
      </section>
    </div>
  );
}

const ICONS = {
  anillos: '💍', collares: '📿', pulseras: '🪬', aretes: '✨', cadenas: '⛓', dijes: '🔮',
};

const CATS_PLACEHOLDER = [
  { id: 1, slug: 'anillos', nombre: 'Anillos' },
  { id: 2, slug: 'collares', nombre: 'Collares' },
  { id: 3, slug: 'pulseras', nombre: 'Pulseras' },
  { id: 4, slug: 'aretes', nombre: 'Aretes' },
  { id: 5, slug: 'cadenas', nombre: 'Cadenas' },
  { id: 6, slug: 'dijes', nombre: 'Dijes' },
];
