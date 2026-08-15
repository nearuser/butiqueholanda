import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import CheckoutSuccess from './pages/CheckoutSuccess';

import AdminLogin from './pages/admin/AdminLogin';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gold-500 text-2xl animate-pulse">◈</div>
    </div>
  );
  return user ? children : <Navigate to="/admin/login" replace />;
}

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <Routes>
            {/* Público */}
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/catalogo" element={<PublicLayout><Catalog modo="general" /></PublicLayout>} />
            <Route path="/mayorista" element={<PublicLayout><Catalog modo="mayoreo" /></PublicLayout>} />
            <Route path="/producto/:slug" element={<PublicLayout><ProductDetail /></PublicLayout>} />
            <Route path="/carrito" element={<PublicLayout><Cart /></PublicLayout>} />
            <Route path="/checkout" element={<PublicLayout><Checkout /></PublicLayout>} />
            <Route path="/pedido-exitoso/:numero" element={<PublicLayout><CheckoutSuccess /></PublicLayout>} />

            {/* Admin */}
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="/admin/dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/productos" element={<ProtectedRoute><AdminProducts /></ProtectedRoute>} />
            <Route path="/admin/categorias" element={<ProtectedRoute><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/pedidos" element={<ProtectedRoute><AdminOrders /></ProtectedRoute>} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
