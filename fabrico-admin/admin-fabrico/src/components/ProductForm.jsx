// ProductForm.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ProductForm({ selectedProduct, onSaved }) { // <-- accept props
  const location = useLocation();
  const navigate = useNavigate();

  // Determine edit source:
  // priority: prop selectedProduct (in-place edit) -> fallback to location.state.product (route edit)
  const routeProduct = location.state?.product;
  const effectiveProduct = selectedProduct ?? routeProduct;
  const isRouteEditMode = Boolean(routeProduct);

  // Form state
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [variants, setVariants] = useState([{ file: null, color: '', quantity: 0 }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [codAvailable, setCodAvailable] = useState(true);

  const resetForm = () => {
    setName('');
    setPrice('');
    setCategory('');
    setSubCategory('');
    setSelectedSizes([]);
    setVariants([{ file: null, color: '', quantity: 0 }]);
    setCodAvailable(true);
  };

  // Color suggestions
  const colorSuggestions = [
    'Red', 'Blue', 'Green', 'Black', 'White', 'Yellow',
    'Purple', 'Pink', 'Orange', 'Brown', 'Gray', 'Silver',
    'Gold', 'Maroon', 'Navy', 'Teal', 'Olive', 'Lime'
  ];

  // Options
  const sizeOptions = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'NA'];
  const subCategories = {
    Men: ['T-shirt', 'Pant', 'Shirt', 'Sport', 'Banyan', 'Hoodies', 'Tracks', 'Cargo'],
    Women: ['Saree', 'Punjabi', 'Dress', 'Lehnga', 'Kurti', 'T-shirt', 'Pant'],
    Kids: ['T-shirt', 'Pant']
  };

  // Initialize form when product prop/state changes
  useEffect(() => {
    if (effectiveProduct) {
      const product = effectiveProduct;
      setName(product.name || '');
      setPrice(product.price || '');
      setCodAvailable(product.codAvailable ?? true);
      setCategory(product.category || '');
      setSubCategory(product.subCategory || '');
      setSelectedSizes(product.sizes || []);

      const formattedVariants = (product.variants || []).map(variant => ({
        color: variant.color,
        quantity: variant.quantity,
        file: null,
        existingImages: variant.images
      }));

      setVariants(formattedVariants.length ? formattedVariants : [{ file: null, color: '', quantity: 0 }]);
    } else {
      // if no product selected (new product), reset form
      resetForm();
    }
  }, [selectedProduct, routeProduct]);

  const handleVariantChange = (index, field, value) => {
    const newVariants = [...variants];

    if (field === 'quantity') {
      if (value === '') {
        newVariants[index][field] = '';
      } else {
        const numValue = parseInt(value, 10);
        newVariants[index][field] = isNaN(numValue) ? 1 : Math.max(1, numValue);
      }
    } else {
      newVariants[index][field] = value;
    }

    setVariants(newVariants);
  };

  const addVariantField = () => {
    if (variants.length < 10) {
      setVariants([...variants, { file: null, color: '', quantity: 0 }]);
    }
  };

  const removeVariantField = (index) => {
    if (variants.length > 1) {
      const newVariants = [...variants];
      newVariants.splice(index, 1);
      setVariants(newVariants);
    }
  };

  const toggleSize = (size) => {
    setSelectedSizes(prev =>
      prev.includes(size)
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const getColorSuggestions = (input) => {
    if (!input) return colorSuggestions;
    return colorSuggestions.filter(color =>
      color.toLowerCase().includes(input.toLowerCase())
    );
  };

  const validateColor = (color) => {
    return colorSuggestions.some(
      validColor => validColor.toLowerCase() === color.toLowerCase()
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate form
      if (!name || !price || !category || !subCategory || selectedSizes.length === 0) {
        throw new Error('Please fill all required fields');
      }

      // Validate variants
      for (const variant of variants) {
        if ((!variant.file && !variant.existingImages) || !variant.color) {
          throw new Error('Please fill all variant details');
        }

        if (!validateColor(variant.color)) {
          throw new Error(`Please choose a valid color for variant: ${variant.color}. Valid colors are: ${colorSuggestions.join(', ')}`);
        }

        if (variant.quantity < 1 || isNaN(variant.quantity)) {
          throw new Error('Please enter a valid quantity (minimum 1)');
        }

        if (variant.file?.size > 5 * 1024 * 1024) {
          throw new Error(`File ${variant.file.name} exceeds 5MB limit`);
        }
      }

      const formData = new FormData();
      formData.append('name', name);
      formData.append('price', price);
      formData.append('category', category);
      formData.append('subCategory', subCategory);
      formData.append('sizes', selectedSizes.join(','));
      formData.append('codAvailable', codAvailable);

      // If editing via selectedProduct prop, use its _id; else use routeProduct id
      const productId = effectiveProduct?._id;

      if (productId) {
        formData.append('id', productId);
      }

      // Handle image uploads
      variants.forEach((variant) => {
        formData.append('colors', variant.color);
        formData.append('quantities', variant.quantity.toString());

        if (variant.file) {
          const timestamp = Date.now();
          const colorName = variant.color.replace(/\s+/g, '-').toLowerCase();
          const fileName = `${name}-${colorName}-${timestamp}.${variant.file.name.split('.').pop()}`;

          const renamedFile = new File([variant.file], fileName, {
            type: variant.file.type
          });

          formData.append('images', renamedFile);
        } else if (variant.existingImages) {
          variant.existingImages.forEach(img => {
            formData.append('existingImages', img);
          });
        }
      });

      const url = productId
        ? `${import.meta.env.VITE_API_URL}/api/products/${productId}`
        : `${import.meta.env.VITE_API_URL}/api/products`;

      const method = productId ? 'put' : 'post';

      const response = await axios[method](
        url,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000
        }
      );

      alert(productId ? 'Product updated successfully' : 'Product added successfully');

      // Dispatch event so ProductList can refresh
      try {
        window.dispatchEvent(new CustomEvent('productSaved', { detail: response.data }));
      } catch (e) {
        // ignore if environment doesn't support CustomEvent
      }

      // Call parent's onSaved so Dashboard can clear selectedProduct (if provided)
      if (typeof onSaved === 'function') {
        onSaved(response.data);
      }

      // If not embedded (no onSaved provided), navigate back to dashboard like before
      if (typeof onSaved !== 'function') {
        if (!productId) resetForm(); // if creating new product, clear form
        navigate('/dashboard');
      } else {
        // if embedded, clear form for new product case
        if (!productId) resetForm();
      }
    } catch (err) {
      console.error('Product submission error:', err);
      setError(err.response?.data?.error || err.message ||
        (productId ? 'Failed to update product' : 'Failed to add product'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">
        {effectiveProduct ? 'Edit Product' : 'Add New Product'}
      </h2>

      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Product Name*</label>
        <input
          type="text"
          placeholder="Enter product name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="block w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Price*</label>
        <input
          type="number"
          placeholder="Enter price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
          min="0"
          step="0.01"
          className="block w-full p-2 border rounded"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category*</label>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setSubCategory('');
          }}
          required
          className="block w-full p-2 border rounded"
        >
          <option value="">Select Category</option>
          <option value="Men">Men</option>
          <option value="Women">Women</option>
          <option value="Kids">Kids</option>
        </select>
      </div>

      {category && (
        <div>
          <label className="block text-sm font-medium mb-1">Subcategory*</label>
          <select
            value={subCategory}
            onChange={(e) => setSubCategory(e.target.value)}
            required
            className="block w-full p-2 border rounded"
          >
            <option value="">Select Subcategory</option>
            {subCategories[category].map((sc) => (
              <option key={sc} value={sc}>{sc}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Available Sizes*</label>
        <div className="flex flex-wrap gap-2">
          {sizeOptions.map((size) => (
            <button
              type="button"
              key={size}
              onClick={() => toggleSize(size)}
              className={`px-3 py-1 rounded-full text-sm border ${
                selectedSizes.includes(size)
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300'
              }`}
            >
              {size}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg">
        <label className="block text-sm font-medium">COD Available</label>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={codAvailable}
            onChange={(e) => setCodAvailable(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          <span className="ml-2 text-sm font-medium">
            {codAvailable ? 'Yes' : 'No'}
          </span>
        </label>
      </div>

      <div className="space-y-6">
        <label className="block text-sm font-medium">Color Variants*</label>
        {variants.map((variant, index) => (
          <div key={index} className="border p-4 rounded-lg space-y-4">
            <h3 className="font-medium">Variant #{index + 1}</h3>

            <div>
              <label className="block text-sm font-medium mb-1">Image*</label>
              {variant.existingImages?.map((img, imgIndex) => (
                <div key={imgIndex} className="mb-2">
                  <img src={img} alt={`Existing ${variant.color}`} className="h-20 object-cover" />
                  <span className="text-xs text-gray-500">Existing image</span>
                </div>
              ))}

              <div className="relative">
                <label className="flex items-center justify-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
                  <span>{variant.file ? variant.file.name : 'Choose image'}</span>
                  <input
                    type="file"
                    onChange={(e) => handleVariantChange(index, 'file', e.target.files[0])}
                    required={!variant.existingImages}
                    className="sr-only"
                    accept="image/*"
                  />
                </label>
                {variant.file && (
                  <button
                    type="button"
                    onClick={() => handleVariantChange(index, 'file', null)}
                    className="absolute right-0 top-0 -mt-2 -mr-2 p-1 bg-red-500 rounded-full text-white text-xs"
                    aria-label="Remove image"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Color Name*</label>
              <input
                type="text"
                value={variant.color}
                onChange={(e) => handleVariantChange(index, 'color', e.target.value)}
                placeholder="e.g., Red, Blue, Black"
                required
                className="block w-full p-2 border rounded"
                list={`color-suggestions-${index}`}
              />
              <datalist id={`color-suggestions-${index}`}>
                {getColorSuggestions(variant.color).map((color, i) => (
                  <option key={i} value={color} />
                ))}
              </datalist>
              {variant.color && !validateColor(variant.color) && (
                <p className="text-red-500 text-xs mt-1">
                  Suggested colors: {colorSuggestions.join(', ')}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Available Quantity*</label>
              <div className="flex items-center">
                <button
                  type="button"
                  onClick={() => {
                    const newValue = Math.max(1, (variants[index].quantity || 0) - 1);
                    handleVariantChange(index, 'quantity', newValue);
                  }}
                  className="bg-gray-200 px-3 py-1 rounded-l-md hover:bg-gray-300"
                  disabled={variants[index].quantity <= 1}
                >
                  -
                </button>
                <input
                  type="number"
                  value={variants[index].quantity || ''}
                  onChange={(e) => {
                    const value = e.target.value === '' ? '' : Math.max(1, parseInt(e.target.value) || 1);
                    handleVariantChange(index, 'quantity', value);
                  }}
                  onBlur={(e) => {
                    if (e.target.value === '' || e.target.value < 1) {
                      handleVariantChange(index, 'quantity', 1);
                    }
                  }}
                  min="1"
                  className="block w-full p-2 border-t border-b border-gray-300 text-center"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newValue = (variants[index].quantity || 0) + 1;
                    handleVariantChange(index, 'quantity', newValue);
                  }}
                  className="bg-gray-200 px-3 py-1 rounded-r-md hover:bg-gray-300"
                >
                  +
                </button>
              </div>
            </div>

            {variants.length > 1 && (
              <button
                type="button"
                onClick={() => removeVariantField(index)}
                className="bg-red-500 text-white px-3 py-1 rounded text-sm"
              >
                Remove Variant
              </button>
            )}
          </div>
        ))}

        {variants.length < 10 && (
          <button
            type="button"
            onClick={addVariantField}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Add Another Color Variant
          </button>
        )}
      </div>

      <button
        className={`bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full transition ${
          loading ? 'opacity-70 cursor-not-allowed' : ''
        }`}
        type="submit"
        disabled={loading}
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </span>
        ) : (
          effectiveProduct ? 'Update Product' : 'Add Product'
        )}
      </button>
    </form>
  );
}
