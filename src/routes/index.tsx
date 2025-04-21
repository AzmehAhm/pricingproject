import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import AdminLayout from '../layouts/AdminLayout';
import CustomerLayout from '../layouts/CustomerLayout';
import Login from '../pages/Login';
import Dashboard from '../pages/admin/Dashboard';
import Products from '../pages/admin/Products';
import Brands from '../pages/admin/Brands';
import Categories from '../pages/admin/Categories';
import Customers from '../pages/admin/Customers';
import Settings from '../pages/admin/Settings';
import Sizes from '../pages/admin/Sizes';
import ProductVariants from '../pages/admin/ProductVariants';
import CustomerProducts from '../pages/customer/Products';
import NotFound from '../pages/NotFound';

function AppRoutes() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-700">Loading application...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  // Get user role from metadata, default to CUSTOMER if not found
  const userRole = user.user_metadata?.role || 'CUSTOMER';

  return (
    <Routes>
      <Route path="/" element={
        <Navigate to={userRole === 'ADMIN' ? '/admin/dashboard' : '/customer/products'} replace />
      } />
      <Route path="/login" element={
        <Navigate to={userRole === 'ADMIN' ? '/admin/dashboard' : '/customer/products'} replace />
      } />
      
      {userRole === 'ADMIN' ? (
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="products/:productId/variants" element={<ProductVariants />} />
          <Route path="brands" element={<Brands />} />
          <Route path="categories" element={<Categories />} />
          <Route path="customers" element={<Customers />} />
          <Route path="settings" element={<Settings />} />
          <Route path="sizes" element={<Sizes />} />
        </Route>
      ) : (
        <Route path="/customer" element={<CustomerLayout />}>
          <Route index element={<Navigate to="/customer/products" replace />} />
          <Route path="products" element={<CustomerProducts />} />
        </Route>
      )}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default AppRoutes;