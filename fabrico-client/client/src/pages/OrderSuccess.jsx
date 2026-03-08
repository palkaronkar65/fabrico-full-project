import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCheckCircle } from 'react-icons/fa';

const OrderSuccess = () => {
  const { state } = useLocation();
  const { orderId, address, product, variantIndex, quantity, totalAmount } = state || {};
  const variant = product?.variants?.[variantIndex] || {};

  if (!state) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Order Not Found</h2>
        <Link to="/" className="text-blue-600 hover:underline">
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="bg-white rounded-lg shadow-md p-6 text-center">
        <FaCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
        <h1 className="text-2xl font-bold mb-2">Order Placed Successfully!</h1>
        <p className="text-gray-600 mb-6">
          Your order ID: <span className="font-mono">{orderId}</span>
        </p>

        <div className="border-t border-b py-6 mb-6 text-left">
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          
          <div className="flex items-start mb-4">
            {variant.images?.[0] ? (
              <img 
                src={variant.images[0]} 
                alt={product.name} 
                className="w-16 h-16 object-cover mr-4 rounded"
              />
            ) : (
              <div className="bg-gray-200 border-2 border-dashed rounded-xl w-16 h-16 mr-4" />
            )}
            
            <div>
              <h3 className="font-medium">{product.name}</h3>
              <p className="text-sm text-gray-600">
                Color: {variant.color}, Qty: {quantity}
              </p>
              <p className="font-semibold">₹{totalAmount.toFixed(2)}</p>
            </div>
          </div>
          
          <div className="mt-4">
            <h3 className="font-semibold mb-2">Shipping Address</h3>
            <p>{address.name}</p>
            <p>{address.addressLine1}</p>
            {address.addressLine2 && <p>{address.addressLine2}</p>}
            <p>{address.city}, {address.state} - {address.pincode}</p>
            <p>Phone: {address.mobile}</p>
          </div>
        </div>
            <Link 
            to="/your-orders" 
            className="inline-block bg-gray-800 text-white py-2 px-6 rounded hover:bg-gray-900 ml-4"
            >
            View Your Orders
            </Link>

        <Link 
          to="/" 
          className="inline-block bg-blue-600 text-white py-2 px-6 rounded hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
};

export default OrderSuccess;