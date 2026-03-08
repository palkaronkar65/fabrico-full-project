// src/components/ProductList.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function ProductList({ onEdit }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [selectedVariantIndices, setSelectedVariantIndices] = useState({});
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [subCategoryFilter, setSubCategoryFilter] = useState('');

  const subCategories = {
    Men: ['T-shirt', 'Pant', 'Shirt', 'Sport', 'Banyan', 'Hoodies', 'Tracks', 'Cargo'],
    Women: ['Saree', 'Punjabi', 'Dress', 'Lehnga', 'Kurti', 'T-shirt', 'Pant'],
    Kids: ['T-shirt', 'Pant']
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (subCategoryFilter) params.append('subCategory', subCategoryFilter);

      const res = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/products?${params.toString()}`
      );

      setProducts(res.data);

      const indices = {};
      res.data.forEach((product) => {
        indices[product._id] = 0;
      });
      setSelectedVariantIndices(indices);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingId(id);
      const response = await axios.delete(
        `${import.meta.env.VITE_API_URL}/api/products/${id}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setProducts(products.filter(product => product._id !== id));
        alert(response.data.message || 'Product deleted successfully');
      } else {
        throw new Error(response.data.error || 'Failed to delete product');
      }
    } catch (err) {
      console.error('Detailed delete error:', {
        message: err.message,
        response: err.response?.data,
        config: err.config
      });
      alert(`Delete failed: ${err.response?.data?.error || err.message || 'Server error'}`);
      fetchProducts();
    } finally {
      setDeletingId(null);
    }
  };

  const deleteVariant = async (productId, variantIndex) => {
    if (!window.confirm('Are you sure you want to delete this color variant?')) {
      return;
    }

    try {
      setDeletingId(productId);
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/api/products/${productId}/variants`,
        { variantIndex },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        fetchProducts();
        alert('Color variant deleted successfully');
      } else {
        throw new Error(response.data.error || 'Failed to delete variant');
      }
    } catch (err) {
      console.error('Variant delete error:', err);
      alert(`Failed to delete variant: ${err.response?.data?.error || err.message || 'Server error'}`);
    } finally {
      setDeletingId(null);
    }
  };

  // EDIT: call parent handler if provided, otherwise fallback to navigation
  const handleEdit = (product) => {
    if (typeof onEdit === 'function') {
      onEdit(product); // <-- OPEN IN PLACE
    } else {
      navigate('/product-form', { state: { product } }); // fallback
    }
  };

  const handleVariantSelect = (productId, index) => {
    setSelectedVariantIndices(prev => ({
      ...prev,
      [productId]: index
    }));
  };

  useEffect(() => {
    fetchProducts();
  }, [searchTerm, categoryFilter, subCategoryFilter]);

  // Listen for productSaved event to refresh list after add/update
  useEffect(() => {
    const handler = () => {
      fetchProducts();
    };
    window.addEventListener('productSaved', handler);
    return () => window.removeEventListener('productSaved', handler);
  }, []);

  // Reset subcategory filter when category changes
  useEffect(() => {
    setSubCategoryFilter('');
  }, [categoryFilter]);

  return (
    <div className="mt-6 space-y-6">
      {/* Loading Indicator */}
      {loading && (
        <div className="flex justify-center py-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Categories</option>
            {Object.keys(subCategories).map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <select
            value={subCategoryFilter}
            onChange={(e) => setSubCategoryFilter(e.target.value)}
            disabled={!categoryFilter}
            className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <option value="">All Subcategories</option>
            {categoryFilter && subCategories[categoryFilter].map(subCat => (
              <option key={subCat} value={subCat}>{subCat}</option>
            ))}
          </select>

          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setSubCategoryFilter('');
            }}
            className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={fetchProducts}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {/* No Products Found */}
      {products.length === 0 && !loading && (
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-500 text-lg">No products found matching your filters</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('');
              setSubCategoryFilter('');
            }}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Product List */}
      {products.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div
              key={product._id}
              className="bg-white shadow rounded-lg overflow-hidden flex flex-col"
            >
              {/* Image area (fixed height) */}
              {product.variants[selectedVariantIndices[product._id] || 0]?.images?.[0] ? (
                <div className="w-full h-44 flex items-center justify-center bg-white p-4">
                  <img
                    src={product.variants[selectedVariantIndices[product._id] || 0]?.images[0]}
                    alt={product.name}
                    className="max-h-full object-contain"
                  />
                </div>
              ) : (
                <div className="w-full h-44 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}

              {/* Product Info — flexible body with its own scrollbar if content grows */}
              <div className="p-4 flex-1 min-h-0 overflow-auto">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold truncate">{product.name}</h3>
                  <p className="text-gray-600">₹{product.price}</p>

                  {/* COD Badge */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        product.codAvailable
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {product.codAvailable ? 'COD Available' : 'COD Not Available'}
                    </span>
                  </div>

                  <p className="text-gray-500 text-sm">
                    Category: <span className="font-medium">{product.category}</span>
                    <span className="ml-2">Sub: <span className="font-medium">{product.subCategory}</span></span>
                  </p>

                  {/* Color Variants */}
                  <div className="mt-2">
                    <p className="text-xs font-medium">Colors:</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {product.variants.map((variant, i) => (
                        <div key={i} className="flex items-center">
                          <button
                            onClick={() => handleVariantSelect(product._id, i)}
                            className={`flex items-center p-1 rounded ${ (selectedVariantIndices[product._id] || 0) === i ? 'bg-gray-200' : '' }`}
                          >
                            <span
                              className="w-3 h-3 rounded-full border"
                              style={{ backgroundColor: (variant.color || '').toLowerCase() }}
                            />
                            <span className="ml-1 text-xs max-w-[5rem] truncate">{variant.color}</span>
                          </button>
                          <button
                            onClick={() => deleteVariant(product._id, i)}
                            className="ml-1 text-red-500 hover:text-red-700 text-xs"
                            disabled={deletingId === product._id}
                            title="Delete variant"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => handleEdit(product)}
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex-1"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteProduct(product._id)}
                    className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 flex-1"
                    disabled={deletingId === product._id}
                  >
                    {deletingId === product._id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
