import React, { useState } from 'react';
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa';

const CartProductItem = ({ 
  product, 
  variantsInCart, 
  onRemoveProduct,
  onQuantityChange
}) => {
  const [previewVariantIndex, setPreviewVariantIndex] = useState(0);
  const previewVariant = product.variants?.[previewVariantIndex] || {};
  const totalQuantity = variantsInCart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = product.price * totalQuantity;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Section 1: Product Details + Preview */}
      <div className="p-4 border-b">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-600">₹{product.price}</p>
            <p className="text-sm text-gray-500">
              {product.category} • {product.subCategory}
            </p>
          </div>
          
          <button
            onClick={() => onRemoveProduct(product._id)}
            className="text-red-500 hover:text-red-700 flex items-center"
          >
            <FaTrash className="mr-1" />
            Remove Product
          </button>
        </div>
        
        {/* Preview Section */}
        <div>
          <label className="block text-sm font-medium mb-2">Preview:</label>
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Color Selection Buttons with Quantity */}
            <div className="flex flex-wrap gap-3">
              {product.variants?.map((variant, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <button
                    onClick={() => setPreviewVariantIndex(idx)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      previewVariantIndex === idx ? 'ring-2 ring-blue-500' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: variant.color.toLowerCase() }}
                    title={variant.color}
                    disabled={variant.quantity <= 0}
                  />
                  <span className={`text-xs mt-1 ${
                    variant.quantity <= 0 ? 'text-red-500' : 'text-gray-600'
                  }`}>
                    {variant.quantity > 0 ? `${variant.quantity} left` : 'Out of stock'}
                  </span>
                </div>
              ))}
            </div>
            
            {/* Image Preview */}
            <div className="w-full sm:w-48 h-48 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
              {previewVariant.images?.[0] ? (
                <img
                  src={previewVariant.images[0]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No Image
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Section 2: Selected Variants */}
      <div className="p-4">
        <h4 className="font-medium mb-3">Selected Variants:</h4>
        <div className="space-y-3">
          {variantsInCart.map((item, itemIndex) => {
            const variant = product.variants?.[item.variantIndex] || {};
            return (
              <div key={itemIndex} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center">
                  <div 
                    className="w-6 h-6 rounded-full mr-3"
                    style={{ backgroundColor: variant.color.toLowerCase() }}
                  />
                  <span>{variant.color}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    ({variant.quantity} available)
                  </span>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() => onQuantityChange(product._id, item.variantIndex, item.quantity - 1)}
                      className="px-2 py-1"
                      disabled={item.quantity <= 1}
                    >
                      <FaMinus size={12} />
                    </button>
                    <span className="px-3">{item.quantity}</span>
                    <button
                      onClick={() => onQuantityChange(product._id, item.variantIndex, item.quantity + 1)}
                      className="px-2 py-1"
                      disabled={item.quantity >= variant.quantity}
                    >
                      <FaPlus size={12} />
                    </button>
                  </div>
                  
                 
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Section 3: Product Summary */}
      <div className="p-4 border-t">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium">
              Total Quantity: <span className="text-blue-600">{totalQuantity}</span>
            </p>
            <p className="text-sm text-gray-500">
              {variantsInCart.length} variant{variantsInCart.length !== 1 ? 's' : ''} selected
            </p>
          </div>
          <p className="text-lg font-semibold">
            Total: ₹{totalPrice.toFixed(2)}
          </p>
          <button className='bg-blue-500 text-white px-4 p-1 rounded-2xl  '>buy</button>
        </div>
      </div>
    </div>
  );
};

export default CartProductItem;  