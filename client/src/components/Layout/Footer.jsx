import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-charcoal-800 text-charcoal-300 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-white text-2xl font-light mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              HOLANDA
            </h3>
            <p className="text-gold-400 text-xs tracking-[0.35em] uppercase mb-4">Joyería</p>
            <p className="text-sm leading-relaxed">
              Joyas finas con diseño artesanal. Venta por unidad y al por mayor para distribuidores y negocios.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white text-sm tracking-widest uppercase mb-4">Catálogo</h4>
            <ul className="space-y-2 text-sm">
              {['Anillos', 'Collares', 'Pulseras', 'Aretes', 'Cadenas', 'Dijes'].map((cat) => (
                <li key={cat}>
                  <Link
                    to={`/catalogo?categoria=${cat.toLowerCase()}`}
                    className="hover:text-gold-400 transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-white text-sm tracking-widest uppercase mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-gold-400 mt-0.5">✉</span>
                <span>contacto@holandajoyeria.cl</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-400 mt-0.5">✆</span>
                <span>+56 9 9999 9999</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gold-400 mt-0.5">⊕</span>
                <span>Santiago, Chile</span>
              </li>
            </ul>
            <div className="mt-6">
              <p className="text-xs text-charcoal-400 mb-2">Métodos de pago (próximamente)</p>
              <div className="flex gap-2">
                <span className="text-xs border border-charcoal-600 text-charcoal-400 px-2 py-1">MercadoPago</span>
                <span className="text-xs border border-charcoal-600 text-charcoal-400 px-2 py-1">WebPay</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-charcoal-700 flex flex-col md:flex-row items-center justify-between gap-2 text-xs text-charcoal-500">
          <p>© {new Date().getFullYear()} Holanda Joyería. Todos los derechos reservados.</p>
          <Link to="/admin/login" className="hover:text-gold-400 transition-colors">
            Panel Admin
          </Link>
        </div>
      </div>
    </footer>
  );
}
