import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLogin() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-charcoal-800 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-light text-white mb-1" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            HOLANDA
          </h1>
          <p className="text-gold-400 text-xs tracking-[0.4em] uppercase">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white p-8 shadow-2xl">
          <h2 className="text-xl font-medium text-charcoal-800 mb-6">Iniciar sesión</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4 mb-6">
            <div>
              <label className="text-xs text-charcoal-500 uppercase tracking-wide mb-1 block">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field"
                placeholder="admin@holanda.cl"
                required
              />
            </div>
            <div>
              <label className="text-xs text-charcoal-500 uppercase tracking-wide mb-1 block">Contraseña</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full">
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>

          <p className="text-xs text-charcoal-400 text-center mt-4">
            Demo: admin@holanda.cl / admin123
          </p>
        </form>
      </div>
    </div>
  );
}
