// client/src/components/SimplifiedCartProductItem.jsx
import React, { useState } from 'react';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';

const SimplifiedCartProductItem = ({ 
  product, 
  onRemove,
  onBuyNow
}) => {
  const [selectedVariant, setSelectedVariant] = useState(0);
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const variant = product.variants?.[selectedVariant] || {};
  const maxQty = variant.quantity || 0;
  const subtotal = (product.price || 0) * quantity;

  const handleVariantSelect = (idx) => {
    setSelectedVariant(idx);
    setQuantity(1);
  };

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= maxQty) {
      setQuantity(newQty);
    }
  };

 // More robust COD availability check
  const isCodAvailable = () => {
    if (product && product.variants && product.variants[selectedVariant]) {
      return product.variants[selectedVariant].codAvailable !== undefined
        ? product.variants[selectedVariant].codAvailable
        : product.codAvailable !== undefined
          ? product.codAvailable
          : true; // Default value if not specified
    }
    return true; // Fallback
  };

 return (
    <div className="bg-white rounded-lg shadow-md mb-6 p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between">
        <div className="flex">
          {variant.images?.[0] 
            ? <img src={variant.images[0]} alt={product.name} className="w-16 h-16 object-cover rounded mr-4" />
            : <div className="w-16 h-16 bg-gray-200 border-2 border-dashed rounded mr-4" />
          }
          <div>
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <div className="flex items-center gap-2 mt-1">
             <div className={`text-xs px-2 py-1 rounded-full ${
              isCodAvailable()
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {isCodAvailable() ? 'COD Available' : 'COD Not Available'}
            </div>
            <div>
              <p className='text-black font-semibold'>MRP: 
                <span className="text-gray-600">₹ {product.price?.toFixed(2)}</span>
              </p>
              </div>
            </div>
            {/* Remove the duplicate MRP line below */}
            <p className="text-sm text-gray-500 capitalize">
              {product.category} • {product.subCategory}
            </p>
          </div>
        </div>

        <button
          onClick={onRemove}
          className="text-red-500 hover:text-red-700 flex items-center"
        >
          <FaTrash className="mr-1" /> Remove
        </button>
      </div>

      {/* Swatches */}
      <div>
        <p className="text-sm font-medium mb-2">
         Color: <span className="font-medium">{variant.color}</span>
        </p>
        <div className="flex flex-wrap gap-3">
          {product.variants.map((v, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <button
                onClick={() => handleVariantSelect(idx)}
                disabled={v.quantity <= 0}
                className={`w-8 h-8 rounded-full border-2 transition ${
                  selectedVariant === idx ? 'ring-2 ring-blue-500' : 'border-gray-300'
                }`}
                style={{ backgroundColor: v.color.toLowerCase() }}
                title={`${v.color} (${v.quantity} available)`}
              />
              <span className={`text-xs mt-1 ${
                v.quantity > 0 ? 'text-gray-600' : 'text-red-500'
              }`}>
                {v.quantity > 0 ? `${v.quantity} left` : 'Out of stock'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quantity & Subtotal */}
       <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center border rounded overflow-hidden">
            <button
              onClick={() => handleQuantityChange(-1)}
              disabled={quantity <= 1}
              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
            >
              <FaMinus size={12} />
            </button>
            <span className="px-4">{quantity}</span>
            <button
              onClick={() => handleQuantityChange(1)}
              disabled={quantity >= maxQty}
              className="px-3 py-1 hover:bg-gray-100 disabled:opacity-50"
            >
              <FaPlus size={12} />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-1">{maxQty} available</p>
        </div>

        <div className="text-right">
          <p className="font-bold text-lg">Total : <span className="text-lg font-semibold">₹{subtotal.toFixed(2)}</span></p>
          
        </div>
      </div>

      {/* Buy Now */}
      <div className="flex items-center">
       <button
  onClick={() => onBuyNow(product, selectedVariant, quantity)}
  disabled={maxQty === 0}
  className={`ml-auto py-2 px-4 rounded text-white transition ${ maxQty === 0
    ? 'bg-gray-400 cursor-not-allowed'
    : 'bg-blue-600 hover:bg-blue-700'
  }`}
>
  Buy Now
</button>
      </div>
    </div>
  );
};

export default SimplifiedCartProductItem;
