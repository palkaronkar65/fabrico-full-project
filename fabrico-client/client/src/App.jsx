import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Navbar from './components/Navbar';
import ForgotPassword from './components/ForgotPassword';
import Cart from './pages/Cart';
import { Toaster } from 'react-hot-toast';
import SimplifiedCartProductItem from './components/SimplifiedCartProductItem';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import YourOrders from './pages/YourOrders';
import ProductDetail from './pages/ProductDetail';
import Footer from './components/Footer';


function App() {
  return (
    <Router>
      <Navbar />
      <div className="container mx-auto px-4 py-8">
      <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={
            <Home /> 
            } />

          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/SimplifiedCartProductItem" element={<SimplifiedCartProductItem/>} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          <Route path="/your-orders" element={<YourOrders />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          
        </Routes>
      </div>
      <Footer/>
    </Router>
  );
}

export default App;