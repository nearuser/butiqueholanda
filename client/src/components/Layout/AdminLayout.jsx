import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '◧' },
  { to: '/admin/productos', label: 'Productos', icon: '◈' },
  { to: '/admin/categorias', label: 'Categorías', icon: '◉' },
  { to: '/admin/pedidos', label: 'Pedidos', icon: '◫' },
];

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/admin/login');
  }

  return (
    <div className="min-h-screen flex bg-charcoal-50">
      {/* Sidebar */}
      <aside className="w-60 bg-charcoal-800 text-charcoal-200 flex flex-col fixed top-0 left-0 h-full z-40">
        <div className="p-6 border-b border-charcoal-700">
          <h1 className="text-xl font-light text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            HOLANDA
          </h1>
          <p className="text-gold-400 text-[10px] tracking-[0.3em] uppercase">Panel Admin</p>
        </div>

        <nav className="flex-1 py-4">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-sm transition-colors duration-150 ${
                  isActive
                    ? 'bg-gold-500 text-white'
                    : 'text-charcoal-300 hover:bg-charcoal-700 hover:text-white'
                }`
              }
            >
              <span className="text-base">{l.icon}</span>
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-6 border-t border-charcoal-700">
          <p className="text-xs text-charcoal-400 mb-1">Conectado como</p>
          <p className="text-sm text-white truncate mb-3">{user?.nombre}</p>
          <button
            onClick={handleLogout}
            className="w-full text-left text-xs text-charcoal-400 hover:text-gold-400 transition-colors"
          >
            Cerrar sesión →
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 p-8 min-h-screen">
        {children}
      </main>
    </div>
  );
}
