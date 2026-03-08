import { useEffect, useState } from 'react';
import axios from 'axios';
import { FaShoppingCart, FaCartPlus, FaFilter, FaSearch, FaTimes } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Tryon from '../components/Tryon';

const subCategories = {
  Men: ['T-shirt', 'Pant', 'Shirt', 'Sport', 'Banyan', 'Hoodies', 'Tracks', 'Cargo'],
  Women: ['Saree', 'Punjabi', 'Dress', 'Lehnga', 'Kurti', 'T-shirt', 'Pant'],
  Kids: ['T-shirt', 'Pant']
};

export default function Home() {
  const [allProducts, setAllProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariants, setSelectedVariants] = useState({});
  const [showTryon, setShowTryon] = useState(false);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [codAvailable, setCodAvailable] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const API_URL = import.meta.env.VITE_API_URL;

  const { isLoggedIn, cart, addToCart, removeFromCart } = useAuth();
  const navigate = useNavigate();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(`${API_URL}/api/products`);
      
      setAllProducts(Array.isArray(data) ? data : []);
      setFilteredProducts(Array.isArray(data) ? data : []);
      
      const initialSelected = data.reduce((acc, product) => {
        if (product._id && product.variants?.length) {
          acc[product._id] = 0;
        }
        return acc;
      }, {});
      
      setSelectedVariants(initialSelected);
    } catch (err) {
      setError('Failed to load products. Please try again later.');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  // Apply all filters
  useEffect(() => {
    let filtered = [...allProducts];

    if (searchQuery.trim() !== '') {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.subCategory.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    if (selectedSubCategory) {
      filtered = filtered.filter(product => product.subCategory === selectedSubCategory);
    }

    if (codAvailable) {
      filtered = filtered.filter(product => product.codAvailable === true);
    }

    filtered = filtered.filter(product => 
      product.price >= priceRange[0] && product.price <= priceRange[1]
    );

    setFilteredProducts(filtered);
  }, [searchQuery, allProducts, selectedCategory, selectedSubCategory, codAvailable, priceRange]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedSubCategory('');
    setCodAvailable(false);
    setPriceRange([0, 10000]);
  };

  const isInCart = (productId) => {
    return cart?.some(item => item.productId?._id === productId) || false;
  };

  const handleCartAction = async (product) => {
    if (!isLoggedIn) {
      setSelectedProduct(product);
      setShowLoginPrompt(true);
      return;
    }

    try {
      if (isInCart(product._id)) {
        await removeFromCart(product._id);
        toast.success('Removed from cart!');
      } else {
        const result = await addToCart(product._id);
        if (result.success) {
          toast.success('Added to cart!');
        } else {
          toast.error('Item already in cart!');
        }
      }
    } catch (error) {
      console.error('Cart action failed:', error);
      toast.error('Item already in cart!');
    }
  };

  const handleBuyNow = async (product) => {
    if (!isLoggedIn) {
      setSelectedProduct(product);
      setShowLoginPrompt(true);
      return;
    }

    try {
      navigate('/checkout', { 
        state: { 
          product
        } 
      });
    } catch (error) {
      toast.error('Failed to proceed to checkout');
    }
  };

  const handleProductClick = (product) => {
    navigate(`/product/${product._id}`);
  };

  const handleTryOn = (product, e) => {
    e.stopPropagation();
    setSelectedProduct(product);
    setShowTryon(true);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#8CE4FF] to-[#FEEE91] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#FFA239] mx-auto mb-4"></div>
          <p className="text-gray-700 font-medium">Loading amazing products...</p>
        </div>
      </div>
    );
  }

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-[#8CE4FF] to-[#FEEE91] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">😔</div>
        <p className="text-[#FF5656] text-xl font-semibold">{error}</p>
      </div>
    </div>
  );
  
  if (!allProducts.length) return (
    <div className="min-h-screen bg-gradient-to-br from-[#8CE4FF] to-[#FEEE91] flex items-center justify-center">
      <div className="text-center">
        <div className="text-6xl mb-4">🛍️</div>
        <p className="text-gray-700 text-xl font-semibold">No products available</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#8CE4FF] to-[#FEEE91]">
      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-16 z-40 shadow-sm">
        <div className="max-w-7xl  mx-auto px-4 py-4">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search products by name, category..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-white/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFA239] focus:border-transparent bg-white/50 backdrop-blur-sm placeholder-gray-500 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Mobile Filter Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 shadow-sm">
        <div className="max-w-7xl   mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold text-gray-900">
              Discover Products <span className="text-[#FFA239]">({filteredProducts.length})</span>
            </h1>
            <button
              onClick={() => setShowMobileFilters(!showMobileFilters)}
              className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 bg-white/60 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/30 hover:border-[#FFA239]/30 transition-all duration-200 cursor-pointer hover:shadow-md"
            >
              <FaFilter className="text-[#FFA239]" />
              <span className="font-medium">Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex">
          {/* Filters Sidebar - Mobile Overlay */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm z-50 md:hidden">
              <div className="absolute right-0 top-0 h-full w-80 bg-white/95 backdrop-blur-lg shadow-xl overflow-y-auto border-l border-white/30">
                <div className="p-4 border-b border-gray-200/50">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Filters</h2>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors"
                    >
                      <FaTimes className="text-gray-600" />
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <FiltersContent 
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    selectedSubCategory={selectedSubCategory}
                    setSelectedSubCategory={setSelectedSubCategory}
                    codAvailable={codAvailable}
                    setCodAvailable={setCodAvailable}
                    priceRange={priceRange}
                    setPriceRange={setPriceRange}
                    resetFilters={resetFilters}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Filters Sidebar - Desktop */}
          <div className="hidden md:block w-64 flex-shrink-0 mr-6">
            <div className="bg-white/90 backdrop-blur-lg rounded-2xl border border-white/30 p-4 sticky top-32 shadow-lg">
              <FiltersContent 
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                selectedSubCategory={selectedSubCategory}
                setSelectedSubCategory={setSelectedSubCategory}
                codAvailable={codAvailable}
                setCodAvailable={setCodAvailable}
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                resetFilters={resetFilters}
              />
            </div>
          </div>

          {/* Products Grid */}
        <div
  className="flex-1 scrollbar-modern"
  style={{ maxHeight: 'calc(100vh - 8rem)', overflow: 'auto' }}
>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12 bg-white/50 backdrop-blur-sm rounded-2xl border border-white/30 shadow-lg">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
                <p className="text-gray-700 mb-6">Try adjusting your search or filters</p>
                <button 
                  onClick={resetFilters}
                  className="bg-[#FFA239] text-white px-6 py-3 rounded-xl hover:bg-[#ff9933] transition-all duration-200 cursor-pointer shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
<div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 items-stretch">
                {filteredProducts.map(product => (
                  <ProductCard 
                    key={product._id}
                    product={product}
                    selectedVariants={selectedVariants}
                    setSelectedVariants={setSelectedVariants}
                    isInCart={isInCart}
                    handleProductClick={handleProductClick}
                    handleTryOn={handleTryOn}
                    handleCartAction={handleCartAction}
                    handleBuyNow={handleBuyNow}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-auto shadow-2xl border border-white/30">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Login Required</h3>
            <p className="text-gray-600 mb-6">
              Please login to add items to your cart and continue shopping.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLoginPrompt(false)}
                className="flex-1 px-4 py-3 text-gray-700 border border-gray-300 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => navigate('/login')}
                className="flex-1 bg-[#FFA239] text-white px-4 py-3 rounded-xl hover:bg-[#ff9933] cursor-pointer transition-all duration-200 shadow-lg hover:shadow-xl font-semibold"
              >
                Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tryon Popup */}
      {showTryon && (
        <Tryon 
          product={selectedProduct} 
          onClose={() => setShowTryon(false)} 
        />
      )}
    </div>
  );
}

// Separate component for filters content
function FiltersContent({
  selectedCategory,
  setSelectedCategory,
  selectedSubCategory,
  setSelectedSubCategory,
  codAvailable,
  setCodAvailable,
  priceRange,
  setPriceRange,
  resetFilters
}) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Category</h3>
        <select
          value={selectedCategory}
          onChange={(e) => {
            setSelectedCategory(e.target.value);
            setSelectedSubCategory('');
          }}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFA239] focus:border-transparent cursor-pointer bg-white/80 backdrop-blur-sm transition-all duration-200"
        >
          <option value="">All Categories</option>
          {Object.keys(subCategories).map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Subcategory</h3>
        <select
          value={selectedSubCategory}
          onChange={(e) => setSelectedSubCategory(e.target.value)}
          disabled={!selectedCategory}
          className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#FFA239] focus:border-transparent disabled:bg-gray-50 cursor-pointer transition-all duration-200"
        >
          <option value="">All Subcategories</option>
          {selectedCategory && subCategories[selectedCategory].map(subCat => (
            <option key={subCat} value={subCat}>{subCat}</option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Price Range</h3>
        <div className="space-y-2">
          {[
            { label: 'Under ₹500', range: [0, 500] },
            { label: '₹500 - ₹1,000', range: [500, 1000] },
            { label: '₹1,000 - ₹5,000', range: [1000, 5000] },
            { label: '₹5,000 - ₹10,000', range: [5000, 10000] },
            { label: 'Over ₹10,000', range: [10000, Infinity] }
          ].map((item, index) => (
            <label key={index} className="flex items-center space-x-3 cursor-pointer group">
              <input
                type="radio"
                name="priceRange"
                checked={priceRange[0] === item.range[0] && priceRange[1] === item.range[1]}
                onChange={() => setPriceRange(item.range)}
                className="text-[#FFA239] focus:ring-[#FFA239] cursor-pointer transform scale-110"
              />
              <span className="text-gray-700 group-hover:text-gray-900 transition-colors">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="p-3 bg-[#FEEE91]/20 rounded-xl border border-[#FEEE91]/30">
        <label className="flex items-center space-x-3 cursor-pointer">
          <input
            type="checkbox"
            checked={codAvailable}
            onChange={(e) => setCodAvailable(e.target.checked)}
            className="rounded text-[#FFA239] focus:ring-[#FFA239] cursor-pointer transform scale-110"
          />
          <span className="font-medium text-gray-700">🚚 COD Available Only</span>
        </label>
      </div>

      <button
        onClick={resetFilters}
        className="w-full bg-[#8CE4FF] text-gray-900 py-3 rounded-xl hover:bg-[#7ad4ff] transition-all duration-200 font-semibold cursor-pointer shadow-md hover:shadow-lg transform hover:scale-105"
      >
        🔄 Reset Filters
      </button>
    </div>
  );
}

// Separate component for product card
function ProductCard({
  product,
  selectedVariants,
  setSelectedVariants,
  isInCart,
  handleProductClick,
  handleTryOn,
  handleCartAction,
  handleBuyNow
}) {
  const variantIndex = selectedVariants[product._id] || 0;
  const variant = product.variants?.[variantIndex] || {};
  const mainImage = variant.images?.[0];

  return (
    <div 
      className="bg-white/90 backdrop-blur-lg border border-white/30 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group"
      onClick={() => handleProductClick(product)}
    >
      {/* Product Image - Reverted to original styling */}
      <div className="relative aspect-square bg-gray-100 overflow-hidden">
        {mainImage ? (
          <img
            src={mainImage}
            alt={product.name}
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            No image
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="absolute top-2 left-2 right-2 flex justify-between">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleTryOn(product, e);
            }}
            className="bg-[#FFA239] text-white px-3 py-2 rounded-full text-xs font-medium hover:bg-[#ff9933] transition-all duration-200 cursor-pointer shadow-lg z-10 transform group-hover:scale-105"
          >
            👗 Try On
          </button>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCartAction(product);
            }}
            className={`p-2 rounded-full shadow-lg z-10 cursor-pointer transition-all duration-200 transform group-hover:scale-110 ${
              isInCart(product._id)
                ? 'bg-[#FF5656] text-white hover:bg-[#ff4444]'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {isInCart(product._id) ? <FaShoppingCart size={14} /> : <FaCartPlus size={14} />}
          </button>
        </div>

        {/* Stock Badge */}
        {variant.quantity <= 0 && (
          <div className="absolute bottom-2 left-2 bg-[#FF5656] text-white px-3 py-1 rounded-full text-xs z-10 font-medium shadow-md">
            Out of Stock
          </div>
        )}

        {/* COD Badge */}
        {product.codAvailable && variant.quantity > 0 && (
          <div className="absolute bottom-2 right-2 bg-[#FEEE91] text-gray-900 px-3 py-1 rounded-full text-xs z-10 font-medium shadow-md">
            🚚 COD
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-sm mb-2 line-clamp-2 group-hover:text-[#FFA239] transition-colors duration-200">
          {product.name}
        </h3>
        
        <div className="flex items-center justify-between mb-3">
          <p className="text-xl font-bold text-gray-900">₹{product.price}</p>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${
            variant.quantity > 0 
              ? 'bg-[#8CE4FF] text-gray-900' 
              : 'bg-[#FF5656] text-white'
          }`}>
            {variant.quantity > 0 ? `${variant.quantity} left` : 'Sold Out'}
          </span>
        </div>

        {/* Color Variants */}
        {product.variants?.length > 0 && (
          <div className="mb-3">
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedVariants(prev => ({
                      ...prev,
                      [product._id]: idx
                    }));
                  }}
                  className={`w-6 h-6 rounded-full border-2 cursor-pointer transition-all duration-200 shadow-md hover:scale-110 ${
                    variantIndex === idx 
                      ? 'border-[#FFA239] ring-2 ring-[#FFA239]/30 scale-110' 
                      : 'border-white hover:border-gray-300'
                  }`}
                  style={{ backgroundColor: v.color.toLowerCase() }}
                  disabled={v.quantity <= 0}
                  title={`${v.color} (${v.quantity} available)`}
                />
              ))}
            </div>
          </div>
        )}

        {/* Category */}
        <p className="text-xs text-gray-600 mb-4 capitalize">
          {product.category} • {product.subCategory}
        </p>
        
        {/* Buy Now Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleBuyNow(product);
          }}
          disabled={variant.quantity <= 0}
          className={`w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
            variant.quantity > 0
              ? 'bg-gradient-to-r from-[#FFA239] to-[#FF5656] text-white hover:from-[#ff9933] hover:to-[#ff4444] shadow-lg hover:shadow-xl transform hover:scale-105'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {variant.quantity > 0 ? '✨ Buy Now' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}