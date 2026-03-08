import React, { useState } from 'react';

const OrderSummary = ({ 
  product, 
  initialVariant = 0, 
  initialQuantity = 1,
  onSubmit, 
  onBack 
}) => {
  const [selectedVariant, setSelectedVariant] = useState(initialVariant);
  const [quantity, setQuantity] = useState(initialQuantity);

  if (!product || !product.price) return null; // Added price check

  const variant = product.variants?.[selectedVariant] || {};
  const maxQty = variant.quantity || 0;
  const price = product.price || 0; // Safeguard against undefined price
  const totalPrice = price * quantity;

  const handleQuantityChange = (delta) => {
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= maxQty) {
      setQuantity(newQty);
    }
  };

  const handleVariantSelect = (idx) => {
    setSelectedVariant(idx);
    setQuantity(1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold mb-4">Order Summary</h2>
      
      <div className="border rounded p-4 mb-6">
        {/* Product Info */}
        <div className="flex items-start mb-6">
          {variant.images?.[0] ? (
            <img src={variant.images[0]} alt={product.name} className="w-24 h-24 object-cover mr-4 rounded" />
          ) : (
            <div className="bg-gray-200 border-2 border-dashed rounded-xl w-24 h-24 mr-4" />
          )}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-gray-600">₹{price.toFixed(2)}</p> {/* Changed to use price variable */}
             <span className={`text-xs px-2 py-1 rounded-full ${
              product.codAvailable 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
    {product.codAvailable ? 'COD Available' : 'COD Not Available'}
  </span>
            <p className="text-sm text-gray-500 capitalize">
              {product.category} • {product.subCategory}
            </p>
          </div>
        </div>

        {/* Color / Variant Selection */}
        {product.variants?.length > 0 && ( // Added check for variants
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Select Color:</label>
            <div className="flex flex-wrap gap-4">
              {product.variants.map((v, idx) => (
                <div key={idx} className="flex flex-col items-center">
                  <button
                    onClick={() => handleVariantSelect(idx)}
                    disabled={v.quantity <= 0}
                    className={`w-8 h-8 rounded-full border-2 transition ${
                      selectedVariant === idx ? 'ring-2 ring-blue-500' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: v.color.toLowerCase() }}
                    title={`${v.quantity} available`}
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
        )}

        {/* Quantity & Price */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Quantity</p>
            <div className="flex items-center border rounded mt-1">
              <button
                onClick={() => handleQuantityChange(-1)}
                className="px-3 py-1"
                disabled={quantity <= 1}
              >
                –
              </button>
              <span className="px-4">{quantity}</span>
              <button
                onClick={() => handleQuantityChange(1)}
                className="px-3 py-1"
                disabled={quantity >= maxQty}
              >
                +
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {maxQty > 0
                ? `Max ${maxQty} available`
                : 'Currently out of stock'}
            </p>
          </div>

          <div className="text-right">
            <p className="font-medium">Total Price</p>
            <p className="text-lg font-semibold">₹{totalPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="px-4 py-2 border rounded hover:bg-gray-100"
        >
          Back
        </button>
        <button
          onClick={() => onSubmit(selectedVariant, quantity)}
          disabled={maxQty === 0}
          className={`px-4 py-2 rounded text-white transition ${
            maxQty === 0
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
};

export default OrderSummary;