import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { FaShoppingBag } from 'react-icons/fa';
import toast from 'react-hot-toast';
import SimplifiedCartProductItem from '../components/SimplifiedCartProductItem';
import { useNavigate, useLocation } from 'react-router-dom';

const Cart = () => {
  const { cart, currentUser, removeFromCart, markCartAsSeen } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
   const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL;
  useEffect(() => {
    // Reset the unseen cart count when the cart page loads
    markCartAsSeen();
    
    const fetchCartDetails = async () => {
      try {
        if (currentUser) {
          const response = await axios.get(
            `${API_URL}/api/cart/${currentUser._id}`
          );
          setCartItems(response.data);
        }
      } catch (error) {
        console.error('Error fetching cart:', error);
        toast.error('Failed to load cart');
      } finally {
        setLoading(false);
      }
    };
    fetchCartDetails();
  }, [currentUser, cart, markCartAsSeen]);

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success('Product removed from cart');
    } catch (error) {
      toast.error('Failed to remove product');
      console.error('Remove product error:', error);
    }
  };

const handleBuyNow = (product, variantIndex, quantity) => {
  navigate('/checkout', {
    state: {
      cartItems: [{
        productId: product,
        variantIndex: variantIndex,
        quantity: quantity
      }]
    }
  });
};


  // Navigate to checkout with the entire cart
  const handleProceedToCheckout = () => {
    if (!currentUser) {
      toast.error('Please login to proceed to checkout');
      return;
    }
navigate('/checkout', { state: { cartItems } });
  };


  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + (item.productId?.price || 0),
      0
    );
  };

  if (loading) return <div className="text-center py-10">Loading cart...</div>;

  // If user is NOT logged in — show login screen
if (!currentUser) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <FaShoppingBag className="mx-auto text-5xl text-gray-300 mb-4" />
        <h2 className="text-xl mb-4">Please login to view your cart</h2>
        <Link 
          to="/login" 
          className="text-blue-600 hover:underline font-medium"
        >
          Login Now
        </Link>
      </div>
    </div>
  );
}


  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#8CE4FF] to-[#FEEE91] flex items-center justify-center px-4">
        <div className="text-center bg-white/90 backdrop-blur-lg rounded-2xl border border-white/30 p-8 max-w-md w-full shadow-lg">
          <FaShoppingBag className="mx-auto text-6xl text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added anything to your cart yet
          </p>
          <Link
            to="/"
            className="bg-[#FFA239] text-white py-3 px-8 rounded-xl hover:bg-[#ff9933] transition-all duration-200 font-medium shadow-lg hover:shadow-xl inline-block"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8CE4FF] to-[#FEEE91] py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Shopping Cart</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Cart Items */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map(item => (
              <div key={item._id || item.productId._id} className="bg-white/90 backdrop-blur-lg rounded-2xl border border-white/30 p-6 shadow-lg hover:shadow-xl transition-all duration-300">
                <SimplifiedCartProductItem
                  product={item.productId}
                  variantIndex={item.variantIndex}
                  quantity={item.quantity}
                  onRemove={() => handleRemoveItem(item.productId._id)}
                  onBuyNow={(product, variantIndex, quantity) => 
                    handleBuyNow(product, variantIndex, quantity)
                  }
                />
              </div>
            ))}
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-white/30 p-6 shadow-lg sticky top-8">
              
              <div className="space-y-3 mb-6">
               
               

               <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="grid grid-cols-3 gap-2 text-center text-xs text-gray-600">
                  <div>
                    <div className="text-green-600 text-lg mb-1">✓</div>
                    <div>Secure Payment</div>
                  </div>
                  <div>
                    <div className="text-green-600 text-lg mb-1">✓</div>
                    <div>Free Shipping</div>
                  </div>
                  <div>
                    <div className="text-green-600 text-lg mb-1">✓</div>
                    <div>Easy Returns</div>
                  </div>
                </div>
              </div>
              
              
                <div className="border-t border-gray-200 pt-3 mt-3">
                
                </div>
              </div>

            

              <div className="mt-4 text-center">
                <Link 
                  to="/" 
                  className="text-[#FFA239] hover:text-[#ff9933] font-medium transition-colors inline-block"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;