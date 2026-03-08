import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { FaBox, FaTruck, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaArrowLeft, FaMapMarkerAlt } from 'react-icons/fa';
import DeliveryMap from '../components/DeliveryMap';

const YourOrders = () => {
  const [showMapForOrder, setShowMapForOrder] = useState(null);
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingOrder, setCancellingOrder] = useState(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [returningOrder, setReturningOrder] = useState(null);
  const [returnReason, setReturnReason] = useState('');
  const [expandedOrder, setExpandedOrder] = useState(null);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (!currentUser) return;

        const response = await axios.get(`${API_URL}/api/orders/user/${currentUser._id}`);
        setOrders(response.data);
      } catch (err) {
        setError('Failed to load orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Placed': return <FaBox className="text-blue-500" />;
      case 'Processing': return <FaBox className="text-yellow-500" />;
      case 'Shipped': return <FaTruck className="text-purple-500" />;
      case 'Out for Delivery': return <FaTruck className="text-orange-500" />;
      case 'Delivered': return <FaCheckCircle className="text-green-500" />;
      case 'Cancelled': return <FaTimesCircle className="text-red-500" />;
      default: return <FaInfoCircle className="text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Placed': return 'text-blue-600 bg-blue-50';
      case 'Processing': return 'text-yellow-600 bg-yellow-50';
      case 'Shipped': return 'text-purple-600 bg-purple-50';
      case 'Out for Delivery': return 'text-orange-600 bg-orange-50';
      case 'Delivered': return 'text-green-600 bg-green-50';
      case 'Cancelled': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const toggleDeliveryMap = (orderId) => {
    setShowMapForOrder(showMapForOrder === orderId ? null : orderId);
  };

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  const handleCancelRequest = async (orderId) => {
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/cancel`, {
        reason: cancellationReason
      });

      setOrders(orders.map(order =>
        order._id === orderId ? { ...order, cancellationRequested: true } : order
      ));
      setCancellingOrder(null);
      setCancellationReason('');
      toast.success('Cancellation request submitted');
    } catch (error) {
      console.error('Cancellation failed:', error);
      toast.error('Failed to submit cancellation request');
    }
  };

  const handleReturnRequest = async (orderId) => {
    try {
      await axios.put(`${API_URL}/api/orders/${orderId}/return`, {
        reason: returnReason
      });

      setOrders(orders.map(order =>
        order._id === orderId
          ? { ...order, returnRequested: true, returnStatus: 'Return Requested', returnReason }
          : order
      ));
      setReturningOrder(null);
      setReturnReason('');
      toast.success('Return request submitted');
    } catch (error) {
      console.error('Return request failed:', error);
      toast.error('Failed to submit return request');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FaBox className="mx-auto text-5xl text-gray-300 mb-4" />
          <h2 className="text-xl mb-4">Please login to view your orders</h2>
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Login Now
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <FaTimesCircle className="mx-auto text-5xl text-red-300 mb-4" />
          <p className="text-red-500 text-lg">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40 lg:hidden">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => window.history.back()}
                className="flex items-center text-gray-600 hover:text-gray-800 mr-4"
              >
                <FaArrowLeft className="mr-2" />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Your Orders</h1>
            </div>
            <span className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full font-medium">
              {orders.length}
            </span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-4 lg:py-8">
        {/* Desktop Header */}
        <div className="hidden lg:block mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Orders</h1>
          <p className="text-gray-600">Manage and track your orders</p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 lg:p-12 text-center">
            <FaBox className="mx-auto text-5xl lg:text-6xl text-gray-300 mb-4" />
            <h2 className="text-xl lg:text-2xl font-bold mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6 lg:mb-8 max-w-md mx-auto">
              Your placed orders will appear here. Start shopping to see your order history.
            </p>
            <Link 
              to="/" 
              className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4 lg:space-y-6">
            {orders.map(order => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 p-4 border-b">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                        <p className="font-medium text-gray-900">
                          Order #{order._id.slice(-8).toUpperCase()}
                        </p>
                        <span className="text-sm text-gray-500 mt-1 sm:mt-0">
                          Placed on {formatDateTime(order.createdAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(order.orderStatus)}
                        <span className={`font-medium px-2 py-1 rounded-full text-sm ${getStatusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  {/* Items Summary */}
                  <div className="mb-4">
                    <h3 className="font-medium mb-3 text-gray-900">Items</h3>
                    <div className="space-y-3">
                      {order.items.slice(0, expandedOrder === order._id ? order.items.length : 2).map((item, idx) => (
                        <div key={idx} className="flex items-start space-x-3">
                          {item.product.image ? (
                            <img
                              src={item.product.image}
                              alt={item.product.name}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                            />
                          ) : (
                            <div className="bg-gray-200 border-2 border-dashed rounded-lg w-16 h-16 flex-shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{item.product.name}</p>
                            <p className="text-sm text-gray-600">Color: {item.product.color}</p>
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            <p className="font-medium text-gray-900">₹{(item.priceAtOrder * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {order.items.length > 2 && (
                      <button
                        onClick={() => toggleOrderExpansion(order._id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium mt-2"
                      >
                        {expandedOrder === order._id ? 'Show Less' : `+${order.items.length - 2} more items`}
                      </button>
                    )}
                  </div>

                  {/* Order Summary */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-4">
                    <div className="lg:col-span-2">
                      <h3 className="font-medium mb-2 text-gray-900">Order Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping:</span>
                          <span className="text-green-600">FREE</span>
                        </div>
                        <div className="flex justify-between font-bold border-t pt-2 mt-2">
                          <span>Total:</span>
                          <span>₹{order.totalAmount.toFixed(2)}</span>
                        </div>
                      </div>

                      {/* Tracking Info */}
                      <div className="mt-4 space-y-2">
                        {order.trackingNumber && (
                          <p className="text-sm">
                            <span className="font-medium">Tracking #:</span> {order.trackingNumber}
                          </p>
                        )}
                        {order.estimatedDelivery && (
                          <p className="text-sm">
                            <span className="font-medium">Estimated Delivery:</span> {formatDate(order.estimatedDelivery)}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h3 className="font-medium mb-2 text-gray-900">Delivery Address</h3>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p className="font-medium">{order.shippingAddress.name}</p>
                        <p>{order.shippingAddress.addressLine1}</p>
                        {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                        <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                        <p>Phone: {order.shippingAddress.mobile}</p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Map */}
                  {order.orderStatus === 'Out for Delivery' && order.shippingAddress.location && (
                    <div className="mt-4">
                      <button
                        onClick={() => toggleDeliveryMap(order._id)}
                        className="flex items-center text-blue-600 hover:text-blue-800 text-sm font-medium mb-2"
                      >
                        <FaMapMarkerAlt className="mr-2" />
                        {showMapForOrder === order._id ? 'Hide Delivery Map' : 'View Delivery Map'}
                      </button>
                      {showMapForOrder === order._id && (
                        <div className="h-64 lg:h-80 rounded-lg overflow-hidden border">
                          <DeliveryMap
                            riderId={order.assignedTo?.riderId} 
                            clientLocation={{
                              lat: order.shippingAddress.location.coordinates[1],
                              lng: order.shippingAddress.location.coordinates[0],
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    {!['Delivered', 'Cancelled'].includes(order.orderStatus) && (
                      <button
                        onClick={() => setCancellingOrder(order)}
                        className="px-4 py-2 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
                      >
                        Cancel Order
                      </button>
                    )}

                    {order.orderStatus === 'Delivered' && !order.returnRequested && (
                      <button
                        onClick={() => setReturningOrder(order)}
                        className="px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium"
                      >
                        Request Return
                      </button>
                    )}

                   
                  </div>

                  {/* Status Messages */}
                  <div className="mt-4 space-y-2">
                    {order.cancellationRequested && (
                      <p className="text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-lg">
                        ⏳ Cancellation requested. Waiting for confirmation.
                      </p>
                    )}
                    {order.returnStatus && order.returnStatus !== "N/A" && (
                      <p className="text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                        🔄 Return Status: <span className="font-medium">{order.returnStatus}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cancellation Modal */}
        {cancellingOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto">
              <h3 className="text-lg font-medium mb-3">
                Cancel Order #{cancellingOrder._id.slice(-8).toUpperCase()}
              </h3>
              <p className="text-gray-600 mb-4">Please tell us why you're cancelling this order</p>

              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Reason for cancellation..."
                required
              />

              <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0">
                <button
                  onClick={() => {
                    setCancellingOrder(null);
                    setCancellationReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleCancelRequest(cancellingOrder._id)}
                  disabled={!cancellationReason.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Submit Cancellation
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Return Modal */}
        {returningOrder && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-auto">
              <h3 className="text-lg font-medium mb-3">
                Return Order #{returningOrder._id.slice(-8).toUpperCase()}
              </h3>
              <p className="text-gray-600 mb-4">Please tell us why you want to return this order</p>

              <textarea
                value={returnReason}
                onChange={(e) => setReturnReason(e.target.value)}
                className="w-full p-3 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
                placeholder="Reason for return..."
                required
              />

              <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-3 sm:space-y-0">
                <button
                  onClick={() => {
                    setReturningOrder(null);
                    setReturnReason('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReturnRequest(returningOrder._id)}
                  disabled={!returnReason.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Submit Return Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default YourOrders;