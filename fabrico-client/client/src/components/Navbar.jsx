import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FaShoppingCart, FaUser, FaBox, FaBars, FaSignOutAlt, FaHome, FaTimes } from 'react-icons/fa';
import { useState } from 'react';
import logo from "../../src/public/logo.png"

const Navbar = () => {
  const { currentUser, isLoggedIn, logout, cart, unseenCartCount } = useAuth();
  const navigate = useNavigate();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogoutConfirm = () => {
    logout();
    navigate('/');
    setShowMobileMenu(false);
    setShowLogoutConfirm(false);
  };

  const openLogoutConfirm = () => {
    setShowLogoutConfirm(true);
    setShowMobileMenu(false);
  };

  return (
    <nav className="bg-gradient-to-r from-[#8CE4FF] to-[#FEEE91] shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2" onClick={() => setShowMobileMenu(false)}>
             <img
        src={logo}   // <-- path to your logo image
        alt="Fabrico Logo"
        className="h-10 w-10 object-contain"
      />
            <span className="text-2xl font-bold text-gray-900">Fabrico</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isLoggedIn ? (
              <>
                {/* Home Button */}
                <Link 
                  to="/" 
                  className="flex items-center space-x-1 text-gray-900 hover:text-gray-700 transition-colors p-2"
                >
                  <FaHome className="text-lg" />
                  <span>Home</span>
                </Link>

                {/* Cart */}
                <Link 
                  to="/cart" 
                  className="relative text-gray-900 hover:text-gray-700 transition-colors p-2"
                >
                  <div className="flex items-center space-x-1">
                    <FaShoppingCart className="text-lg" />
                    <span>Cart</span>
                  </div>
                  {unseenCartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#FF5656] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
                      {unseenCartCount}
                    </span>
                  )}
                </Link>

                {/* Orders */}
                <Link 
                  to="/your-orders" 
                  className="text-gray-900 hover:text-gray-700 transition-colors p-2"
                >
                  <div className="flex items-center space-x-1">
                    <FaBox className="text-lg" />
                    <span>Orders</span>
                  </div>
                </Link>

                {/* User Section */}
                <div className="flex items-center space-x-4 border-l border-gray-900/20 pl-4">
                  <div className="flex items-center space-x-2 bg-white/30 px-3 py-1 rounded-full backdrop-blur-sm">
                    <FaUser className="text-gray-900 text-sm" />
                    <span className="text-gray-900 text-sm font-medium">
                      {currentUser?.name}
                    </span>
                  </div>
                  
                  <button 
                    onClick={openLogoutConfirm}
                    className="flex items-center space-x-2 bg-[#FF5656] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#ff4444] transition-all duration-200 shadow-md"
                  >
                    <FaSignOutAlt className="text-sm" />
                    <span>Logout</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link 
                  to="/login" 
                  className="text-gray-900 hover:text-gray-700 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="bg-[#FFA239] text-white px-4 py-2 rounded-lg text-sm hover:bg-[#ff9933] transition-colors shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden p-2 rounded-lg hover:bg-white/20 transition-colors"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
          >
            <FaBars className="text-gray-900 text-xl" />
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden border-t border-gray-900/20 py-4 bg-gradient-to-b from-[#8CE4FF] to-[#FEEE91]">
            {isLoggedIn ? (
              <div className="space-y-4">
                {/* Home Button - Mobile */}
                <Link 
                  to="/" 
                  className="flex items-center space-x-3 text-gray-900 hover:text-gray-700 p-2 rounded-lg hover:bg-white/20 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <FaHome />
                  <span>Home</span>
                </Link>

                <Link 
                  to="/cart" 
                  className="flex items-center space-x-3 text-gray-900 hover:text-gray-700 p-2 rounded-lg hover:bg-white/20 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <FaShoppingCart />
                  <span>Cart {unseenCartCount > 0 && `(${unseenCartCount})`}</span>
                </Link>
                <Link 
                  to="/your-orders" 
                  className="flex items-center space-x-3 text-gray-900 hover:text-gray-700 p-2 rounded-lg hover:bg-white/20 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <FaBox />
                  <span>Your Orders</span>
                </Link>
                <div className="border-t border-gray-900/20 pt-4">
                  <div className="flex items-center space-x-3 text-gray-900 p-2">
                    <FaUser />
                    <span className="font-medium">{currentUser?.name}</span>
                  </div>
                  <button 
                    onClick={openLogoutConfirm}
                    className="w-full text-left flex items-center space-x-3 text-[#FF5656] hover:text-[#ff4444] p-2 rounded-lg hover:bg-white/20 transition-colors"
                  >
                    <FaSignOutAlt />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <Link 
                  to="/login" 
                  className="block text-gray-900 hover:text-gray-700 p-2 rounded-lg hover:bg-white/20 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign In
                </Link>
                <Link 
                  to="/register" 
                  className="block bg-[#FFA239] text-white text-center py-3 rounded-lg hover:bg-[#ff9933] transition-colors shadow-md"
                  onClick={() => setShowMobileMenu(false)}
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Logout Confirmation Popup */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-sm w-full mx-auto shadow-2xl border border-gray-200 transform animate-scale-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Confirm Logout
              </h3>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
              >
                <FaTimes className="text-sm" />
              </button>
            </div>
            
            {/* Message */}
            <div className="flex items-center space-x-3 mb-6">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-[#FF5656]/10 flex items-center justify-center">
                  <FaSignOutAlt className="h-5 w-5 text-[#FF5656]" />
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                Are you sure you want to logout from your account?
              </p>
            </div>
            
            {/* Buttons */}
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium text-sm cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleLogoutConfirm}
                className="flex-1 bg-[#FF5656] text-white px-4 py-2.5 rounded-lg hover:bg-[#ff4444] transition-all duration-200 font-medium text-sm shadow-md cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;