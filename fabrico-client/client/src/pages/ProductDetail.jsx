import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaShare, FaArrowLeft, FaCheck } from 'react-icons/fa';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Tryon from '../components/Tryon';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, addToCart, currentUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [showTryon, setShowTryon] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  
  // Reviews state
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const API_URL = import.meta.env.VITE_API_URL;

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_URL}/api/products/${id}`);
        setProduct(response.data);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Fetch reviews when product loads
  useEffect(() => {
    if (product?._id) {
      fetchReviews();
    }
  }, [product]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/reviews/product/${product._id}`);
      setReviews(res.data);
    } catch (err) {
      console.error('Failed to fetch reviews', err);
      toast.error('Could not load reviews');
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!newReview.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(`${API_URL}/api/reviews`, {
        productId: product._id,
        userId: currentUser._id,
        reviewText: newReview
      });
      setReviews(prev => [res.data, ...prev]);
      setNewReview('');
      toast.success('Review added!');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isLoggedIn) {
      toast.error('Please login to add items to cart');
      return;
    }

    try {
      const result = await addToCart(product._id);
      if (result.success) {
        toast.success('Added to cart!');
      } else {
        toast.error('Item already in cart!');
      }
    } catch (error) {
      toast.error('Failed to add to cart');
    }
  };

  const handleBuyNow = () => {
    if (!isLoggedIn) {
      toast.error('Please login to buy products');
      return;
    }

    navigate('/checkout', {
      state: {
        product,
        variantIndex: selectedVariant,
        quantity
      }
    });
  };

  const handleShare = () => {
    setShowShareOptions(true);
  };

  const shareOnWhatsApp = () => {
    const text = `Check out ${product.name} on Fabrico!`;
    const url = window.location.href;
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
    setShowShareOptions(false);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success('Link copied to clipboard!');
      setShowShareOptions(false);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareOnFacebook = () => {
    const url = encodeURIComponent(window.location.href);
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, '_blank');
    setShowShareOptions(false);
  };

  const shareOnTwitter = () => {
    const text = encodeURIComponent(`Check out ${product.name} on Fabrico!`);
    const url = encodeURIComponent(window.location.href);
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
    setShowShareOptions(false);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-96 bg-gray-200 rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Back to Home
        </button>
      </div>
    );
  }

  const variant = product.variants?.[selectedVariant] || {};
  const maxQuantity = variant.quantity || 0;

  return (
    <div className="min-h-screen bg-white">
      {/* Mobile Back Button - Sticky */}
      <div className="lg:hidden bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-gray-600 hover:text-gray-800"
          >
            <FaArrowLeft className="mr-2" />
            <span className="font-medium">Back</span>
          </button>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 lg:py-8">
        {/* Desktop Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="hidden lg:flex items-center text-gray-600 hover:text-gray-800 mb-6"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              {variant.images?.[selectedImage] ? (
                <img
                  src={variant.images[selectedImage]}
                  alt={product.name}
                  className="w-full h-64 lg:h-96 object-contain rounded-lg"
                />
              ) : (
                <div className="w-full h-64 lg:h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Images */}
            {variant.images && variant.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {variant.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`flex-shrink-0 w-16 h-16 lg:w-20 lg:h-20 border-2 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'border-blue-500' : 'border-gray-200'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-xl lg:text-2xl font-semibold text-blue-600 mb-4">₹{product.price}</p>
              
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  product.codAvailable
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {product.codAvailable ? 'COD Available' : 'COD Not Available'}
                </span>
                <span className="text-sm text-gray-500 capitalize">
                  {product.category} • {product.subCategory}
                </span>
              </div>
            </div>

            {/* Color Variants */}
            {product.variants && product.variants.length > 0 && (
              <div>
                <h3 className="text-lg font-medium mb-3">Select Color:</h3>
                <div className="flex flex-wrap gap-3">
                  {product.variants.map((v, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        setSelectedVariant(index);
                        setSelectedImage(0);
                        setQuantity(1);
                      }}
                      disabled={v.quantity <= 0}
                      className={`flex flex-col items-center p-2 border-2 rounded-lg transition-all ${
                        selectedVariant === index
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${v.quantity <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <div
                        className="w-10 h-10 lg:w-12 lg:h-12 rounded-full border"
                        style={{ backgroundColor: v.color.toLowerCase() }}
                      />
                      <span className="text-xs mt-1 text-gray-600">{v.color}</span>
                      <span className={`text-xs ${
                        v.quantity > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {v.quantity > 0 ? `${v.quantity} available` : 'Out of stock'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <h3 className="text-lg font-medium mb-3">Quantity:</h3>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center border border-gray-300 rounded w-fit">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    -
                  </button>
                  <span className="px-4 py-2 border-x border-gray-300 min-w-12 text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity}
                    className="px-4 py-2 hover:bg-gray-100 disabled:opacity-50 transition-colors"
                  >
                    +
                  </button>
                </div>
                <span className="text-sm text-gray-500">
                  {maxQuantity} pieces available
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={maxQuantity === 0}
                  className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium flex items-center justify-center gap-2 transition-colors"
                >
                  <FaShoppingCart />
                  Add to Cart
                </button>
                
                <button
                  onClick={() => setShowTryon(true)}
                  className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                  title="Virtual Try-On"
                >
                  👗 Try On
                </button>
              </div>
              
              <button
                onClick={handleBuyNow}
                disabled={maxQuantity === 0}
                className="w-full bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
              >
                Buy Now
              </button>
            </div>

            {/* Additional Actions */}
            <div className="flex gap-4 pt-4 border-t border-gray-200">
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 text-gray-600 hover:text-blue-500 transition-colors"
              >
                <FaShare />
                <span>Share</span>
              </button>
            </div>
          </div>
        </div>

        {/* Product Description Section */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-xl font-bold mb-4">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium mb-3">Specifications</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><strong>Category:</strong> {product.category}</li>
                <li><strong>Subcategory:</strong> {product.subCategory}</li>
                <li><strong>Color:</strong> {variant.color}</li>
                <li><strong>Available Sizes:</strong> {product.sizes?.join(', ') || 'One Size'}</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium mb-3">Delivery Info</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✓ Free delivery</li>
                <li>✓ 7-day return policy</li>
                <li>✓ Cash on Delivery available</li>
                <li>✓ Estimated delivery: 1-2 business days</li>
              </ul>
            </div>
          </div>
        </div>

        {/* ========== REVIEWS SECTION ========== */}
        <div className="bg-white rounded-lg border border-gray-200 p-6 mt-6">
          <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>

          {/* Review Form */}
          {isLoggedIn ? (
            <form onSubmit={handleReviewSubmit} className="mb-6">
              <textarea
                value={newReview}
                onChange={(e) => setNewReview(e.target.value)}
                placeholder="Write your review..."
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              />
              <button
                type="submit"
                disabled={submitting}
                className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
              >
                {submitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          ) : (
            <p className="text-gray-600 mb-6">
              Please <Link to="/login" className="text-blue-600 hover:underline">login</Link> to write a review.
            </p>
          )}

          {/* Reviews List */}
          {reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet. Be the first to review!</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review._id} className="border-b pb-4 last:border-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-semibold">{review.user?.name || 'Anonymous'}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="mt-2 text-gray-700">{review.reviewText}</p>
                  {review.adminReply && (
                    <div className="mt-3 pl-4 border-l-4 border-blue-300 bg-blue-50 p-3 rounded">
                      <p className="text-sm font-medium text-blue-800">Fabrico Admin Reply:</p>
                      <p className="text-sm text-gray-700">{review.adminReply}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Share Options Modal */}
        {showShareOptions && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-auto">
              <h3 className="text-lg font-medium mb-4">Share this product</h3>
              <div className="space-y-3">
                <button
                  onClick={shareOnWhatsApp}
                  className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <span>WhatsApp</span>
                </button>
                <button
                  onClick={shareOnFacebook}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Facebook</span>
                </button>
                <button
                  onClick={shareOnTwitter}
                  className="w-full bg-blue-400 text-white py-2 px-4 rounded hover:bg-blue-500 flex items-center justify-center gap-2 transition-colors"
                >
                  <span>Twitter</span>
                </button>
                <button
                  onClick={copyLink}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700 flex items-center justify-center gap-2 transition-colors"
                >
                  <FaCheck className="mr-2" />
                  <span>Copy Link</span>
                </button>
              </div>
              <button
                onClick={() => setShowShareOptions(false)}
                className="w-full mt-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Tryon Popup */}
        {showTryon && (
          <Tryon 
            product={product}
            selectedVariant={selectedVariant}
            onVariantChange={setSelectedVariant}
            onClose={() => setShowTryon(false)} 
          />
        )}
      </div>
    </div>
  );
};

export default ProductDetail;