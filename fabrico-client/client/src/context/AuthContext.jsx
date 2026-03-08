import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [unseenCartCount, setUnseenCartCount] = useState(0);
  const API_URL = import.meta.env.VITE_API_URL;
  // Initialize from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem('fabrico_user');
    const storedUnseen = localStorage.getItem('fabrico_unseen_cart');
    
 if (storedUser) {
    const userData = JSON.parse(storedUser);
    setUser(userData);
    setCart(userData.cart || []);
    // Initialize unseen count to 0 on refresh
    setUnseenCartCount(0);
    localStorage.setItem('fabrico_unseen_cart', '0');
  }
}, []);

  // Persist user data
  const persistUser = (userData) => {
    localStorage.setItem('fabrico_user', JSON.stringify(userData));
    setUser(userData);
  };

  // Cart management functions
  const updateCart = (newCart) => {
    setCart(newCart);
    if (user) {
      const updatedUser = { ...user, cart: newCart };
      persistUser(updatedUser);
    }
  };

  const login = (userData) => {
    const initialUnseen = userData.cart?.length || 0;
    setUnseenCartCount(initialUnseen);
    localStorage.setItem('fabrico_unseen_cart', initialUnseen.toString());
    persistUser(userData);
  };

const markCartAsSeen = () => {
  // console.log('Marking cart as seen');
  setUnseenCartCount(0);
  localStorage.setItem('fabrico_unseen_cart', '0');
};

const addToCart = async (productId) => {
  try {
    // Check if already in cart
    if (cart.some(item => item.productId?._id === productId)) {
      return { success: false, message: 'Product already in cart' };
    }

    const response = await axios.post(`${API_URL}/api/cart/add`, {
      userId: user._id,
      productId
    });

    const updatedCart = response.data.cart;
    updateCart(updatedCart);
    setUnseenCartCount(prev => {
      const newCount = prev + 1;
      localStorage.setItem('fabrico_unseen_cart', newCount.toString());
      return newCount;
    });

    return { success: true, cart: updatedCart }; // Return updated cart
  } catch (error) {
    console.error('Add to cart error:', error);
    return { 
      success: false, 
      message: error.response?.data?.error || 'Failed to add to cart' 
    };
  }
};

const removeFromCart = async (productId) => {
  try {
    const response = await axios.post(`${API_URL}/api/cart/remove`, {
      userId: user._id,
      productId
    });

    const updatedCart = response.data.cart;
    updateCart(updatedCart);
    setUnseenCartCount(prev => Math.max(0, prev - 1));
    
    return { success: true, cart: updatedCart }; // Return updated cart
  } catch (error) {
    console.error('Remove from cart error:', error);
    throw error;
  }
};

  const logout = async () => {
    try {
      if (user) {
        await axios.put(`${API_URL}/api/users/${user._id}/login-status`, {
          isLoggedIn: false
        });
      }
    } finally {
      setUser(null);
      setCart([]);
      setUnseenCartCount(0);
      localStorage.removeItem('fabrico_user');
      localStorage.removeItem('fabrico_unseen_cart');
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser: user,
      isLoggedIn: !!user,
      cart,
      unseenCartCount,
      addToCart,
      removeFromCart,
      markCartAsSeen,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);