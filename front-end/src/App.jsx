import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StoreProvider } from './context/StoreContext';
import { CartProvider } from './context/CartContext';

import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';

import Home from './pages/user/Home';
import Products from './pages/user/Products';
import ProductDetail from './pages/user/ProductDetail';
import Checkout from './pages/user/Checkout';
import Orders from './pages/user/Orders';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import Dashboard from './pages/admin/Dashboard';
import Inventory from './pages/admin/Inventory';
import ProductNew from './pages/admin/ProductNew';
import AdminCategoryNew from './pages/admin/AdminCategoryNew';
import AdminOrders from './pages/admin/AdminOrders';
import AdminProfile from './pages/admin/AdminProfile';

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (requireAdmin && user.role !== 'ADMIN') return <Navigate to="/" />;
  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <StoreProvider>
        <AuthProvider>
          <CartProvider>
            <BrowserRouter>
              <Routes>
                {/* User Routes */}
                <Route element={<MainLayout />}>
                  <Route path="/" element={<Home />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/:id" element={<ProductDetail />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route
                    path="/checkout"
                    element={<ProtectedRoute><Checkout /></ProtectedRoute>}
                  />
                  <Route
                    path="/orders"
                    element={<ProtectedRoute><Orders /></ProtectedRoute>}
                  />
                </Route>

                {/* Admin Routes */}
                <Route
                  element={
                    <ProtectedRoute requireAdmin={true}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/admin/dashboard" element={<Dashboard />} />
                  <Route path="/admin/inventory" element={<Inventory />} />
                  <Route path="/admin/products/new" element={<ProductNew />} />
                  <Route path="/admin/categories/new" element={<AdminCategoryNew />} />
                  <Route path="/admin/orders" element={<AdminOrders />} />
                  <Route path="/admin/profile" element={<AdminProfile />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </CartProvider>
        </AuthProvider>
      </StoreProvider>
    </ThemeProvider>
  );
}