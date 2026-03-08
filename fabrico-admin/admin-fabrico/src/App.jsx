import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import ProductForm from './components/ProductForm';
import ProductList from './components/ProductList';
import { useAuth }    from './context/AuthContext';
import Orders from './components/Orders';

export default function App() {
 const { admin }       = useAuth();
 const isAuthenticated = Boolean(admin);  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route
        path="/dashboard"
        element={
          isAuthenticated
            ? <Dashboard />
            : <Navigate to="/" replace />
        }
      />

      <Route
        path="/profile"
        element={
          isAuthenticated
            ? <Profile />
            : <Navigate to="/" replace />
        }
      />

      {/* Publicly available */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      {/* If you want ProductForm/ProductList protected, wrap them similarly */}
      <Route path="/product-form" element={isAuthenticated ? <ProductForm /> : <Navigate to="/" replace />} />
      <Route path="/products"     element={isAuthenticated ? <ProductList /> : <Navigate to="/" replace />} />
      <Route path="/orders"     element={isAuthenticated ? <Orders /> : <Navigate to="/" replace />} />
  
    </Routes>
  );
}