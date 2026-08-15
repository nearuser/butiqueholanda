import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

export default function Navbar() {
  const { totalItems } = useCart();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navLink = ({ isActive }) =>
    `text-sm tracking-widest uppercase transition-colors duration-200 ${
      isActive ? 'text-gold-500' : 'text-charcoal-700 hover:text-gold-500'
    }`;

  return (
    <header className="sticky top-0 z-50 bg-cream border-b border-charcoal-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex flex-col leading-none">
            <span className="text-2xl font-light tracking-widest text-charcoal-800" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              HOLANDA
            </span>
            <span className="text-[10px] tracking-[0.35em] text-gold-500 uppercase font-medium">
              Joyería
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink to="/" className={navLink} end>Inicio</NavLink>
            <NavLink to="/catalogo" className={navLink}>Catálogo</NavLink>
            <NavLink
              to="/mayorista"
              className={({ isActive }) =>
                `text-sm tracking-widest uppercase transition-colors duration-200 ${
                  isActive ? 'text-gold-500' : 'text-gold-700 hover:text-gold-500'
                }`
              }
            >
              Mayorista
            </NavLink>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/carrito')}
              className="relative p-2 text-charcoal-700 hover:text-gold-500 transition-colors"
              aria-label="Carrito"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-gold-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-charcoal-700 hover:text-gold-500"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                }
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-charcoal-100 bg-cream px-4 py-4 flex flex-col gap-4">
          <NavLink to="/" className={navLink} end onClick={() => setMenuOpen(false)}>Inicio</NavLink>
          <NavLink to="/catalogo" className={navLink} onClick={() => setMenuOpen(false)}>Catálogo</NavLink>
          <NavLink to="/mayorista" className={navLink} onClick={() => setMenuOpen(false)}>Mayorista</NavLink>
          <NavLink to="/carrito" className={navLink} onClick={() => setMenuOpen(false)}>Carrito ({totalItems})</NavLink>
        </div>
      )}
    </header>
  );
}
